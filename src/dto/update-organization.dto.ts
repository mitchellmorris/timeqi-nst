import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsObjectId } from 'nestjs-object-id';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { objectIdTrnfmr } from './dto-helpers';
import { Types } from 'mongoose';
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsObjectId()
  @IsOptional()
  @Transform(objectIdTrnfmr)
  sponsor: Types.ObjectId;
}
