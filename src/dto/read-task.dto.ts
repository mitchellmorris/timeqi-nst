import { IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { CreateTaskDto } from './create-task.dto';
import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { ScenarioDto } from './read-scenario.dto';
/**
 * Not including entries and users as they are not required for task creation.
 */
export class TaskDto extends IntersectionType(
  CreateTaskDto,
  OmitType(ScenarioDto, [
    // inherited from CreateProjectDto
    'startDate',
    'estimate',
  ] as const),
) {
  @IsArray()
  @IsObjectId({ each: true })
  users: Types.ObjectId[];
}
