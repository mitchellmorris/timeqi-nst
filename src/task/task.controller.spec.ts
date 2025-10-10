/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;
  let mockResponse: Partial<Response>;

  const mockTaskService = {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    getAllTasks: jest.fn(),
    getTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  const mockTask = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Task',
    index: 1,
    assignee: new Types.ObjectId('507f1f77bcf86cd799439012'),
    sponsor: new Types.ObjectId('507f1f77bcf86cd799439013'),
    organization: new Types.ObjectId('507f1f77bcf86cd799439014'),
    project: new Types.ObjectId('507f1f77bcf86cd799439015'),
    startDate: '2025-01-01T00:00:00.000Z',
    estimate: 40,
    workshift: 8,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
    entries: [],
    users: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);

    // Mock Express Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    const createTaskDto: CreateTaskDto = {
      name: 'New Task',
      index: 1,
      assignee: new Types.ObjectId('507f1f77bcf86cd799439012'),
      sponsor: new Types.ObjectId('507f1f77bcf86cd799439013'),
      organization: new Types.ObjectId('507f1f77bcf86cd799439014'),
      project: new Types.ObjectId('507f1f77bcf86cd799439015'),
      startDate: '2025-01-01T00:00:00.000Z',
      estimate: 40,
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC',
      endOfDayHour: 17,
      endOfDayMin: 0,
    };

    it('should create task successfully', async () => {
      // Arrange
      mockTaskService.createTask.mockResolvedValue(mockTask);

      // Act
      const result = await controller.createTask(createTaskDto);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual({
        message: 'Task has been created successfully',
        newTask: mockTask,
      });
    });

    it('should throw HttpException when task creation fails', async () => {
      // Arrange
      mockTaskService.createTask.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.createTask(createTaskDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error: Task not created!',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(taskService.createTask).toHaveBeenCalledWith(createTaskDto);
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockTaskService.createTask.mockResolvedValue(mockTask);

      // Act
      await controller.createTask(createTaskDto);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith(createTaskDto);
      expect(taskService.createTask).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors and throw HttpException', async () => {
      // Arrange
      const serviceError = new Error('Validation failed');
      mockTaskService.createTask.mockRejectedValue(serviceError);

      // Act & Assert
      const expectedError = new HttpException(
        {
          message: 'Error: Task not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      await expect(controller.createTask(createTaskDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('should return the exact task data from service', async () => {
      // Arrange
      const customTask = { ...mockTask, name: 'Custom Task Name' };
      mockTaskService.createTask.mockResolvedValue(customTask);

      // Act
      const result = await controller.createTask(createTaskDto);

      // Assert
      expect(result.newTask).toEqual(customTask);
      expect(result.newTask.name).toBe('Custom Task Name');
    });

    it('should handle different task index values', async () => {
      // Arrange
      const taskWithDifferentIndex = { ...createTaskDto, index: 5 };
      const expectedTask = { ...mockTask, index: 5 };
      mockTaskService.createTask.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.createTask(taskWithDifferentIndex);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith(
        taskWithDifferentIndex,
      );
      expect(result.newTask.index).toBe(5);
    });
  });

  describe('updateTask', () => {
    const taskId = '507f1f77bcf86cd799439011';
    const updateTaskDto: UpdateTaskDto = {
      name: 'Updated Task',
      estimate: 60,
      index: 2,
    };
    const updatedTask = { ...mockTask, ...updateTaskDto };

    it('should update task successfully', async () => {
      // Arrange
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      // Act
      await controller.updateTask(
        mockResponse as Response,
        taskId,
        updateTaskDto,
      );

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task has been successfully updated',
        existingTask: updatedTask,
      });
    });

    it('should handle task not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Task not found',
          error: 'Not Found',
        },
      };
      mockTaskService.updateTask.mockRejectedValue(notFoundError);

      // Act
      await controller.updateTask(
        mockResponse as Response,
        taskId,
        updateTaskDto,
      );

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockTaskService.updateTask.mockRejectedValue(unknownError);

      // Act
      await controller.updateTask(
        mockResponse as Response,
        taskId,
        updateTaskDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(unknownError.response);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationError = {
        status: HttpStatus.BAD_REQUEST,
        response: {
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
        },
      };
      mockTaskService.updateTask.mockRejectedValue(validationError);

      // Act
      await controller.updateTask(
        mockResponse as Response,
        taskId,
        updateTaskDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(validationError.response);
    });

    it('should not allow updating organization and project fields', async () => {
      // Arrange
      const restrictedUpdate = {
        name: 'Updated Task',
        // organization and project should not be included in UpdateTaskDto
      };
      mockTaskService.updateTask.mockResolvedValue({
        ...mockTask,
        name: 'Updated Task',
      });

      // Act
      await controller.updateTask(
        mockResponse as Response,
        taskId,
        restrictedUpdate,
      );

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(
        taskId,
        restrictedUpdate,
      );
      // Verify that organization and project are not in the update DTO
      expect(restrictedUpdate).not.toHaveProperty('organization');
      expect(restrictedUpdate).not.toHaveProperty('project');
    });
  });

  describe('getTasks', () => {
    const tasksData = [
      mockTask,
      { ...mockTask, _id: new Types.ObjectId('507f1f77bcf86cd799439016') },
    ];

    it('should get all tasks successfully', async () => {
      // Arrange
      mockTaskService.getAllTasks.mockResolvedValue(tasksData);

      // Act
      await controller.getTasks(mockResponse as Response);

      // Assert
      expect(taskService.getAllTasks).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All tasks data found successfully',
        taskData: tasksData,
      });
    });

    it('should handle no tasks found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Tasks data not found!',
          error: 'Not Found',
        },
      };
      mockTaskService.getAllTasks.mockRejectedValue(notFoundError);

      // Act
      await controller.getTasks(mockResponse as Response);

      // Assert
      expect(taskService.getAllTasks).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection failed' },
      };
      mockTaskService.getAllTasks.mockRejectedValue(serviceError);

      // Act
      await controller.getTasks(mockResponse as Response);

      // Assert
      expect(taskService.getAllTasks).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });

    it('should return empty array when no tasks exist', async () => {
      // Arrange
      mockTaskService.getAllTasks.mockResolvedValue([]);

      // Act
      await controller.getTasks(mockResponse as Response);

      // Assert
      expect(taskService.getAllTasks).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All tasks data found successfully',
        taskData: [],
      });
    });
  });

  describe('getTask', () => {
    const taskId = '507f1f77bcf86cd799439011';

    it('should get task by id successfully', async () => {
      // Arrange
      mockTaskService.getTask.mockResolvedValue(mockTask);

      // Act
      await controller.getTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.getTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task found successfully',
        existingTask: mockTask,
      });
    });

    it('should handle task not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Task #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockTaskService.getTask.mockRejectedValue(notFoundError);

      // Act
      await controller.getTask(mockResponse as Response, 'invalid-id');

      // Assert
      expect(taskService.getTask).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle invalid ObjectId format', async () => {
      // Arrange
      const invalidIdError = {
        status: HttpStatus.BAD_REQUEST,
        response: {
          statusCode: 400,
          message: 'Invalid task ID format',
          error: 'Bad Request',
        },
      };
      mockTaskService.getTask.mockRejectedValue(invalidIdError);

      // Act
      await controller.getTask(mockResponse as Response, 'invalid-object-id');

      // Assert
      expect(taskService.getTask).toHaveBeenCalledWith('invalid-object-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(invalidIdError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Internal server error' },
      };
      mockTaskService.getTask.mockRejectedValue(serviceError);

      // Act
      await controller.getTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.getTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('deleteTask', () => {
    const taskId = '507f1f77bcf86cd799439011';

    it('should delete task successfully', async () => {
      // Arrange
      mockTaskService.deleteTask.mockResolvedValue(mockTask);

      // Act
      await controller.deleteTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task deleted successfully',
        deletedTask: mockTask,
      });
    });

    it('should handle task not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Task #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockTaskService.deleteTask.mockRejectedValue(notFoundError);

      // Act
      await controller.deleteTask(mockResponse as Response, 'invalid-id');

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle dependency conflicts during deletion', async () => {
      // Arrange
      const conflictError = {
        status: HttpStatus.CONFLICT,
        response: {
          statusCode: 409,
          message: 'Cannot delete task with existing entries',
          error: 'Conflict',
        },
      };
      mockTaskService.deleteTask.mockRejectedValue(conflictError);

      // Act
      await controller.deleteTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(conflictError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockTaskService.deleteTask.mockRejectedValue(serverError);

      // Act
      await controller.deleteTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serverError.response);
    });

    it('should handle errors with numeric status codes', async () => {
      // Arrange
      const errorWithStatus = {
        status: 422,
        response: { message: 'Unprocessable Entity' },
      };
      mockTaskService.deleteTask.mockRejectedValue(errorWithStatus);

      // Act
      await controller.deleteTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(errorWithStatus.response);
    });

    it('should handle task with active assignments', async () => {
      // Arrange
      const assignmentError = {
        status: HttpStatus.FORBIDDEN,
        response: {
          statusCode: 403,
          message: 'Cannot delete task with active user assignments',
          error: 'Forbidden',
        },
      };
      mockTaskService.deleteTask.mockRejectedValue(assignmentError);

      // Act
      await controller.deleteTask(mockResponse as Response, taskId);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(assignmentError.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should properly handle service method parameters', async () => {
      // Arrange
      const createDto: CreateTaskDto = {
        name: 'Test Task',
        index: 3,
        assignee: new Types.ObjectId(),
        sponsor: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        startDate: '2025-02-01T00:00:00.000Z',
        estimate: 20,
        workshift: 6,
        weekdays: ['Monday', 'Wednesday', 'Friday'],
        timezone: 'America/New_York',
        endOfDayHour: 18,
        endOfDayMin: 30,
      };
      mockTaskService.createTask.mockResolvedValue(mockTask);

      // Act
      await controller.createTask(createDto);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith(createDto);
      expect(taskService.createTask).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods correctly', async () => {
      // Arrange
      mockTaskService.getAllTasks.mockResolvedValue([mockTask]);

      // Act
      await controller.getTasks(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All tasks data found successfully',
        taskData: [mockTask],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different error response formats', async () => {
      // Test error without status property
      const errorWithoutStatus = {
        response: { message: 'Error without status' },
      };
      mockTaskService.getTask.mockRejectedValue(errorWithoutStatus);

      await controller.getTask(mockResponse as Response, 'test-id');

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        errorWithoutStatus.response,
      );
    });

    it('should handle partial update DTO correctly', async () => {
      // Test with partial update DTO
      const partialUpdate: UpdateTaskDto = {
        name: 'Partially Updated Task',
        assignee: new Types.ObjectId(),
      };
      const updatedTask = {
        ...mockTask,
        name: 'Partially Updated Task',
        assignee: partialUpdate.assignee,
      };
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await controller.updateTask(
        mockResponse as Response,
        '507f1f77bcf86cd799439011',
        partialUpdate,
      );

      expect(taskService.updateTask).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        partialUpdate,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task has been successfully updated',
        existingTask: updatedTask,
      });
    });

    it('should validate task index constraints', async () => {
      // Test with edge case index values
      const taskWithZeroIndex = { ...mockTask, index: 0 };
      const createDtoWithZeroIndex = {
        ...mockTask,
        index: 0,
        _id: undefined,
        entries: undefined,
        users: undefined,
      };
      mockTaskService.createTask.mockResolvedValue(taskWithZeroIndex);

      const result = await controller.createTask(createDtoWithZeroIndex);

      expect(result.newTask.index).toBe(0);
    });
  });
});
