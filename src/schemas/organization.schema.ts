import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from './project.schema';
import { User } from './user.schema';
import { TimeOff } from './time-off.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // ObjectId referencing User
  sponsor: User; // User document

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] }) // Array of ObjectIds referencing Project
  projects: Project[]; // Array of Project documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) // Array of ObjectIds referencing User
  users: User[]; // Array of User documents
  
  @Prop({ type: [{ type: Types.ObjectId, ref: 'TimeOff' }] }) // Array of ObjectIds referencing TimeOff
  timeOff: TimeOff[]; // Array of TimeOff documents
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
