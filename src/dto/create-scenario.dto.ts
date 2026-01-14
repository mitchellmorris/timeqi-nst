import { IsISO8601, IsNumber, IsOptional } from 'class-validator';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class CreateScenarioDto {
  @IsOptional()
  @IsISO8601()
  readonly startDate: string;

  @IsNumber()
  @IsOptional()
  readonly estimate: number;
}
