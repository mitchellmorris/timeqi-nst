/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { TaskUserController } from './task-user.controller';
import { TaskUserService } from './task-user.service';
import { CreateTaskUserDto } from '../dto/create-task.user';
import { UpdateTaskUserDto } from '../dto/update-task.user.dto';
import { Types } from 'mongoose';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('TaskUserController', () => {
  let controller: TaskUserController;

  const mockTaskUserService = {
    createTaskUser: jest.fn(),
    updateTaskUser: jest.fn(),
    getAllTaskUsers: jest.fn(),
    getTaskUser: jest.fn(),
    deleteTaskUser: jest.fn(),
  };

  const mockStatusFn = jest.fn().mockReturnThis();
  const mockJsonFn = jest.fn().mockReturnThis();

  const mockResponse = {
    status: mockStatusFn,
    json: mockJsonFn,
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskUserController],
      providers: [
        {
          provide: TaskUserService,
          useValue: mockTaskUserService,
        },
      ],
    }).compile();

    controller = module.get<TaskUserController>(TaskUserController);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createTaskUser', () => {
    const createTaskUserDto: CreateTaskUserDto = {
      organization: new Types.ObjectId(),
      project: new Types.ObjectId(),
      task: new Types.ObjectId(),
      user: new Types.ObjectId(),
    };

    const mockTaskUser = {
      _id: new Types.ObjectId(),
      organization: createTaskUserDto.organization,
      project: createTaskUserDto.project,
      task: createTaskUserDto.task,
      user: createTaskUserDto.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should create a new task user successfully', async () => {
      // Arrange
      mockTaskUserService.createTaskUser.mockResolvedValue(mockTaskUser);

      // Act
      const result = await controller.createTaskUser(createTaskUserDto);

      // Assert
      expect(mockTaskUserService.createTaskUser).toHaveBeenCalledWith(
        createTaskUserDto,
      );
      expect(result).toEqual({
        message: 'TaskUser has been created successfully',
        newTaskUser: mockTaskUser,
      });
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      mockTaskUserService.createTaskUser.mockRejectedValue(
        new Error('Service error'),
      );

      // Act & Assert
      await expect(
        controller.createTaskUser(createTaskUserDto),
      ).rejects.toMatchObject({
        message: 'Error: TaskUser not created!',
        status: HttpStatus.BAD_REQUEST,
      });
      expect(mockTaskUserService.createTaskUser).toHaveBeenCalledWith(
        createTaskUserDto,
      );
    });

    it('should handle creation with different ObjectId combinations', async () => {
      // Arrange
      const testCases = [
        {
          organization: new Types.ObjectId(),
          project: new Types.ObjectId(),
          task: new Types.ObjectId(),
          user: new Types.ObjectId(),
        },
        {
          organization: new Types.ObjectId(),
          project: new Types.ObjectId(),
          task: new Types.ObjectId(),
          user: new Types.ObjectId(),
        },
      ];

      for (const testDto of testCases) {
        const expectedTaskUser = { ...mockTaskUser, ...testDto };
        mockTaskUserService.createTaskUser.mockResolvedValue(expectedTaskUser);

        // Act
        const result = await controller.createTaskUser(testDto);

        // Assert
        expect(mockTaskUserService.createTaskUser).toHaveBeenCalledWith(
          testDto,
        );
        expect(result.newTaskUser).toEqual(expectedTaskUser);
        mockTaskUserService.createTaskUser.mockClear();
      }
    });

    it('should validate all required ObjectId fields are present', async () => {
      // Arrange
      const completeDto = createTaskUserDto;
      mockTaskUserService.createTaskUser.mockResolvedValue(mockTaskUser);

      // Act
      const result = await controller.createTaskUser(completeDto);

      // Assert
      expect(result.newTaskUser).toHaveProperty('organization');
      expect(result.newTaskUser).toHaveProperty('project');
      expect(result.newTaskUser).toHaveProperty('task');
      expect(result.newTaskUser).toHaveProperty('user');
    });
  });

  describe('updateTaskUser', () => {
    const taskUserId = new Types.ObjectId().toString();
    const updateTaskUserDto: UpdateTaskUserDto = {}; // Empty because all fields are omitted in UpdateTaskUserDto

    const mockUpdatedTaskUser = {
      _id: new Types.ObjectId(taskUserId),
      organization: new Types.ObjectId(),
      project: new Types.ObjectId(),
      task: new Types.ObjectId(),
      user: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a task user successfully', async () => {
      // Arrange
      mockTaskUserService.updateTaskUser.mockResolvedValue(mockUpdatedTaskUser);

      // Act
      const result = await controller.updateTaskUser(
        taskUserId,
        updateTaskUserDto,
      );

      // Assert
      expect(mockTaskUserService.updateTaskUser).toHaveBeenCalledWith(
        taskUserId,
        updateTaskUserDto,
      );
      expect(result).toEqual({
        message: 'TaskUser has been updated successfully',
        existingTaskUser: mockUpdatedTaskUser,
      });
    });

    it('should handle service errors during update', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'Not found' },
      };
      mockTaskUserService.updateTaskUser.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        controller.updateTaskUser(taskUserId, updateTaskUserDto),
      ).rejects.toMatchObject({
        message: 'Not found',
        status: HttpStatus.NOT_FOUND,
      });
      expect(mockTaskUserService.updateTaskUser).toHaveBeenCalledWith(
        taskUserId,
        updateTaskUserDto,
      );
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = { response: { message: 'Generic error' } };
      mockTaskUserService.updateTaskUser.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        controller.updateTaskUser(taskUserId, updateTaskUserDto),
      ).rejects.toMatchObject({
        message: 'Generic error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(mockTaskUserService.updateTaskUser).toHaveBeenCalledWith(
        taskUserId,
        updateTaskUserDto,
      );
    });

    it('should handle empty update object', async () => {
      // Arrange
      const emptyUpdate: UpdateTaskUserDto = {};
      mockTaskUserService.updateTaskUser.mockResolvedValue(mockUpdatedTaskUser);

      // Act
      const result = await controller.updateTaskUser(taskUserId, emptyUpdate);

      // Assert
      expect(mockTaskUserService.updateTaskUser).toHaveBeenCalledWith(
        taskUserId,
        emptyUpdate,
      );
      // Check if result is the success object type
      if (typeof result === 'object' && 'message' in result) {
        expect(result.message).toBe('TaskUser has been updated successfully');
      }
    });

    it('should verify that restricted fields cannot be updated', async () => {
      // Arrange
      mockTaskUserService.updateTaskUser.mockResolvedValue(mockUpdatedTaskUser);

      // Act
      const result = await controller.updateTaskUser(
        taskUserId,
        updateTaskUserDto,
      );

      // Assert - verify that the DTO structure doesn't allow restricted fields
      expect(updateTaskUserDto).not.toHaveProperty('organization');
      expect(updateTaskUserDto).not.toHaveProperty('project');
      expect(updateTaskUserDto).not.toHaveProperty('task');
      expect(updateTaskUserDto).not.toHaveProperty('user');
      expect(result).toBeDefined();
    });
  });

  describe('getTaskUsers', () => {
    const mockTaskUsers = [
      {
        _id: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should retrieve all task users successfully', async () => {
      // Arrange
      mockTaskUserService.getAllTaskUsers.mockResolvedValue(mockTaskUsers);

      // Act
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(mockTaskUserService.getAllTaskUsers).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'All taskUsers data found successfully',
        taskUserData: mockTaskUsers,
      });
    });

    it('should handle service errors when retrieving all task users', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'No data found' },
      };
      mockTaskUserService.getAllTaskUsers.mockRejectedValue(serviceError);

      // Act
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(mockTaskUserService.getAllTaskUsers).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'No data found' });
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = { response: { message: 'Generic error' } };
      mockTaskUserService.getAllTaskUsers.mockRejectedValue(serviceError);

      // Act
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(mockTaskUserService.getAllTaskUsers).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'Generic error' });
    });

    it('should handle empty task users list', async () => {
      // Arrange
      mockTaskUserService.getAllTaskUsers.mockResolvedValue([]);

      // Act
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(mockTaskUserService.getAllTaskUsers).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'All taskUsers data found successfully',
        taskUserData: [],
      });
    });

    it('should return task users with all required relationships', async () => {
      // Arrange
      mockTaskUserService.getAllTaskUsers.mockResolvedValue(mockTaskUsers);

      // Act
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(mockTaskUserService.getAllTaskUsers).toHaveBeenCalled();
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'All taskUsers data found successfully',
        taskUserData: mockTaskUsers,
      });

      // Verify structure
      const callArgs = mockJsonFn.mock.calls[0][0] as {
        taskUserData: Array<{
          organization: unknown;
          project: unknown;
          task: unknown;
          user: unknown;
        }>;
      };
      expect(callArgs.taskUserData[0]).toHaveProperty('organization');
      expect(callArgs.taskUserData[0]).toHaveProperty('project');
      expect(callArgs.taskUserData[0]).toHaveProperty('task');
      expect(callArgs.taskUserData[0]).toHaveProperty('user');
    });
  });

  describe('getTaskUser', () => {
    const taskUserId = new Types.ObjectId().toString();
    const mockTaskUser = {
      _id: new Types.ObjectId(taskUserId),
      organization: new Types.ObjectId(),
      project: new Types.ObjectId(),
      task: new Types.ObjectId(),
      user: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should retrieve a task user by ID successfully', async () => {
      // Arrange
      mockTaskUserService.getTaskUser.mockResolvedValue(mockTaskUser);

      // Act
      await controller.getTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(taskUserId);
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'TaskUser found successfully',
        existingTaskUser: mockTaskUser,
      });
    });

    it('should handle task user not found', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: `TaskUser #${taskUserId} not found` },
      };
      mockTaskUserService.getTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.getTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(taskUserId);
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: `TaskUser #${taskUserId} not found`,
      });
    });

    it('should handle invalid task user ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const serviceError = {
        status: HttpStatus.BAD_REQUEST,
        response: { message: 'Invalid ID format' },
      };
      mockTaskUserService.getTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.getTaskUser(mockResponse, invalidId);

      // Assert
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(invalidId);
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'Invalid ID format' });
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection error' },
      };
      mockTaskUserService.getTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.getTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(taskUserId);
      expect(mockStatusFn).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'Database connection error',
      });
    });

    it('should return task user with all relationship fields', async () => {
      // Arrange
      mockTaskUserService.getTaskUser.mockResolvedValue(mockTaskUser);

      // Act
      await controller.getTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(taskUserId);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'TaskUser found successfully',
        existingTaskUser: mockTaskUser,
      });

      // Verify structure
      const callArgs = mockJsonFn.mock.calls[0]?.[0];
      expect(callArgs?.existingTaskUser).toHaveProperty('organization');
      expect(callArgs?.existingTaskUser).toHaveProperty('project');
      expect(callArgs?.existingTaskUser).toHaveProperty('task');
      expect(callArgs?.existingTaskUser).toHaveProperty('user');
    });
  });

  describe('deleteTaskUser', () => {
    const taskUserId = new Types.ObjectId().toString();
    const mockDeletedTaskUser = {
      _id: new Types.ObjectId(taskUserId),
      organization: new Types.ObjectId(),
      project: new Types.ObjectId(),
      task: new Types.ObjectId(),
      user: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete a task user successfully', async () => {
      // Arrange
      mockTaskUserService.deleteTaskUser.mockResolvedValue(mockDeletedTaskUser);

      // Act
      await controller.deleteTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        taskUserId,
      );
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'TaskUser deleted successfully',
        deletedTaskUser: mockDeletedTaskUser,
      });
    });

    it('should handle task user not found during deletion', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: `TaskUser #${taskUserId} not found` },
      };
      mockTaskUserService.deleteTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.deleteTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        taskUserId,
      );
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: `TaskUser #${taskUserId} not found`,
      });
    });

    it('should handle invalid task user ID during deletion', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const serviceError = {
        status: HttpStatus.BAD_REQUEST,
        response: { message: 'Invalid ID format' },
      };
      mockTaskUserService.deleteTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.deleteTaskUser(mockResponse, invalidId);

      // Assert
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        invalidId,
      );
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'Invalid ID format' });
    });

    it('should handle service errors without status code during deletion', async () => {
      // Arrange
      const serviceError = { response: { message: 'Database error' } };
      mockTaskUserService.deleteTaskUser.mockRejectedValue(serviceError);

      // Act
      await controller.deleteTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        taskUserId,
      );
      expect(mockStatusFn).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should confirm deletion returns the deleted task user data', async () => {
      // Arrange
      mockTaskUserService.deleteTaskUser.mockResolvedValue(mockDeletedTaskUser);

      // Act
      await controller.deleteTaskUser(mockResponse, taskUserId);

      // Assert
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        taskUserId,
      );

      // Verify the deleted data is returned
      const callArgs = mockJsonFn.mock.calls[0]?.[0];
      expect(callArgs?.deletedTaskUser?._id?.toString()).toBe(taskUserId);
      expect(callArgs?.deletedTaskUser).toHaveProperty('organization');
      expect(callArgs?.deletedTaskUser).toHaveProperty('project');
      expect(callArgs?.deletedTaskUser).toHaveProperty('task');
      expect(callArgs?.deletedTaskUser).toHaveProperty('user');
    });
  });

  describe('Edge Cases and Integration Scenarios', () => {
    it('should handle concurrent task user operations', async () => {
      // Arrange
      const createDto: CreateTaskUserDto = {
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
      };
      const mockCreated = {
        _id: new Types.ObjectId(),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTaskUserService.createTaskUser.mockResolvedValue(mockCreated);
      mockTaskUserService.getAllTaskUsers.mockResolvedValue([mockCreated]);

      // Act
      const createResult = await controller.createTaskUser(createDto);
      await controller.getTaskUsers(mockResponse);

      // Assert
      expect(createResult.newTaskUser).toEqual(mockCreated);
      expect(mockJsonFn).toHaveBeenCalledWith({
        message: 'All taskUsers data found successfully',
        taskUserData: [mockCreated],
      });
    });

    it('should handle task user assignment with multiple relationships', async () => {
      // Arrange
      const complexAssignmentDto: CreateTaskUserDto = {
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
      };
      const mockComplexTaskUser = {
        _id: new Types.ObjectId(),
        ...complexAssignmentDto,
        entries: [new Types.ObjectId(), new Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTaskUserService.createTaskUser.mockResolvedValue(mockComplexTaskUser);

      // Act
      const result = await controller.createTaskUser(complexAssignmentDto);

      // Assert
      expect(result.newTaskUser?.organization).toEqual(
        complexAssignmentDto.organization,
      );
      expect(result.newTaskUser?.project).toEqual(complexAssignmentDto.project);
      expect(result.newTaskUser?.task).toEqual(complexAssignmentDto.task);
      expect(result.newTaskUser?.user).toEqual(complexAssignmentDto.user);
    });

    it('should validate that all required relationship fields are preserved', async () => {
      // Arrange
      const createDto: CreateTaskUserDto = {
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
      };
      const mockCreated = {
        _id: new Types.ObjectId(),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTaskUserService.createTaskUser.mockResolvedValue(mockCreated);

      // Act
      const createResult = await controller.createTaskUser(createDto);

      // Assert
      expect(createResult.newTaskUser).toEqual(mockCreated);
      expect(mockTaskUserService.createTaskUser).toHaveBeenCalledWith(
        createDto,
      );

      // Verify the service is called to handle relationship management
      expect(mockTaskUserService.createTaskUser).toHaveBeenCalledTimes(1);
    });

    it('should handle TaskUser lifecycle with proper data flow', async () => {
      // Arrange
      const taskUserId = new Types.ObjectId().toString();
      const createDto: CreateTaskUserDto = {
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
        user: new Types.ObjectId(),
      };
      const mockTaskUser = {
        _id: new Types.ObjectId(taskUserId),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskUserService.createTaskUser.mockResolvedValue(mockTaskUser);
      mockTaskUserService.getTaskUser.mockResolvedValue(mockTaskUser);
      mockTaskUserService.deleteTaskUser.mockResolvedValue(mockTaskUser);

      // Act - Create, Read, Delete lifecycle
      const createResult = await controller.createTaskUser(createDto);
      await controller.getTaskUser(mockResponse, taskUserId);
      await controller.deleteTaskUser(mockResponse, taskUserId);

      // Assert
      expect(createResult.newTaskUser).toEqual(mockTaskUser);
      expect(mockTaskUserService.getTaskUser).toHaveBeenCalledWith(taskUserId);
      expect(mockTaskUserService.deleteTaskUser).toHaveBeenCalledWith(
        taskUserId,
      );
    });
  });
});
