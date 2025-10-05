import { IsISO8601, IsNumber } from 'class-validator';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class CreateScenarioDto {
  @IsISO8601()
  readonly startDate: string;

  @IsNumber()
  readonly estimate: number;

  @IsNumber()
  readonly forecast: number;
}
