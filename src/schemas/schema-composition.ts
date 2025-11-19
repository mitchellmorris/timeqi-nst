import { SchemaFactory } from '@nestjs/mongoose';
import { Scenario } from './scenario.schema';
import { Scheduling } from './scheduling.schema';

/**
 * Simple utility to get field definitions from a schema class.
 * This is what actually works with NestJS Mongoose.
 */
export function getSchemaFields(
  schemaClass: new () => any,
): Record<string, any> {
  const schema = SchemaFactory.createForClass(schemaClass);
  return Object.fromEntries(
    Object.entries(schema.obj).filter(
      ([key]) => !['_id', '__v', 'id'].includes(key),
    ),
  );
}

/**
 * Pre-built field sets for common schemas
 */
export const SchemaFields = {
  scenario: getSchemaFields(Scenario),
  scheduling: getSchemaFields(Scheduling),

  // Combined field set for tasks
  scenarioWithScheduling: {
    ...getSchemaFields(Scenario),
    ...getSchemaFields(Scheduling),
  },
};
