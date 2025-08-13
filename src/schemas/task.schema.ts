import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Entry } from './entry.schema';
import { User } from './user.schema';
import { Project } from './project.schema';
import { Organization } from './organization.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  pitch: number;

  @Prop({ type: Number })
  estimate: number;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // ObjectId referencing User
  assignee: User; // User document

  @Prop({ type: Types.ObjectId, ref: 'Project' }) // ObjectId referencing Project
  project: Project; // Project document

  @Prop({ type: Types.ObjectId, ref: 'Organization' }) // ObjectId referencing Organization
  organization: Organization; // Organization document

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Entry' }] }) // Array of ObjectIds referencing Entry
  entries: Entry[]; // Array of Entry documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) // Array of ObjectIds referencing User
  users: User[]; // Array of User documents
}

export const TaskSchema = SchemaFactory.createForClass(Task);
