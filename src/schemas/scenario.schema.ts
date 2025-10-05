import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Scenario {
  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  targetDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Number, default: 0 })
  estimate: number;

  @Prop({ type: Number, default: 0 })
  workedHours: number;

  @Prop({ type: Number, default: 0 })
  elapsedHours: number;
}
