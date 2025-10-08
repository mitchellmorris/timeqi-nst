import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Task } from './task.schema';
import { Organization } from './organization.schema';
import { SchemaMixin } from './schema-mixin';
import { Scenario } from './scenario.schema';
import { Project } from '@betavc/timeqi-sh';

const BaseSchema = SchemaMixin([Scenario], {
  excludeFields: [
    'startDate',
    'estimate',
    'forecast',
    'projection',
    'targetDate',
    'endDate',
  ],
});

export type TaskUserDocument = HydratedDocument<TaskUser>;

@Schema({ collection: 'task.users' })
export class TaskUser extends BaseSchema {
  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId | Project;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  task: Types.ObjectId | Task;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;
}

export const TaskUserSchema = SchemaFactory.createForClass(TaskUser);
// Middleware to update the updatedAt field on save and update
TaskUserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

TaskUserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
