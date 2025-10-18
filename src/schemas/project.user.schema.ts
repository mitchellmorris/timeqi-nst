import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from './project.schema';
import { User } from './user.schema';
import { Organization } from './organization.schema';
import { Scenario } from './scenario.schema';
import { SchemaMixin } from './schema-mixin';
import { DEFAULT_WORKDAYS } from '@betavc/timeqi-sh';

const BaseSchema = SchemaMixin([Scenario], {
  excludeFields: ['startDate'],
});

export type ProjectUserDocument = HydratedDocument<ProjectUser>;

@Schema({ collection: 'project.users' })
export class ProjectUser extends BaseSchema {
  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId | Project;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  // Scheduling fields - manually added since mixin isn't working properly
  @Prop({ type: Number, default: 8 })
  workshift: number;

  @Prop({ type: [String], default: DEFAULT_WORKDAYS })
  weekdays: string[];

  @Prop({ type: String, default: 'UTC' })
  timezone: string;

  @Prop({ type: Number, default: 0 })
  endOfDayHour: number;

  @Prop({ type: Number, default: 0 })
  endOfDayMin: number;
}

export const ProjectUserSchema = SchemaFactory.createForClass(ProjectUser);
// Middleware to update the updatedAt field on save and update
ProjectUserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProjectUserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
