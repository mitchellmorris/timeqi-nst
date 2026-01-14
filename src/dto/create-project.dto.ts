import { IntersectionType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SchedulingDto } from './create-scheduling.dto';
import { CreateScenarioDto } from './create-scenario.dto';
/**
 * Not including tasks, users, and timeOff as they are not required for project creation.
 */
export class CreateProjectDto extends IntersectionType(
  SchedulingDto,
  CreateScenarioDto,
  // OmitType(CreateScenarioDto, ['forecast'] as const),
) {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsObjectId()
  @IsNotEmpty()
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  sponsor: Types.ObjectId;
}
