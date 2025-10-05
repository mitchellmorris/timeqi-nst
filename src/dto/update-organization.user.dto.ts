import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationUserDto } from './create-organization.user.dto';
export class UpdateOrganizationUserDto extends PartialType(
  OmitType(CreateOrganizationUserDto, [
    // can't assign new organization or user
    'organization',
    'user',
  ] as const),
) {}
