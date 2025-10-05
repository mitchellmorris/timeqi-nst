import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SchedulingDto } from './create-scheduling.dto';

export class CreateOrganizationUserDto extends SchedulingDto {
  @IsObjectId()
  @IsNotEmpty()
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  user: Types.ObjectId;
}
