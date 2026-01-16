import { Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Organization } from './organization.schema';
import { Project } from './project.schema';
import { User } from './user.schema';
import { Task } from './task.schema';

@Schema({
  collection: 'timeoff',
})
export class TimeOff {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  startDate: string;

  @Prop({ type: Number, required: true })
  days: number;

  @Prop({ type: Number, required: true })
  trailingTime: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  users: Types.ObjectId[] | User[];
  // ObjectId reference to any of the three collections
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    refPath: 'type',
  })
  target: Types.ObjectId | Organization | Project | Task;
  // The model name (used for population)
  @Prop({
    type: String,
    enum: ['Organization', 'Project', 'Task'],
    required: true,
  })
  type: ['Organization' | 'Project' | 'Task'];
}

export const TimeOffSchema = SchemaFactory.createForClass(TimeOff);
// Middleware to update the updatedAt field on save and update
TimeOffSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

TimeOffSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
