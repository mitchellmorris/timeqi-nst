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
import { TaskService } from './task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Response } from 'express';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  /**
   * Creates a new task.
   * @param response - The response object to send the result.
   * @param createTaskDto - The data transfer object containing task details.
   * @returns A JSON response with the status and created task data.
   */
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    try {
      const newTask = await this.taskService.createTask(createTaskDto);
      return {
        message: 'Task has been created successfully',
        newTask,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: Task not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Updates an existing task by ID.
   * @param response - The response object to send the result.
   * @param taskId - The ID of the task to update.
   * @param updateTaskDto - The data transfer object containing updated task details.
   * @returns A JSON response with the status and updated task data.
   */
  @Put('/:id')
  async updateTask(
    @Res() response: Response,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      const existingTask = await this.taskService.updateTask(
        taskId,
        updateTaskDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'Task has been successfully updated',
        existingTask,
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
   * Retrieves all tasks.
   * @returns A JSON response with the status and all task data.
   */
  @Get()
  async getTasks(@Res() response: Response) {
    try {
      const taskData = await this.taskService.getAllTasks();
      return response.status(HttpStatus.OK).json({
        message: 'All tasks data found successfully',
        taskData,
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
   * Retrieves a task by ID.
   * @param response - The response object to send the result.
   * @param taskId - The ID of the task to retrieve.
   * @returns A JSON response with the status and found task data.
   */
  @Get('/:id')
  async getTask(@Res() response: Response, @Param('id') taskId: string) {
    try {
      const existingTask = await this.taskService.getTask(taskId);
      return response.status(HttpStatus.OK).json({
        message: 'Task found successfully',
        existingTask,
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
   * Deletes a task by ID.
   * @param taskId - The ID of the task to delete.
   * @returns A JSON response with the status and deleted task data.
   */
  @Delete('/:id')
  async deleteTask(@Res() response: Response, @Param('id') taskId: string) {
    try {
      const deletedTask = await this.taskService.deleteTask(taskId);
      return response.status(HttpStatus.OK).json({
        message: 'Task deleted successfully',
        deletedTask,
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
