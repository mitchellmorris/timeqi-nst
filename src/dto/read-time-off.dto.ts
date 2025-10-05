import { IsISO8601 } from 'class-validator';
import { CreateTimeOffDto } from './create-time-off.dto';

export class TimeOffDto extends CreateTimeOffDto {
  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
