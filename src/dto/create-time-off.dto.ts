import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { ITimeOff } from 'src/interface/time-off.interface';

export class CreateTimeOffDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsObjectId() // Validates if the string is a valid MongoDB ObjectId
  @IsNotEmpty()
  target: Types.ObjectId; // Type it as Mongoose's ObjectId

  @IsString()
  @IsNotEmpty()
  readonly type: ITimeOff['type']; // The model name (used for population)
}
