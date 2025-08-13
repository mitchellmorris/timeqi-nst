import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryDto } from './create-entry.dto';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
export class UpdateEntryDto extends PartialType(CreateEntryDto) {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly date: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly updatedAt: string;
}
