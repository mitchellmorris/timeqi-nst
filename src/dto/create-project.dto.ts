import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
/**
 * Not including tasks, users, and timeOff as they are not required for project creation.
 */
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsISO8601()
  readonly startDate: string;

  @IsNumber()
  readonly pitch: number;

  @IsNumber()
  readonly fulfillment: number;

  @IsNumber()
  readonly accuracy: number;

  @IsNumber()
  readonly estimate: number;

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  sponsor: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  organization: Types.ObjectId; // Type it as Mongoose's ObjectId
}
