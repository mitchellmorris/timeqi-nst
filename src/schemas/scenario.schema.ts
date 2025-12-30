import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, _id: false })
export class Scenario {
  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Number, default: 0 })
  estimate: number;

  @Prop({ type: Date })
  targetDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Number, default: 0 })
  workedHours: number;

  // This might be calculated on the fly
  // @Prop({ type: Number, default: 0 })
  // elapsedHours: number;
}

export type ScenarioDocument = Scenario & Document;
