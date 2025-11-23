import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Organization } from './organization.schema';
import { SchemaFields } from './schema-composition';

export type ProjectDocument = HydratedDocument<Project>;
@Schema({ collection: 'projects', timestamps: true })
export class Project {
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

// Add fields from Scenario and Scheduling schemas
ProjectSchema.add(SchemaFields.scenarioWithScheduling);

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
