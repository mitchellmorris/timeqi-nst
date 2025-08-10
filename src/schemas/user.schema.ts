import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Organization } from './organization.schema';
import { Project } from './project.schema';
import { Task } from './task.schema';
import { TimeOff } from './time-off.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }] }) // Array of ObjectIds referencing Post
  organizations: Organization[]; // Array of Post documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] }) // Array of ObjectIds referencing Project
  projects: Project[]; // Array of Project documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }] }) // Array of ObjectIds referencing Task
  tasks: Task[]; // Array of Task documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TimeOff' }] }) // Array of ObjectIds referencing TimeOff
  timeOff: TimeOff[]; // Array of TimeOff documents
}

export const UserSchema = SchemaFactory.createForClass(User);
