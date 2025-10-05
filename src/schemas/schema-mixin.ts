import { Type } from '@nestjs/common';
import { SchemaOptions } from '@nestjs/mongoose';
import 'reflect-metadata'; // Ensure reflect-metadata is imported if not globally available

/**
 * ----------------------------------------------------------------------
 * CORE TYPESCRIPT UTILITIES TO RESOLVE INHERITANCE AND INTERSECTION
 * ----------------------------------------------------------------------
 * These types ensure that the resulting class correctly inherits the
 * properties (for TypeScript) from all input schemas.
 */

// 1. Define a robust Type constraint for the schemas
type SchemaType = Type<any>;

// 2. Utility type to convert a tuple/array of types (T[]) into an intersection (T1 & T2 & ...)
type Intersection<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? Head & Intersection<Tail extends any[] ? Tail : []>
  : unknown;

// 3. Utility to extract InstanceTypes from an array of Schemas and convert them to an intersection.
type SchemaInstanceIntersection<T extends SchemaType[]> = Intersection<
  {
    [K in keyof T]: T[K] extends SchemaType ? InstanceType<T[K]> : never;
  } & any[]
>;

/**
 * MixinOptions extends the standard Mongoose SchemaOptions to include a way
 * to specify fields that should NOT be inherited during the mixin process.
 */
interface MixinOptions extends SchemaOptions {
  /**
   * Array of property names (strings) to exclude from being copied
   * from the base schemas into the resulting mixed schema.
   */
  excludeFields?: string[];
}

/**
 * Mongoose Schema Mixin Factory
 *
 * This function dynamically creates a new class that inherits Mongoose metadata
 * (@Prop decorators) and TypeScript properties from the provided base schema classes,
 * while allowing specified fields to be excluded.
 *
 * @param Schemas An array of classes decorated with @Schema() (e.g., [Timestamp, SoftDelete]).
 * @param options Optional MixinOptions, including Mongoose Schema options and an array of fields to exclude.
 * @returns A new class type that represents the combined schema.
 */
export function SchemaMixin<T extends SchemaType[]>(
  Schemas: [...T],
  options: MixinOptions = {},
): Type<SchemaInstanceIntersection<T>> {
  // Destructure to separate the custom 'excludeFields' from the standard Mongoose options.
  // The 'mongooseOptions' variable now correctly contains only SchemaOptions properties.
  const { excludeFields = [], ...mongooseOptions } = options;

  // The anonymous class that will serve as the combined schema
  class MixedSchema {}

  // ----------------------------------------------------------------------
  // RUNTIME LOGIC: Copy Mongoose Metadata (with exclusion)
  // ----------------------------------------------------------------------
  for (const Schema of Schemas) {
    // 1. Handle Prototype (Mongoose @Prop fields and instance methods)
    const prototypeProperties = Object.getOwnPropertyNames(Schema.prototype);

    for (const propName of prototypeProperties) {
      if (propName === 'constructor' || excludeFields.includes(propName)) {
        continue; // Skip constructor and explicitly excluded fields
      }

      // Copy the property descriptor (value, getters/setters, etc.)
      const descriptor = Object.getOwnPropertyDescriptor(
        Schema.prototype,
        propName,
      );
      if (descriptor) {
        Object.defineProperty(MixedSchema.prototype, propName, descriptor);
      }

      // CRITICAL STEP: Copy Mongoose metadata for the property
      // This is what tells SchemaFactory that this property has the @Prop() decorator.
      const metadataKeys = Reflect.getMetadataKeys(
        Schema.prototype as object,
        propName,
      );

      for (const key of metadataKeys) {
        const metadata: unknown = Reflect.getMetadata(
          key,
          Schema.prototype as object,
          propName,
        );
        Reflect.defineMetadata(key, metadata, MixedSchema.prototype, propName);
      }
    }

    // 2. Handle Statics (Mongoose static methods and class properties)
    const staticProperties = Object.getOwnPropertyNames(Schema);
    for (const propName of staticProperties) {
      // Exclude standard class/function properties
      if (['prototype', 'length', 'name'].includes(propName)) {
        continue;
      }
      // Skip static methods/properties if their name is in the exclusion list
      if (excludeFields.includes(propName)) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(Schema, propName);
      if (descriptor) {
        Object.defineProperty(MixedSchema, propName, descriptor);
      }
    }
  }

  // Apply the final Mongoose Schema options to the combined class
  Reflect.defineMetadata('MongooseSchemaOptions', mongooseOptions, MixedSchema);

  // Return the new class, cast to the calculated intersection type
  return MixedSchema as Type<SchemaInstanceIntersection<T>>;
}
