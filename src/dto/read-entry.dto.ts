import { IntersectionType } from '@nestjs/mapped-types';
import { CreateEntryDto } from './create-entry.dto';
import { ScenarioDto } from './read-scenario.dto';
import { IsISO8601 } from 'class-validator';

export class EntryDto extends IntersectionType(
  CreateEntryDto,
  ScenarioDto,
  // OmitType(ScenarioDto, ['forecast'] as const),
) {
  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
