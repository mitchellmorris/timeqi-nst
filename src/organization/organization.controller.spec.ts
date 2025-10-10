/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let organizationService: OrganizationService;
  let mockResponse: Partial<Response>;

  const mockOrganizationService = {
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    getAllOrganizations: jest.fn(),
    getOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  };

  const mockOrganization = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Organization',
    sponsor: new Types.ObjectId('507f1f77bcf86cd799439012'),
    workshift: 8,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
    projects: [],
    users: [],
    timeOff: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    organizationService = module.get<OrganizationService>(OrganizationService);

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

  describe('createOrganization', () => {
    const createOrganizationDto: CreateOrganizationDto = {
      name: 'New Organization',
      sponsor: new Types.ObjectId('507f1f77bcf86cd799439012'),
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC',
      endOfDayHour: 17,
      endOfDayMin: 0,
    };

    it('should create organization successfully', async () => {
      // Arrange
      mockOrganizationService.createOrganization.mockResolvedValue(
        mockOrganization,
      );

      // Act
      const result = await controller.createOrganization(createOrganizationDto);

      // Assert
      expect(organizationService.createOrganization).toHaveBeenCalledWith(
        createOrganizationDto,
      );
      expect(result).toEqual({
        message: 'Organization has been created successfully',
        newOrganization: mockOrganization,
      });
    });

    it('should throw HttpException when organization creation fails', async () => {
      // Arrange
      mockOrganizationService.createOrganization.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        controller.createOrganization(createOrganizationDto),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'Error: Organization not created!',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(organizationService.createOrganization).toHaveBeenCalledWith(
        createOrganizationDto,
      );
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockOrganizationService.createOrganization.mockResolvedValue(
        mockOrganization,
      );

      // Act
      await controller.createOrganization(createOrganizationDto);

      // Assert
      expect(organizationService.createOrganization).toHaveBeenCalledWith(
        createOrganizationDto,
      );
      expect(organizationService.createOrganization).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors and throw HttpException', async () => {
      // Arrange
      const serviceError = new Error('Validation failed');
      mockOrganizationService.createOrganization.mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      const expectedError = new HttpException(
        {
          message: 'Error: Organization not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      await expect(
        controller.createOrganization(createOrganizationDto),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('updateOrganization', () => {
    const organizationId = '507f1f77bcf86cd799439011';
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
      workshift: 7,
    };
    const updatedOrganization = {
      ...mockOrganization,
      ...updateOrganizationDto,
    };

    it('should update organization successfully', async () => {
      // Arrange
      mockOrganizationService.updateOrganization.mockResolvedValue(
        updatedOrganization,
      );

      // Act
      await controller.updateOrganization(
        mockResponse as Response,
        organizationId,
        updateOrganizationDto,
      );

      // Assert
      expect(organizationService.updateOrganization).toHaveBeenCalledWith(
        organizationId,
        updateOrganizationDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization has been successfully updated',
        existingOrganization: updatedOrganization,
      });
    });

    it('should handle organization not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Organization not found',
          error: 'Not Found',
        },
      };
      mockOrganizationService.updateOrganization.mockRejectedValue(
        notFoundError,
      );

      // Act
      await controller.updateOrganization(
        mockResponse as Response,
        organizationId,
        updateOrganizationDto,
      );

      // Assert
      expect(organizationService.updateOrganization).toHaveBeenCalledWith(
        organizationId,
        updateOrganizationDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockOrganizationService.updateOrganization.mockRejectedValue(
        unknownError,
      );

      // Act
      await controller.updateOrganization(
        mockResponse as Response,
        organizationId,
        updateOrganizationDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(unknownError.response);
    });
  });

  describe('getOrganizations', () => {
    const organizationsData = [
      mockOrganization,
      {
        ...mockOrganization,
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
      },
    ];

    it('should get all organizations successfully', async () => {
      // Arrange
      mockOrganizationService.getAllOrganizations.mockResolvedValue(
        organizationsData,
      );

      // Act
      await controller.getOrganizations(mockResponse as Response);

      // Assert
      expect(organizationService.getAllOrganizations).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizations data found successfully',
        organizationData: organizationsData,
      });
    });

    it('should handle no organizations found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Organizations data not found!',
          error: 'Not Found',
        },
      };
      mockOrganizationService.getAllOrganizations.mockRejectedValue(
        notFoundError,
      );

      // Act
      await controller.getOrganizations(mockResponse as Response);

      // Assert
      expect(organizationService.getAllOrganizations).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection failed' },
      };
      mockOrganizationService.getAllOrganizations.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizations(mockResponse as Response);

      // Assert
      expect(organizationService.getAllOrganizations).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('getOrganization', () => {
    const organizationId = '507f1f77bcf86cd799439011';

    it('should get organization by id successfully', async () => {
      // Arrange
      mockOrganizationService.getOrganization.mockResolvedValue(
        mockOrganization,
      );

      // Act
      await controller.getOrganization(
        mockResponse as Response,
        organizationId,
      );

      // Assert
      expect(organizationService.getOrganization).toHaveBeenCalledWith(
        organizationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization found successfully',
        existingOrganization: mockOrganization,
      });
    });

    it('should handle organization not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Organization #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockOrganizationService.getOrganization.mockRejectedValue(notFoundError);

      // Act
      await controller.getOrganization(mockResponse as Response, 'invalid-id');

      // Assert
      expect(organizationService.getOrganization).toHaveBeenCalledWith(
        'invalid-id',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Internal server error' },
      };
      mockOrganizationService.getOrganization.mockRejectedValue(serviceError);

      // Act
      await controller.getOrganization(
        mockResponse as Response,
        organizationId,
      );

      // Assert
      expect(organizationService.getOrganization).toHaveBeenCalledWith(
        organizationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('deleteOrganization', () => {
    const organizationId = '507f1f77bcf86cd799439011';

    it('should delete organization successfully', async () => {
      // Arrange
      mockOrganizationService.deleteOrganization.mockResolvedValue(
        mockOrganization,
      );

      // Act
      await controller.deleteOrganization(
        mockResponse as Response,
        organizationId,
      );

      // Assert
      expect(organizationService.deleteOrganization).toHaveBeenCalledWith(
        organizationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization deleted successfully',
        deletedOrganization: mockOrganization,
      });
    });

    it('should handle organization not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Organization #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockOrganizationService.deleteOrganization.mockRejectedValue(
        notFoundError,
      );

      // Act
      await controller.deleteOrganization(
        mockResponse as Response,
        'invalid-id',
      );

      // Assert
      expect(organizationService.deleteOrganization).toHaveBeenCalledWith(
        'invalid-id',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockOrganizationService.deleteOrganization.mockRejectedValue(serverError);

      // Act
      await controller.deleteOrganization(
        mockResponse as Response,
        organizationId,
      );

      // Assert
      expect(organizationService.deleteOrganization).toHaveBeenCalledWith(
        organizationId,
      );
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
      mockOrganizationService.deleteOrganization.mockRejectedValue(
        errorWithStatus,
      );

      // Act
      await controller.deleteOrganization(
        mockResponse as Response,
        organizationId,
      );

      // Assert
      expect(organizationService.deleteOrganization).toHaveBeenCalledWith(
        organizationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(errorWithStatus.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should properly handle service method parameters', async () => {
      // Arrange
      const createDto: CreateOrganizationDto = {
        name: 'Test Org',
        sponsor: new Types.ObjectId(),
        workshift: 8,
        weekdays: ['Monday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      mockOrganizationService.createOrganization.mockResolvedValue(
        mockOrganization,
      );

      // Act
      await controller.createOrganization(createDto);

      // Assert
      expect(organizationService.createOrganization).toHaveBeenCalledWith(
        createDto,
      );
      expect(organizationService.createOrganization).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods correctly', async () => {
      // Arrange
      mockOrganizationService.getAllOrganizations.mockResolvedValue([
        mockOrganization,
      ]);

      // Act
      await controller.getOrganizations(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizations data found successfully',
        organizationData: [mockOrganization],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different error response formats', async () => {
      // Test error without status property
      const errorWithoutStatus = {
        response: { message: 'Error without status' },
      };
      mockOrganizationService.getOrganization.mockRejectedValue(
        errorWithoutStatus,
      );

      await controller.getOrganization(mockResponse as Response, 'test-id');

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        errorWithoutStatus.response,
      );
    });
  });
});
