import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SchedulingDto } from './create-scheduling.dto';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class CreateOrganizationDto extends SchedulingDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsObjectId()
  @IsNotEmpty()
  sponsor: Types.ObjectId;
}
