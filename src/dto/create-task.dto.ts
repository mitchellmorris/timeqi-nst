import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateTaskDto {
  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  assignee: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  organization: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  project: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
