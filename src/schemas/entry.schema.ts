import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Task } from './task.schema';
import { User } from './user.schema';
import { Project } from './project.schema';
import { Organization } from './organization.schema';
import { SchemaMixin } from './schema-mixin';
import { Scenario } from './scenario.schema';

const BaseSchema = SchemaMixin([Scenario]);

export type EntryDocument = HydratedDocument<Entry>;

@Schema()
export class Entry extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  hours: number;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  performer: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId | Project;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  task: Types.ObjectId | Task;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
// Middleware to update the updatedAt field on save and update
EntrySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

EntrySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
