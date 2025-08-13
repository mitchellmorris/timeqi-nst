import { IsArray, IsIn, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
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

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  sponsor: Types.ObjectId; // Type it as Mongoose's ObjectId
}
