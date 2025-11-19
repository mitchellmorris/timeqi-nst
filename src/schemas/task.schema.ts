import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Project } from './project.schema';
import { Organization } from './organization.schema';
import { Scenario } from './scenario.schema';
import { SchemaMixin } from './schema-mixin';
import { Scheduling } from './scheduling.schema';

const BaseSchema = SchemaMixin([Scenario, Scheduling]);

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  index: number;

  @Prop({ type: Boolean, default: false })
  locked: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sponsor: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId | Project;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[] | User[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('toObject', { virtuals: true });
TaskSchema.set('toJSON', { virtuals: true });
// Middleware to update the updatedAt field on save and update
TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

TaskSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

TaskSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'task',
});
