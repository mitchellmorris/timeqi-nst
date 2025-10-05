import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SignInDto } from './sign-in.dto';
/**
 * Not including organizations, projects, tasks, and timeOff in the DTO
 * as they are populated and managed through other means.
 */
export class CreateUserDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
