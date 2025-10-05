import { IsISO8601 } from 'class-validator';
import { CreateTaskUserDto } from './create-task.user';
/**
 * Not including entries and users as they are not required for task creation.
 */
export class TaskUserDto extends CreateTaskUserDto {
  @IsISO8601()
  readonly createdAt: Date;

  @IsISO8601()
  readonly updatedAt: Date;
}
