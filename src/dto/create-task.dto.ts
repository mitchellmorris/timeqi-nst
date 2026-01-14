import { IntersectionType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { SchedulingDto } from './create-scheduling.dto';
import { CreateScenarioDto } from './create-scenario.dto';
import { Transform } from 'class-transformer';

const objectIdTrnfmr = ({ value }: { value: unknown }) =>
  value ? new Types.ObjectId(value as string) : value;
/**
 * Not including entries and users as they are not required for task creation.
 */
export class CreateTaskDto extends IntersectionType(
  SchedulingDto,
  CreateScenarioDto,
  // OmitType(CreateScenarioDto, [
  //   // forecast is maintained through entries
  //   'forecast',
  // ] as const),
) {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @IsNotEmpty()
  readonly index: number;

  @IsObjectId()
  @IsNotEmpty()
  @Transform(objectIdTrnfmr)
  assignee: Types.ObjectId;

  // @IsObjectId()
  // sponsor: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  @Transform(objectIdTrnfmr)
  organization: Types.ObjectId;

  @IsObjectId()
  @IsNotEmpty()
  @Transform(objectIdTrnfmr)
  project: Types.ObjectId;
}
