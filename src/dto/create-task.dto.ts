import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SchedulingDto } from './create-scheduling.dto';
import { CreateScenarioDto } from './create-scenario.dto';
/**
 * Not including entries and users as they are not required for task creation.
 */
export class CreateTaskDto extends IntersectionType(
  SchedulingDto,
  OmitType(CreateScenarioDto, [
    // forecast is maintained through entries
    'forecast',
  ] as const),
) {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @IsNotEmpty()
  readonly index: number;

  @IsObjectId()
  assignee: Types.ObjectId;

  @IsObjectId()
  sponsor: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  project: Types.ObjectId;
}
