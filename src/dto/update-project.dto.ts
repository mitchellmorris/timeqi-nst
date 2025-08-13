import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly pitch: number;

  @IsNumber()
  readonly fulfillment: number;

  @IsNumber()
  readonly accuracy: number;

  @IsNumber()
  readonly estimate: number;

  @IsISO8601()
  @IsNotEmpty()
  readonly updatedAt: string;
}
