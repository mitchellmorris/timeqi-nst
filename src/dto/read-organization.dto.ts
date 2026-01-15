import { IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { CreateOrganizationDto } from './create-organization.dto';
import { Transform } from 'class-transformer';
import { objectIdArrayTrnfmr } from './dto-helpers';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class OrganizationDto extends CreateOrganizationDto {
  @IsArray()
  @IsObjectId({ each: true })
  @Transform(objectIdArrayTrnfmr)
  users: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  @Transform(objectIdArrayTrnfmr)
  projects: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  @Transform(objectIdArrayTrnfmr)
  timeOff: Types.ObjectId[];
}
