import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from './project.schema';
import { User } from './user.schema';

export type ProjectUserDocument = HydratedDocument<ProjectUser>;

@Schema()
export class ProjectUser {
  @Prop()
  pitch: number;

  @Prop()
  fulfillment: number;

  @Prop()
  accuracy: number;

  @Prop()
  estimate: number;

  @Prop()
  hours: number;

  @Prop()
  weekdays: string[];

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project: Project;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;
}

export const ProjectUserSchema = SchemaFactory.createForClass(ProjectUser);
