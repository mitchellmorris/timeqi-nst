import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, [
    // can't assign new organization
    'organization',
  ] as const),
) {}
