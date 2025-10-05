import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { ScenarioDto } from './read-scenario.dto';
import { IsISO8601 } from 'class-validator';
import { CreateOrganizationUserDto } from './create-organization.user.dto';

export class OrganizationUserDto extends IntersectionType(
  CreateOrganizationUserDto,
  OmitType(ScenarioDto, ['startDate', 'forecast', 'projection'] as const),
) {
  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
