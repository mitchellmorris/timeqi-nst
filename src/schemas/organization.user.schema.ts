import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Organization } from './organization.schema';
import { SchemaMixin } from './schema-mixin';
import { Scheduling } from './scheduling.schema';
import { Scenario } from './scenario.schema';

export type OrganizationUserDocument = HydratedDocument<OrganizationUser>;

const BaseSchema = SchemaMixin([Scheduling, Scenario], {
  excludeFields: ['startDate', 'forecast', 'projection'],
});

@Schema({ collection: 'organization.users' })
export class OrganizationUser extends BaseSchema {
  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;
}

export const OrganizationUserSchema =
  SchemaFactory.createForClass(OrganizationUser);
// Middleware to update the updatedAt field on save and update
OrganizationUserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

OrganizationUserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
