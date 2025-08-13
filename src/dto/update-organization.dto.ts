import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsArray, IsIn, IsString, Max, Min } from 'class-validator';
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsString()
  readonly name: string;

  @Min(1)
  @Max(24)
  readonly hours: number;

  @IsArray()
  @IsIn(
    [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    { each: true },
  )
  readonly weekdays: string[];
}
