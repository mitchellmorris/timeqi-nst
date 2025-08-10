import { Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'timeoff',
})
export class TimeOff {
  @Prop()
  name: string;

  // ObjectId reference to any of the three collections
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
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
