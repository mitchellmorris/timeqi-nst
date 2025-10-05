import { WEEKDAYS } from '@betavc/timeqi-sh';
import { IsArray, IsIn, IsNumber, IsString, Max, Min } from 'class-validator';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class SchedulingDto {
  @Min(1)
  @Max(24)
  readonly workshift: number;

  @IsArray()
  @IsIn(WEEKDAYS, { each: true })
  readonly weekdays: string[];

  @IsString()
  readonly timezone: string;

  @IsNumber()
  @Min(0)
  @Max(23)
  readonly endOfDayHour: number;

  @IsNumber()
  @Min(0)
  @Max(59)
  readonly endOfDayMin: number;
}
