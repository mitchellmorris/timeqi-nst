import { IsArray, IsIn, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateProjectUserDto {
  @IsNumber()
  readonly pitch: number = 1;

  @IsNumber()
  readonly fulfillment: number = 1;

  @IsNumber()
  readonly accuracy: number = 1;

  @IsNumber()
  readonly estimate: number = 0;

  @IsNumber()
  readonly hours: number = 0;

  @IsNumber()
  readonly expectation: number = 0;

  @Min(1)
  @Max(24)
  readonly workshift: number;

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
