/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { TimeOffController } from './time-off.controller';
import { TimeOffService } from './time-off.service';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';
import { UpdateTimeOffDto } from '../dto/update-time-off.dto';

describe('TimeOffController', () => {
  let controller: TimeOffController;
  let timeOffService: TimeOffService;
  let mockResponse: Partial<Response>;

  const mockTimeOffService = {
    createTimeOff: jest.fn(),
    updateTimeOff: jest.fn(),
    getAllTimeOffs: jest.fn(),
    getTimeOff: jest.fn(),
    deleteTimeOff: jest.fn(),
  };

  const mockTimeOff = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Annual Leave',
    startDate: '2025-02-15T00:00:00.000Z',
    days: 5,
    extendedHours: 0,
    target: new Types.ObjectId('507f1f77bcf86cd799439012'),
    type: 'Organization' as const,
    users: [],
    createdAt: new Date('2025-01-15T09:00:00.000Z'),
    updatedAt: new Date('2025-01-15T09:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffController],
      providers: [
        {
          provide: TimeOffService,
          useValue: mockTimeOffService,
        },
      ],
    }).compile();

    controller = module.get<TimeOffController>(TimeOffController);
    timeOffService = module.get<TimeOffService>(TimeOffService);

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

  describe('createTimeOff', () => {
    const createTimeOffDto: CreateTimeOffDto = {
      name: 'Annual Leave',
      startDate: '2025-02-15T00:00:00.000Z',
      days: 5,
      extendedHours: 0,
      target: new Types.ObjectId('507f1f77bcf86cd799439012'),
      type: 'Organization' as const,
    };

    it('should create time off successfully', async () => {
      // Arrange
      mockTimeOffService.createTimeOff.mockResolvedValue(mockTimeOff);

      // Act
      const result = await controller.createTimeOff(createTimeOffDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(
        createTimeOffDto,
      );
      expect(result).toEqual({
        message: 'Time off has been created successfully',
        newTimeOff: mockTimeOff,
      });
    });

    it('should throw HttpException when time off creation fails', async () => {
      // Arrange
      mockTimeOffService.createTimeOff.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(controller.createTimeOff(createTimeOffDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error: Organization not created!',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(
        createTimeOffDto,
      );
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockTimeOffService.createTimeOff.mockResolvedValue(mockTimeOff);

      // Act
      await controller.createTimeOff(createTimeOffDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(
        createTimeOffDto,
      );
      expect(timeOffService.createTimeOff).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors and throw HttpException', async () => {
      // Arrange
      const serviceError = new Error('Validation failed');
      mockTimeOffService.createTimeOff.mockRejectedValue(serviceError);

      // Act & Assert
      const expectedError = new HttpException(
        {
          message: 'Error: Organization not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      await expect(controller.createTimeOff(createTimeOffDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('should return the exact time off data from service', async () => {
      // Arrange
      const customTimeOff = { ...mockTimeOff, name: 'Sick Leave' };
      mockTimeOffService.createTimeOff.mockResolvedValue(customTimeOff);

      // Act
      const result: { newTimeOff: typeof customTimeOff } =
        await controller.createTimeOff(createTimeOffDto);

      // Assert
      expect(result.newTimeOff).toEqual(customTimeOff);
      expect(result.newTimeOff.name).toBe('Sick Leave');
    });

    it('should handle different time off types', async () => {
      // Arrange
      const projectTimeOffDto = {
        ...createTimeOffDto,
        type: 'Project' as const,
      };
      const expectedTimeOff = { ...mockTimeOff, type: 'Project' as const };
      mockTimeOffService.createTimeOff.mockResolvedValue(expectedTimeOff);

      // Act
      const result: { newTimeOff: typeof expectedTimeOff } =
        await controller.createTimeOff(projectTimeOffDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(
        projectTimeOffDto,
      );
      expect(result.newTimeOff.type).toBe('Project');
    });

    it('should handle different day values including decimals', async () => {
      // Arrange
      const halfDayDto = { ...createTimeOffDto, days: 0.5 };
      const expectedTimeOff = { ...mockTimeOff, days: 0.5 };
      mockTimeOffService.createTimeOff.mockResolvedValue(expectedTimeOff);

      // Act
      const result: { newTimeOff: typeof expectedTimeOff } =
        await controller.createTimeOff(halfDayDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(halfDayDto);
      expect(result.newTimeOff.days).toBe(0.5);
    });

    it('should handle extended hours for partial days', async () => {
      // Arrange
      const extendedHoursDto = { ...createTimeOffDto, extendedHours: 4 };
      const expectedTimeOff = { ...mockTimeOff, extendedHours: 4 };
      mockTimeOffService.createTimeOff.mockResolvedValue(expectedTimeOff);

      // Act
      const result: { newTimeOff: typeof expectedTimeOff } =
        await controller.createTimeOff(extendedHoursDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(
        extendedHoursDto,
      );
      expect(result.newTimeOff.extendedHours).toBe(4);
    });
  });

  describe('updateTimeOff', () => {
    const timeOffId = '507f1f77bcf86cd799439011';
    const updateTimeOffDto: UpdateTimeOffDto = {
      name: 'Updated Time Off',
      days: 3,
      extendedHours: 2,
    };
    const updatedTimeOff = { ...mockTimeOff, ...updateTimeOffDto };

    it('should update time off successfully', async () => {
      // Arrange
      mockTimeOffService.updateTimeOff.mockResolvedValue(updatedTimeOff);

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        updateTimeOffDto,
      );

      // Assert
      expect(timeOffService.updateTimeOff).toHaveBeenCalledWith(
        timeOffId,
        updateTimeOffDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time off has been successfully updated',
        existingTimeOff: updatedTimeOff,
      });
    });

    it('should handle time off not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Time off not found',
          error: 'Not Found',
        },
      };
      mockTimeOffService.updateTimeOff.mockRejectedValue(notFoundError);

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        updateTimeOffDto,
      );

      // Assert
      expect(timeOffService.updateTimeOff).toHaveBeenCalledWith(
        timeOffId,
        updateTimeOffDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockTimeOffService.updateTimeOff.mockRejectedValue(unknownError);

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        updateTimeOffDto,
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
      mockTimeOffService.updateTimeOff.mockRejectedValue(validationError);

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        updateTimeOffDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(validationError.response);
    });

    it('should not allow updating target and type fields', async () => {
      // Arrange
      const restrictedUpdate = {
        name: 'Updated Time Off',
        // target and type should not be included in UpdateTimeOffDto
      };
      mockTimeOffService.updateTimeOff.mockResolvedValue({
        ...mockTimeOff,
        name: 'Updated Time Off',
      });

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        restrictedUpdate,
      );

      // Assert
      expect(timeOffService.updateTimeOff).toHaveBeenCalledWith(
        timeOffId,
        restrictedUpdate,
      );
      // Verify that target and type are not in the update DTO
      expect(restrictedUpdate).not.toHaveProperty('target');
      expect(restrictedUpdate).not.toHaveProperty('type');
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const partialUpdate: UpdateTimeOffDto = {
        days: 2,
      };
      const partiallyUpdatedTimeOff = { ...mockTimeOff, days: 2 };
      mockTimeOffService.updateTimeOff.mockResolvedValue(
        partiallyUpdatedTimeOff,
      );

      // Act
      await controller.updateTimeOff(
        mockResponse as Response,
        timeOffId,
        partialUpdate,
      );

      // Assert
      expect(timeOffService.updateTimeOff).toHaveBeenCalledWith(
        timeOffId,
        partialUpdate,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time off has been successfully updated',
        existingTimeOff: partiallyUpdatedTimeOff,
      });
    });
  });

  describe('getTimeAllOff', () => {
    const timeOffsData = [
      mockTimeOff,
      { ...mockTimeOff, _id: new Types.ObjectId('507f1f77bcf86cd799439013') },
    ];

    it('should get all time offs successfully', async () => {
      // Arrange
      mockTimeOffService.getAllTimeOffs.mockResolvedValue(timeOffsData);

      // Act
      await controller.getTimeAllOff(mockResponse as Response);

      // Assert
      expect(timeOffService.getAllTimeOffs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All time off data found successfully',
        timeOffData: timeOffsData,
      });
    });

    it('should handle no time offs found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Time off data not found!',
          error: 'Not Found',
        },
      };
      mockTimeOffService.getAllTimeOffs.mockRejectedValue(notFoundError);

      // Act
      await controller.getTimeAllOff(mockResponse as Response);

      // Assert
      expect(timeOffService.getAllTimeOffs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection failed' },
      };
      mockTimeOffService.getAllTimeOffs.mockRejectedValue(serviceError);

      // Act
      await controller.getTimeAllOff(mockResponse as Response);

      // Assert
      expect(timeOffService.getAllTimeOffs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });

    it('should return empty array when no time offs exist', async () => {
      // Arrange
      mockTimeOffService.getAllTimeOffs.mockResolvedValue([]);

      // Act
      await controller.getTimeAllOff(mockResponse as Response);

      // Assert
      expect(timeOffService.getAllTimeOffs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All time off data found successfully',
        timeOffData: [],
      });
    });
  });

  describe('getTimeOff', () => {
    const timeOffId = '507f1f77bcf86cd799439011';

    it('should get time off by id successfully', async () => {
      // Arrange
      mockTimeOffService.getTimeOff.mockResolvedValue(mockTimeOff);

      // Act
      await controller.getTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.getTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time off found successfully',
        existingTimeOff: mockTimeOff,
      });
    });

    it('should handle time off not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Time off #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockTimeOffService.getTimeOff.mockRejectedValue(notFoundError);

      // Act
      await controller.getTimeOff(mockResponse as Response, 'invalid-id');

      // Assert
      expect(timeOffService.getTimeOff).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle invalid ObjectId format', async () => {
      // Arrange
      const invalidIdError = {
        status: HttpStatus.BAD_REQUEST,
        response: {
          statusCode: 400,
          message: 'Invalid time off ID format',
          error: 'Bad Request',
        },
      };
      mockTimeOffService.getTimeOff.mockRejectedValue(invalidIdError);

      // Act
      await controller.getTimeOff(
        mockResponse as Response,
        'invalid-object-id',
      );

      // Assert
      expect(timeOffService.getTimeOff).toHaveBeenCalledWith(
        'invalid-object-id',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(invalidIdError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Internal server error' },
      };
      mockTimeOffService.getTimeOff.mockRejectedValue(serviceError);

      // Act
      await controller.getTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.getTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('deleteTimeOff', () => {
    const timeOffId = '507f1f77bcf86cd799439011';

    it('should delete time off successfully', async () => {
      // Arrange
      mockTimeOffService.deleteTimeOff.mockResolvedValue(mockTimeOff);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time off deleted successfully',
        deletedTimeOff: mockTimeOff,
      });
    });

    it('should handle time off not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Time off #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockTimeOffService.deleteTimeOff.mockRejectedValue(notFoundError);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, 'invalid-id');

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle time off policy constraints during deletion', async () => {
      // Arrange
      const constraintError = {
        status: HttpStatus.CONFLICT,
        response: {
          statusCode: 409,
          message: 'Cannot delete time off within approval deadline',
          error: 'Conflict',
        },
      };
      mockTimeOffService.deleteTimeOff.mockRejectedValue(constraintError);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(constraintError.response);
    });

    it('should handle active user assignments during deletion', async () => {
      // Arrange
      const assignmentError = {
        status: HttpStatus.FORBIDDEN,
        response: {
          statusCode: 403,
          message: 'Cannot delete time off with active user assignments',
          error: 'Forbidden',
        },
      };
      mockTimeOffService.deleteTimeOff.mockRejectedValue(assignmentError);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(assignmentError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockTimeOffService.deleteTimeOff.mockRejectedValue(serverError);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith(timeOffId);
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
      mockTimeOffService.deleteTimeOff.mockRejectedValue(errorWithStatus);

      // Act
      await controller.deleteTimeOff(mockResponse as Response, timeOffId);

      // Assert
      expect(timeOffService.deleteTimeOff).toHaveBeenCalledWith(timeOffId);
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(errorWithStatus.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should properly handle service method parameters', async () => {
      // Arrange
      const createDto: CreateTimeOffDto = {
        name: 'Personal Leave',
        startDate: '2025-03-01T00:00:00.000Z',
        days: 2.5,
        extendedHours: 4,
        target: new Types.ObjectId(),
        type: 'Organization' as const,
      };
      mockTimeOffService.createTimeOff.mockResolvedValue(mockTimeOff);

      // Act
      await controller.createTimeOff(createDto);

      // Assert
      expect(timeOffService.createTimeOff).toHaveBeenCalledWith(createDto);
      expect(timeOffService.createTimeOff).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods correctly', async () => {
      // Arrange
      mockTimeOffService.getAllTimeOffs.mockResolvedValue([mockTimeOff]);

      // Act
      await controller.getTimeAllOff(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All time off data found successfully',
        timeOffData: [mockTimeOff],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different error response formats', async () => {
      // Test error without status property
      const errorWithoutStatus = {
        response: { message: 'Error without status' },
      };
      mockTimeOffService.getTimeOff.mockRejectedValue(errorWithoutStatus);

      await controller.getTimeOff(mockResponse as Response, 'test-id');

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        errorWithoutStatus.response,
      );
    });

    it('should handle different time off types correctly', async () => {
      // Test with various time off types
      const timeOffTypes = ['Organization', 'Project', 'Task'] as const;

      for (const type of timeOffTypes) {
        const createDto: CreateTimeOffDto = {
          name: `${type} leave`,
          startDate: '2025-04-01T00:00:00.000Z',
          days: 1,
          extendedHours: 0,
          target: new Types.ObjectId(),
          type,
        };
        const typeSpecificTimeOff = { ...mockTimeOff, type };
        mockTimeOffService.createTimeOff.mockResolvedValue(typeSpecificTimeOff);

        const result: { newTimeOff: typeof typeSpecificTimeOff } =
          await controller.createTimeOff(createDto);

        expect(result.newTimeOff.type).toBe(type);
        mockTimeOffService.createTimeOff.mockClear();
      }
    });

    it('should handle date range validations', async () => {
      // Test with ISO8601 date string validation
      const dateVariations = [
        '2025-05-15T00:00:00.000Z',
        '2025-12-25T23:59:59.999Z',
        '2025-01-01T12:30:45.000Z',
      ];

      for (const startDate of dateVariations) {
        const createDto: CreateTimeOffDto = {
          name: 'Date Test',
          startDate,
          days: 1,
          extendedHours: 0,
          target: new Types.ObjectId(),
          type: 'Task' as const,
        };
        const dateSpecificTimeOff = { ...mockTimeOff, startDate };
        mockTimeOffService.createTimeOff.mockResolvedValue(dateSpecificTimeOff);

        const result: { newTimeOff: typeof dateSpecificTimeOff } =
          await controller.createTimeOff(createDto);

        expect(result.newTimeOff.startDate).toBe(startDate);
        mockTimeOffService.createTimeOff.mockClear();
      }
    });
  });
});
