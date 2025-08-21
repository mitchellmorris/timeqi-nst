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
import { WEEKDAYS as RAW_WEEKDAYS } from '@betavc/timeqi-sh';
const WEEKDAYS: readonly string[] = RAW_WEEKDAYS as readonly string[];
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
  @IsIn(WEEKDAYS, { each: true })
  readonly weekdays: string[];
}
