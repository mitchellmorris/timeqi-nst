import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, [
    // can't assign new organization or project
    'organization',
    'project',
  ] as const),
) {}
