import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly date: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly createdAt: string;

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  performer: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  organization: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  project: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  task: Types.ObjectId; // Type it as Mongoose's ObjectId
}
