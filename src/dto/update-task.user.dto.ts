import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskUserDto } from './create-task.user';
export class UpdateTaskUserDto extends PartialType(
  OmitType(CreateTaskUserDto, [
    // can't assign new organization, project, task, or user
    'organization',
    'project',
    'task',
    'user',
  ] as const),
) {}
