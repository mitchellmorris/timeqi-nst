/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { UpdateEntryDto } from '../dto/update-entry.dto';

describe('EntryController', () => {
  let controller: EntryController;
  let entryService: EntryService;
  let mockResponse: Partial<Response>;

  const mockEntryService = {
    createEntry: jest.fn(),
    updateEntry: jest.fn(),
    getAllEntries: jest.fn(),
    getEntry: jest.fn(),
    deleteEntry: jest.fn(),
  };

  const mockEntry = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Development Work',
    hours: 8,
    description: 'Working on feature implementation',
    date: new Date('2025-01-15T00:00:00.000Z'),
    forecast: 2.5,
    performer: new Types.ObjectId('507f1f77bcf86cd799439012'),
    organization: new Types.ObjectId('507f1f77bcf86cd799439013'),
    project: new Types.ObjectId('507f1f77bcf86cd799439014'),
    task: new Types.ObjectId('507f1f77bcf86cd799439015'),
    createdAt: new Date('2025-01-15T09:00:00.000Z'),
    updatedAt: new Date('2025-01-15T09:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        {
          provide: EntryService,
          useValue: mockEntryService,
        },
      ],
    }).compile();

    controller = module.get<EntryController>(EntryController);
    entryService = module.get<EntryService>(EntryService);

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

  describe('createEntry', () => {
    const createEntryDto: CreateEntryDto = {
      name: 'Development Work',
      hours: 8,
      description: 'Working on feature implementation',
      date: new Date('2025-01-15T00:00:00.000Z'),
      forecast: 2.5,
      performer: new Types.ObjectId('507f1f77bcf86cd799439012'),
      organization: new Types.ObjectId('507f1f77bcf86cd799439013'),
      project: new Types.ObjectId('507f1f77bcf86cd799439014'),
      task: new Types.ObjectId('507f1f77bcf86cd799439015'),
    };

    it('should create entry successfully', async () => {
      // Arrange
      mockEntryService.createEntry.mockResolvedValue(mockEntry);

      // Act
      const result = await controller.createEntry(createEntryDto);

      // Assert
      expect(entryService.createEntry).toHaveBeenCalledWith(createEntryDto);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Entry has been created successfully',
        newEntry: mockEntry,
      });
    });

    it('should throw HttpException when entry creation fails', async () => {
      // Arrange
      mockEntryService.createEntry.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(controller.createEntry(createEntryDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error: Organization not created!',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(entryService.createEntry).toHaveBeenCalledWith(createEntryDto);
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockEntryService.createEntry.mockResolvedValue(mockEntry);

      // Act
      await controller.createEntry(createEntryDto);

      // Assert
      expect(entryService.createEntry).toHaveBeenCalledWith(createEntryDto);
      expect(entryService.createEntry).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors and throw HttpException', async () => {
      // Arrange
      const serviceError = new Error('Validation failed');
      mockEntryService.createEntry.mockRejectedValue(serviceError);

      // Act & Assert
      const expectedError = new HttpException(
        {
          message: 'Error: Organization not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      await expect(controller.createEntry(createEntryDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('should return the exact entry data from service', async () => {
      // Arrange
      const customEntry = { ...mockEntry, name: 'Custom Entry Name' };
      mockEntryService.createEntry.mockResolvedValue(customEntry);

      // Act
      const result = await controller.createEntry(createEntryDto);

      // Assert
      expect(result.newEntry).toEqual(customEntry);
      expect(result.newEntry.name).toBe('Custom Entry Name');
      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });

    it('should handle different hour values', async () => {
      // Arrange
      const entryWithDifferentHours = { ...createEntryDto, hours: 4.5 };
      const expectedEntry = { ...mockEntry, hours: 4.5 };
      mockEntryService.createEntry.mockResolvedValue(expectedEntry);

      // Act
      const result = await controller.createEntry(entryWithDifferentHours);

      // Assert
      expect(entryService.createEntry).toHaveBeenCalledWith(
        entryWithDifferentHours,
      );
      expect(result.newEntry.hours).toBe(4.5);
    });

    it('should handle forecast value from PickType', async () => {
      // Arrange
      const entryWithForecast = { ...createEntryDto, forecast: 1.8 };
      const expectedEntry = { ...mockEntry, forecast: 1.8 };
      mockEntryService.createEntry.mockResolvedValue(expectedEntry);

      // Act
      const result = await controller.createEntry(entryWithForecast);

      // Assert
      expect(entryService.createEntry).toHaveBeenCalledWith(entryWithForecast);
      expect(result.newEntry.forecast).toBe(1.8);
    });
  });

  describe('updateEntry', () => {
    const entryId = '507f1f77bcf86cd799439011';
    const updateEntryDto: UpdateEntryDto = {
      name: 'Updated Entry',
      hours: 6,
      description: 'Updated description',
    };
    const updatedEntry = { ...mockEntry, ...updateEntryDto };

    it('should update entry successfully', async () => {
      // Arrange
      mockEntryService.updateEntry.mockResolvedValue(updatedEntry);

      // Act
      await controller.updateEntry(
        mockResponse as Response,
        entryId,
        updateEntryDto,
      );

      // Assert
      expect(entryService.updateEntry).toHaveBeenCalledWith(
        entryId,
        updateEntryDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Entry has been successfully updated',
        existingEntry: updatedEntry,
      });
    });

    it('should handle entry not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Entry not found',
          error: 'Not Found',
        },
      };
      mockEntryService.updateEntry.mockRejectedValue(notFoundError);

      // Act
      await controller.updateEntry(
        mockResponse as Response,
        entryId,
        updateEntryDto,
      );

      // Assert
      expect(entryService.updateEntry).toHaveBeenCalledWith(
        entryId,
        updateEntryDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockEntryService.updateEntry.mockRejectedValue(unknownError);

      // Act
      await controller.updateEntry(
        mockResponse as Response,
        entryId,
        updateEntryDto,
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
      mockEntryService.updateEntry.mockRejectedValue(validationError);

      // Act
      await controller.updateEntry(
        mockResponse as Response,
        entryId,
        updateEntryDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(validationError.response);
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const partialUpdate: UpdateEntryDto = {
        hours: 7.5,
      };
      const partiallyUpdatedEntry = { ...mockEntry, hours: 7.5 };
      mockEntryService.updateEntry.mockResolvedValue(partiallyUpdatedEntry);

      // Act
      await controller.updateEntry(
        mockResponse as Response,
        entryId,
        partialUpdate,
      );

      // Assert
      expect(entryService.updateEntry).toHaveBeenCalledWith(
        entryId,
        partialUpdate,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Entry has been successfully updated',
        existingEntry: partiallyUpdatedEntry,
      });
    });
  });

  describe('getEntries', () => {
    const entriesData = [
      mockEntry,
      { ...mockEntry, _id: new Types.ObjectId('507f1f77bcf86cd799439016') },
    ];

    it('should get all entries successfully', async () => {
      // Arrange
      mockEntryService.getAllEntries.mockResolvedValue(entriesData);

      // Act
      await controller.getEntries(mockResponse as Response);

      // Assert
      expect(entryService.getAllEntries).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All entries data found successfully',
        entryData: entriesData,
      });
    });

    it('should handle no entries found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Entries data not found!',
          error: 'Not Found',
        },
      };
      mockEntryService.getAllEntries.mockRejectedValue(notFoundError);

      // Act
      await controller.getEntries(mockResponse as Response);

      // Assert
      expect(entryService.getAllEntries).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection failed' },
      };
      mockEntryService.getAllEntries.mockRejectedValue(serviceError);

      // Act
      await controller.getEntries(mockResponse as Response);

      // Assert
      expect(entryService.getAllEntries).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });

    it('should return empty array when no entries exist', async () => {
      // Arrange
      mockEntryService.getAllEntries.mockResolvedValue([]);

      // Act
      await controller.getEntries(mockResponse as Response);

      // Assert
      expect(entryService.getAllEntries).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All entries data found successfully',
        entryData: [],
      });
    });
  });

  describe('getEntry', () => {
    const entryId = '507f1f77bcf86cd799439011';

    it('should get entry by id successfully', async () => {
      // Arrange
      mockEntryService.getEntry.mockResolvedValue(mockEntry);

      // Act
      await controller.getEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.getEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Entry found successfully',
        existingEntry: mockEntry,
      });
    });

    it('should handle entry not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Entry #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockEntryService.getEntry.mockRejectedValue(notFoundError);

      // Act
      await controller.getEntry(mockResponse as Response, 'invalid-id');

      // Assert
      expect(entryService.getEntry).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle invalid ObjectId format', async () => {
      // Arrange
      const invalidIdError = {
        status: HttpStatus.BAD_REQUEST,
        response: {
          statusCode: 400,
          message: 'Invalid entry ID format',
          error: 'Bad Request',
        },
      };
      mockEntryService.getEntry.mockRejectedValue(invalidIdError);

      // Act
      await controller.getEntry(mockResponse as Response, 'invalid-object-id');

      // Assert
      expect(entryService.getEntry).toHaveBeenCalledWith('invalid-object-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(invalidIdError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Internal server error' },
      };
      mockEntryService.getEntry.mockRejectedValue(serviceError);

      // Act
      await controller.getEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.getEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('deleteEntry', () => {
    const entryId = '507f1f77bcf86cd799439011';

    it('should delete entry successfully', async () => {
      // Arrange
      mockEntryService.deleteEntry.mockResolvedValue(mockEntry);

      // Act
      await controller.deleteEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Entry deleted successfully',
        deletedEntry: mockEntry,
      });
    });

    it('should handle entry not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Entry #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockEntryService.deleteEntry.mockRejectedValue(notFoundError);

      // Act
      await controller.deleteEntry(mockResponse as Response, 'invalid-id');

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle time tracking constraints during deletion', async () => {
      // Arrange
      const constraintError = {
        status: HttpStatus.CONFLICT,
        response: {
          statusCode: 409,
          message: 'Cannot delete entry within locked time period',
          error: 'Conflict',
        },
      };
      mockEntryService.deleteEntry.mockRejectedValue(constraintError);

      // Act
      await controller.deleteEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(constraintError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockEntryService.deleteEntry.mockRejectedValue(serverError);

      // Act
      await controller.deleteEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith(entryId);
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
      mockEntryService.deleteEntry.mockRejectedValue(errorWithStatus);

      // Act
      await controller.deleteEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(errorWithStatus.response);
    });

    it('should handle entry permission errors', async () => {
      // Arrange
      const permissionError = {
        status: HttpStatus.FORBIDDEN,
        response: {
          statusCode: 403,
          message: 'Not authorized to delete this entry',
          error: 'Forbidden',
        },
      };
      mockEntryService.deleteEntry.mockRejectedValue(permissionError);

      // Act
      await controller.deleteEntry(mockResponse as Response, entryId);

      // Assert
      expect(entryService.deleteEntry).toHaveBeenCalledWith(entryId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(permissionError.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should properly handle service method parameters', async () => {
      // Arrange
      const createDto: CreateEntryDto = {
        name: 'Test Entry',
        hours: 5.5,
        description: 'Test description',
        date: new Date('2025-02-01T00:00:00.000Z'),
        forecast: 1.2,
        performer: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
      };
      mockEntryService.createEntry.mockResolvedValue(mockEntry);

      // Act
      await controller.createEntry(createDto);

      // Assert
      expect(entryService.createEntry).toHaveBeenCalledWith(createDto);
      expect(entryService.createEntry).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods correctly', async () => {
      // Arrange
      mockEntryService.getAllEntries.mockResolvedValue([mockEntry]);

      // Act
      await controller.getEntries(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All entries data found successfully',
        entryData: [mockEntry],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different error response formats', async () => {
      // Test error without status property
      const errorWithoutStatus = {
        response: { message: 'Error without status' },
      };
      mockEntryService.getEntry.mockRejectedValue(errorWithoutStatus);

      await controller.getEntry(mockResponse as Response, 'test-id');

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        errorWithoutStatus.response,
      );
    });

    it('should handle date-related operations correctly', async () => {
      // Test with different date formats
      const entryWithSpecificDate = {
        ...mockEntry,
        date: new Date('2025-03-15T14:30:00.000Z'),
      };
      const createDtoWithDate: CreateEntryDto = {
        name: 'Date Test Entry',
        hours: 3,
        description: 'Testing date handling',
        date: new Date('2025-03-15T14:30:00.000Z'),
        forecast: 0.8,
        performer: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
      };
      mockEntryService.createEntry.mockResolvedValue(entryWithSpecificDate);

      const result = await controller.createEntry(createDtoWithDate);

      expect(entryService.createEntry).toHaveBeenCalledWith(createDtoWithDate);
      expect(result.newEntry.date).toEqual(
        new Date('2025-03-15T14:30:00.000Z'),
      );
    });

    it('should handle PickType forecast inheritance correctly', async () => {
      // Test forecast field from CreateScenarioDto
      const createDtoWithForecast: CreateEntryDto = {
        name: 'Forecast Test',
        hours: 4,
        description: 'Testing forecast inheritance',
        date: new Date('2025-01-20T00:00:00.000Z'),
        forecast: 3.7, // From PickType(CreateScenarioDto, ['forecast'])
        performer: new Types.ObjectId(),
        organization: new Types.ObjectId(),
        project: new Types.ObjectId(),
        task: new Types.ObjectId(),
      };
      const entryWithForecast = { ...mockEntry, forecast: 3.7 };
      mockEntryService.createEntry.mockResolvedValue(entryWithForecast);

      const result = await controller.createEntry(createDtoWithForecast);

      expect(result.newEntry.forecast).toBe(3.7);
    });
  });
});
