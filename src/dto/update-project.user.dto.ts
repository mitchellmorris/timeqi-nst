import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectUserDto } from './create-project.user.dto';
import { IsArray, IsIn, IsNumber, Max, Min } from 'class-validator';
export class UpdateProjectUserDto extends PartialType(CreateProjectUserDto) {
  @IsNumber()
  readonly pitch: number;

  @IsNumber()
  readonly fulfillment: number;

  @IsNumber()
  readonly accuracy: number;

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
