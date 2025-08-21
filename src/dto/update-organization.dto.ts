import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsArray, IsIn, IsString, Max, Min } from 'class-validator';
import { WEEKDAYS as RAW_WEEKDAYS } from '@betavc/timeqi-sh';
const WEEKDAYS: readonly string[] = RAW_WEEKDAYS as readonly string[];
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsString()
  readonly name: string;

  @Min(1)
  @Max(24)
  readonly workshift: number;

  @IsArray()
  @IsIn(WEEKDAYS, { each: true })
  readonly weekdays: string[];
}
