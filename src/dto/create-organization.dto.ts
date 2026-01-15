import { IsNotEmpty, IsString } from 'class-validator';
import { SchedulingDto } from './create-scheduling.dto';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class CreateOrganizationDto extends SchedulingDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
