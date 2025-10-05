import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Organization } from './organization.schema';
import { Scheduling } from './scheduling.schema';
import { Scenario } from './scenario.schema';
import { SchemaMixin } from './schema-mixin';

export type ProjectDocument = HydratedDocument<Project>;

const BaseSchema = SchemaMixin([Scheduling, Scenario]);

@Schema()
export class Project extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sponsor: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[] | User[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
// Middleware to update the updatedAt field on save and update
ProjectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProjectSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

ProjectSchema.set('toObject', { virtuals: true });
ProjectSchema.set('toJSON', { virtuals: true });

ProjectSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'project',
});

ProjectSchema.virtual('timeOff', {
  ref: 'TimeOff',
  localField: '_id',
  foreignField: 'target',
});

ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});
