import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
/**
 * Not including entries and users as they are not required for task creation.
 */
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly pitch: number;

  @IsNumber()
  readonly fulfillment: number;

  @IsNumber()
  readonly accuracy: number;

  @IsNumber()
  readonly estimate: number;

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  assignee: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  organization: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  project: Types.ObjectId; // Type it as Mongoose's ObjectId
}
