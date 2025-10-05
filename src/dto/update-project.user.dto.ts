import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectUserDto } from './create-project.user.dto';
export class UpdateProjectUserDto extends PartialType(
  OmitType(CreateProjectUserDto, [
    // can't assign new organization or project or user
    'organization',
    'project',
    'user',
  ] as const),
) {}
