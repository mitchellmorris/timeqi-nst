import { Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'timeoff',
})
export class TimeOff {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  startDate: string;

  @Prop({ type: Number })
  days: number;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Number })
  extendedHours: number;
  // ObjectId reference to any of the three collections
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    refPath: 'target',
  })
  target: Types.ObjectId;
  // The model name (used for population)
  @Prop({
    type: String,
    enum: ['User', 'Organization', 'Project'],
    required: true,
  })
  type: ['User' | 'Organization' | 'Project'];
}

export const TimeOffSchema = SchemaFactory.createForClass(TimeOff);
