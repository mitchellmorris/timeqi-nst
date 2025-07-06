import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateOrganizationDto {
  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  sponsor: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
