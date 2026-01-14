import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly hours: number;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly date: Date;

  @IsObjectId()
  @IsNotEmpty()
  performer: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  project: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  task: Types.ObjectId;
}
