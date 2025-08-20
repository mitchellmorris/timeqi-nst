import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import {
  IsArray,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly pitch: number;

  @IsNumber()
  readonly fulfillment: number;

  @IsNumber()
  readonly accuracy: number;

  @IsNumber()
  readonly estimate: number;

  @IsISO8601()
  @IsNotEmpty()
  readonly updatedAt: string;

  @Min(1)
  @Max(24)
  readonly workshift: number;

  @IsArray()
  @IsIn(
    [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    { each: true },
  )
  readonly weekdays: string[];
}
