import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { IsArray, IsISO8601 } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { ScenarioDto } from './read-scenario.dto';
import { IsObjectId } from 'nestjs-object-id';
import { Types } from 'mongoose';

/**
 * Not including tasks, users, and timeOff as they are not required for project creation.
 */
export class ProjectDto extends IntersectionType(
  CreateProjectDto,
  OmitType(ScenarioDto, [
    // inherited from CreateProjectDto
    'startDate',
    'estimate',
  ] as const),
) {
  @IsArray()
  @IsObjectId({ each: true })
  users: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  tasks: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  timeOff: Types.ObjectId[];

  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
