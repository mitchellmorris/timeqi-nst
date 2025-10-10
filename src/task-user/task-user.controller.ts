import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { TaskUserService } from './task-user.service';
import { CreateTaskUserDto } from '../dto/create-task.user';
import { UpdateTaskUserDto } from '../dto/update-task.user.dto';
import { Response } from 'express';

@Controller('task-user')
export class TaskUserController {
  constructor(private readonly taskUserService: TaskUserService) {}

  /**
   * Creates a new task user assignment.
   * @param createTaskUserDto - The data transfer object containing task user details.
   * @returns A JSON response with the status and created task user data.
   */
  @Post()
  async createTaskUser(
    @Body() createTaskUserDto: CreateTaskUserDto,
  ): Promise<{ message: string; newTaskUser: any }> {
    try {
      const newTaskUser =
        await this.taskUserService.createTaskUser(createTaskUserDto);
      return {
        message: 'TaskUser has been created successfully',
        newTaskUser,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: TaskUser not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Updates an existing task user by ID.
   * @param taskUserId - The ID of the task user to update.
   * @param updateTaskUserDto - The data transfer object containing updated task user details.
   * @returns A JSON response with the status and updated task user data.
   */
  @Put('/:id')
  async updateTaskUser(
    @Param('id') taskUserId: string,
    @Body() updateTaskUserDto: UpdateTaskUserDto,
  ) {
    try {
      const existingTaskUser = await this.taskUserService.updateTaskUser(
        taskUserId,
        updateTaskUserDto,
      );
      return {
        message: 'TaskUser has been updated successfully',
        existingTaskUser,
      };
    } catch ({ status, response: err }) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? ((err as Record<string, unknown>).message as string)
          : 'Internal server error';
      throw new HttpException(
        errorMessage,
        typeof status === 'number' ? status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all task users.
   * @returns An array of task users.
   */
  @Get()
  async getTaskUsers(@Res() response: Response) {
    try {
      const taskUserData = await this.taskUserService.getAllTaskUsers();
      return response.status(HttpStatus.OK).json({
        message: 'All taskUsers data found successfully',
        taskUserData,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }

  /**
   * Retrieves a task user by its ID.
   * @param taskUserId - The ID of the task user to retrieve.
   * @returns The task user with the specified ID.
   */
  @Get('/:id')
  async getTaskUser(
    @Res() response: Response,
    @Param('id') taskUserId: string,
  ) {
    try {
      const existingTaskUser =
        await this.taskUserService.getTaskUser(taskUserId);
      return response.status(HttpStatus.OK).json({
        message: 'TaskUser found successfully',
        existingTaskUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }

  /**
   * Deletes a task user by its ID.
   * @param taskUserId - The ID of the task user to delete.
   * @returns The deleted task user.
   */
  @Delete('/:id')
  async deleteTaskUser(
    @Res() response: Response,
    @Param('id') taskUserId: string,
  ) {
    try {
      const deletedTaskUser =
        await this.taskUserService.deleteTaskUser(taskUserId);
      return response.status(HttpStatus.OK).json({
        message: 'TaskUser deleted successfully',
        deletedTaskUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
}
