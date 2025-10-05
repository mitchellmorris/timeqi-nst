import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';

export class CreateTaskUserDto {
  @IsObjectId()
  @IsNotEmpty()
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  project: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  task: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  user: Types.ObjectId;
}
