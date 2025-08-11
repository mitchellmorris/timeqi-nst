import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Task } from './task.schema';
import { User } from './user.schema';
import { Organization } from './organization.schema';
import { TimeOff } from './time-off.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // ObjectId referencing User
  sponsor: User; // User document

  @Prop({ type: Types.ObjectId, ref: 'Organization' }) // ObjectId referencing Organization
  organization: Organization; // Organization document

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }] }) // Array of ObjectIds referencing Task
  tasks: Task[]; // Array of Task documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) // Array of ObjectIds referencing User
  users: User[]; // Array of User documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TimeOff' }] }) // Array of ObjectIds referencing TimeOff
  timeOff: TimeOff[]; // Array of TimeOff documents
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
