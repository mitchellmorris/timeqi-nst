import { IsNotEmpty, IsString } from 'class-validator';
/**
 * Not including organizations, projects, tasks, and timeOff in the DTO
 * as they are populated and managed through other means.
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
