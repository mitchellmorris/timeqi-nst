import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from './project.schema';
import { User } from './user.schema';
import { Scheduling } from './scheduling.schema';
import { SchemaMixin } from './schema-mixin';

export type OrganizationDocument = HydratedDocument<Organization>;
const BaseSchema = SchemaMixin([Scheduling]);
@Schema()
export class Organization extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sponsor: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project', default: [] }] })
  projects: Types.ObjectId[] | Project[];

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.set('toObject', { virtuals: true });
OrganizationSchema.set('toJSON', { virtuals: true });

OrganizationSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'organization',
});

OrganizationSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'organization',
});

OrganizationSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organizations',
});

OrganizationSchema.virtual('timeOff', {
  ref: 'TimeOff',
  localField: '_id',
  foreignField: 'target',
});
