import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeOffDto } from './create-time-off.dto';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class UpdateTimeOffDto extends PartialType(CreateTimeOffDto) {
  @IsString()
  readonly name: string;

  @IsISO8601()
  readonly startDate: string;

  @IsNumber()
  readonly days: number;

  @IsNumber()
  readonly extendedHours: number;

  @IsISO8601()
  @IsNotEmpty()
  readonly updatedAt: string;
}
