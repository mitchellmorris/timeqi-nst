import { IsISO8601, IsNumber } from 'class-validator';
import { CreateScenarioDto } from './create-scenario.dto';
import { PartialType } from '@nestjs/mapped-types';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class ScenarioDto extends PartialType(CreateScenarioDto) {
  @IsNumber()
  readonly projection: number;

  @IsISO8601()
  readonly targetDate: string;

  @IsISO8601()
  readonly endDate: string;

  @IsNumber()
  readonly elapsedHours: number;

  @IsNumber()
  readonly workedHours: number;
}
