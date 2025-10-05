import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { CreateUserDto } from './create-user.dto';
/**
 * Not including organizations, projects, tasks, and timeOff in the DTO
 * as they are populated and managed through other means.
 */
export class UserDto extends CreateUserDto {
  @IsArray()
  @IsObjectId({ each: true })
  organizations: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  projects: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  tasks: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  timeOff: Types.ObjectId[];
}
