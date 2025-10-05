import { IsArray, IsISO8601 } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { CreateOrganizationDto } from './create-organization.dto';
/**
 * Not including projects, users, and timeOff as they are not required for organization creation.
 */
export class OrganizationDto extends CreateOrganizationDto {
  @IsArray()
  @IsObjectId({ each: true })
  users: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  projects: Types.ObjectId[];

  @IsArray()
  @IsObjectId({ each: true })
  timeOff: Types.ObjectId[];

  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
