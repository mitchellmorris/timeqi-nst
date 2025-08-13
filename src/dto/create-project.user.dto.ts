import { IsArray, IsIn, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateProjectUserDto {
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

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  project: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  user: Types.ObjectId; // Type it as Mongoose's ObjectId
}
