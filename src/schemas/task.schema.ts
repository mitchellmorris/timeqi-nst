import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Project } from './project.schema';
import { Organization } from './organization.schema';
import { SchemaFields } from './schema-composition';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ collection: 'tasks', timestamps: true })
export class Task {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  index: number;

  @Prop({ type: Boolean, default: false })
  locked: boolean;

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

// Create the base schema
const TaskSchema = SchemaFactory.createForClass(Task);

// Add fields from Scenario and Scheduling schemas
TaskSchema.add(SchemaFields.scenarioWithScheduling);

TaskSchema.set('toObject', { virtuals: true });
TaskSchema.set('toJSON', { virtuals: true });

TaskSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'task',
});

TaskSchema.virtual('timeOff', {
  ref: 'TimeOff',
  localField: '_id',
  foreignField: 'target',
  match: { type: 'Task' },
});

export { TaskSchema };
