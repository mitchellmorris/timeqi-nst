import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { ITimeOff } from '../interface/time-off.interface';

export class CreateTimeOffDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly startDate: Date;

  @IsNumber()
  readonly days: number;

  @IsNumber()
  readonly trailingTime: number;

  @IsObjectId()
  @IsNotEmpty()
  readonly target: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  readonly type: ITimeOff['type'];
}
