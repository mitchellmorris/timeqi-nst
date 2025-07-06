import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Task } from './task.schema';
import { User } from './user.schema';
import { Project } from './project.schema';
import { Organization } from './organization.schema';

export type EntryDocument = HydratedDocument<Entry>;

@Schema()
export class Entry {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // ObjectId referencing User
  performer: User; // User document

  @Prop({ type: Types.ObjectId, ref: 'Project' }) // ObjectId referencing Project
  project: Project; // Project document

  @Prop({ type: Types.ObjectId, ref: 'Task' }) // ObjectId referencing Task
  task: Task; // Task document

  @Prop({ type: Types.ObjectId, ref: 'Organization' }) // ObjectId referencing Organization
  organization: Organization; // Organization document
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
