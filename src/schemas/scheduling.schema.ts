import { DEFAULT_WORKDAYS } from '@betavc/timeqi-sh';
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, _id: false })
export class Scheduling {
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

export type SchedulingDocument = Scheduling & Document;
