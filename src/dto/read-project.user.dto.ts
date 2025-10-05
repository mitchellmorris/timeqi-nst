import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { ScenarioDto } from './read-scenario.dto';
import { CreateProjectUserDto } from './create-project.user.dto';
import { IsISO8601 } from 'class-validator';

export class ProjectUserDto extends IntersectionType(
  CreateProjectUserDto,
  OmitType(ScenarioDto, ['startDate'] as const),
) {
  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
