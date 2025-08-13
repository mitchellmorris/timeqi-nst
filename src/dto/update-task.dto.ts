import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
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
