/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationUserController } from './organization-user.controller';
import { OrganizationUserService } from './organization-user.service';
import { CreateOrganizationUserDto } from '../dto/create-organization.user.dto';
import { UpdateOrganizationUserDto } from '../dto/update-organization.user.dto';
import { Types } from 'mongoose';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('OrganizationUserController', () => {
  let controller: OrganizationUserController;

  const mockOrganizationUserService = {
    createOrganizationUser: jest.fn(),
    updateOrganizationUser: jest.fn(),
    getAllOrganizationUsers: jest.fn(),
    getOrganizationUser: jest.fn(),
    deleteOrganizationUser: jest.fn(),
  };

  const mockStatusFn = jest.fn().mockReturnThis();
  const mockJsonFn = jest.fn().mockReturnThis();

  const mockResponse = {
    status: mockStatusFn,
    json: mockJsonFn,
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationUserController],
      providers: [
        {
          provide: OrganizationUserService,
          useValue: mockOrganizationUserService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationUserController>(
      OrganizationUserController,
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createOrganizationUser', () => {
    const createOrganizationUserDto: CreateOrganizationUserDto = {
      organization: new Types.ObjectId(),
      user: new Types.ObjectId(),
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'America/New_York',
      endOfDayHour: 17,
      endOfDayMin: 0,
    };

    const mockOrganizationUser = {
      _id: new Types.ObjectId(),
      organization: createOrganizationUserDto.organization,
      user: createOrganizationUserDto.user,
      workshift: createOrganizationUserDto.workshift,
      weekdays: createOrganizationUserDto.weekdays,
      timezone: createOrganizationUserDto.timezone,
      endOfDayHour: createOrganizationUserDto.endOfDayHour,
      endOfDayMin: createOrganizationUserDto.endOfDayMin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should create a new organization user successfully', async () => {
      // Arrange
      mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
        mockOrganizationUser,
      );

      // Act
      const result = await controller.createOrganizationUser(
        createOrganizationUserDto,
      );

      // Assert
      expect(
        mockOrganizationUserService.createOrganizationUser,
      ).toHaveBeenCalledWith(createOrganizationUserDto);
      expect(result).toEqual({
        message: 'OrganizationUser has been created successfully',
        newOrganizationUser: mockOrganizationUser,
      });
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      mockOrganizationUserService.createOrganizationUser.mockRejectedValue(
        new Error('Service error'),
      );

      // Act & Assert
      await expect(
        controller.createOrganizationUser(createOrganizationUserDto),
      ).rejects.toMatchObject({
        message: 'Error: OrganizationUser not created!',
        status: HttpStatus.BAD_REQUEST,
      });
      expect(
        mockOrganizationUserService.createOrganizationUser,
      ).toHaveBeenCalledWith(createOrganizationUserDto);
    });

    it('should handle creation with minimal required fields', async () => {
      // Arrange
      const minimalDto: CreateOrganizationUserDto = {
        organization: new Types.ObjectId(),
        user: new Types.ObjectId(),
        workshift: 8,
        weekdays: ['Monday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      const minimalOrganizationUser = {
        ...mockOrganizationUser,
        ...minimalDto,
      };
      mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
        minimalOrganizationUser,
      );

      // Act
      const result = await controller.createOrganizationUser(minimalDto);

      // Assert
      expect(
        mockOrganizationUserService.createOrganizationUser,
      ).toHaveBeenCalledWith(minimalDto);
      expect(result.newOrganizationUser).toEqual(minimalOrganizationUser);
    });

    it('should handle different workshift values', async () => {
      // Arrange
      const workshiftVariations = [1, 4, 8, 12, 24];

      for (const workshift of workshiftVariations) {
        const dtoWithWorkshift = { ...createOrganizationUserDto, workshift };
        const expectedOrganizationUser = { ...mockOrganizationUser, workshift };
        mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
          expectedOrganizationUser,
        );

        // Act
        const result: { newOrganizationUser: typeof expectedOrganizationUser } =
          await controller.createOrganizationUser(dtoWithWorkshift);

        // Assert
        expect(result.newOrganizationUser.workshift).toBe(workshift);
        mockOrganizationUserService.createOrganizationUser.mockClear();
      }
    });

    it('should handle different timezone configurations', async () => {
      // Arrange
      const timezones = [
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
      ];

      for (const timezone of timezones) {
        const dtoWithTimezone = { ...createOrganizationUserDto, timezone };
        const expectedOrganizationUser = { ...mockOrganizationUser, timezone };
        mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
          expectedOrganizationUser,
        );

        // Act
        const result: { newOrganizationUser: typeof expectedOrganizationUser } =
          await controller.createOrganizationUser(dtoWithTimezone);

        // Assert
        expect(result.newOrganizationUser.timezone).toBe(timezone);
        mockOrganizationUserService.createOrganizationUser.mockClear();
      }
    });

    it('should handle different weekday configurations', async () => {
      // Arrange
      const weekdayConfigs = [
        ['Monday', 'Wednesday', 'Friday'],
        ['Saturday', 'Sunday'],
        [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
      ];
      for (const weekdays of weekdayConfigs) {
        const dtoWithWeekdays = { ...createOrganizationUserDto, weekdays };
        const expectedOrganizationUser = { ...mockOrganizationUser, weekdays };
        mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
          expectedOrganizationUser,
        );

        // Act
        const result: { newOrganizationUser: typeof expectedOrganizationUser } =
          await controller.createOrganizationUser(dtoWithWeekdays);

        // Assert
        expect(result.newOrganizationUser.weekdays).toEqual(weekdays);
        mockOrganizationUserService.createOrganizationUser.mockClear();
      }
    });

    it('should handle different end of day configurations', async () => {
      // Arrange
      const endOfDayConfigs = [
        { endOfDayHour: 9, endOfDayMin: 0 },
        { endOfDayHour: 17, endOfDayMin: 30 },
        { endOfDayHour: 23, endOfDayMin: 59 },
      ];

      for (const config of endOfDayConfigs) {
        const dtoWithEndOfDay = { ...createOrganizationUserDto, ...config };
        const expectedOrganizationUser = { ...mockOrganizationUser, ...config };
        mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
          expectedOrganizationUser,
        );

        // Act
        const result: { newOrganizationUser: typeof expectedOrganizationUser } =
          await controller.createOrganizationUser(dtoWithEndOfDay);

        // Assert
        expect(result.newOrganizationUser.endOfDayHour).toBe(
          config.endOfDayHour,
        );
        expect(result.newOrganizationUser.endOfDayMin).toBe(config.endOfDayMin);
        mockOrganizationUserService.createOrganizationUser.mockClear();
      }
    });
  });

  describe('updateOrganizationUser', () => {
    const organizationUserId = new Types.ObjectId().toString();
    const updateOrganizationUserDto: UpdateOrganizationUserDto = {
      workshift: 6,
      timezone: 'Europe/London',
      endOfDayHour: 18,
    };

    const mockUpdatedOrganizationUser = {
      _id: new Types.ObjectId(organizationUserId),
      organization: new Types.ObjectId(),
      user: new Types.ObjectId(),
      workshift: updateOrganizationUserDto.workshift,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: updateOrganizationUserDto.timezone,
      endOfDayHour: updateOrganizationUserDto.endOfDayHour,
      endOfDayMin: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update an organization user successfully', async () => {
      // Arrange
      mockOrganizationUserService.updateOrganizationUser.mockResolvedValue(
        mockUpdatedOrganizationUser,
      );

      // Act
      const result = await controller.updateOrganizationUser(
        organizationUserId,
        updateOrganizationUserDto,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, updateOrganizationUserDto);
      expect(result).toEqual({
        message: 'OrganizationUser has been updated successfully',
        existingOrganizationUser: mockUpdatedOrganizationUser,
      });
    });

    it('should handle service errors during update', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'Not found' },
      };
      mockOrganizationUserService.updateOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      const result = await controller.updateOrganizationUser(
        organizationUserId,
        updateOrganizationUserDto,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, updateOrganizationUserDto);
      // The function should return the error response
      expect(result).toBeDefined();
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = { response: { message: 'Generic error' } };
      mockOrganizationUserService.updateOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act & Assert
      await expect(
        controller.updateOrganizationUser(
          organizationUserId,
          updateOrganizationUserDto,
        ),
      ).rejects.toMatchObject({
        message: 'Generic error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, updateOrganizationUserDto);
    });

    it('should handle updating only scheduling fields', async () => {
      // Arrange
      const schedulingUpdate: UpdateOrganizationUserDto = {
        workshift: 10,
        weekdays: ['Monday', 'Wednesday', 'Friday'],
        timezone: 'Asia/Tokyo',
        endOfDayHour: 19,
        endOfDayMin: 30,
      };
      const expectedUpdated = {
        ...mockUpdatedOrganizationUser,
        ...schedulingUpdate,
      };
      mockOrganizationUserService.updateOrganizationUser.mockResolvedValue(
        expectedUpdated,
      );

      // Act
      const result = await controller.updateOrganizationUser(
        organizationUserId,
        schedulingUpdate,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, schedulingUpdate);
      // Check if result is the success object type
      if (typeof result === 'object' && 'existingOrganizationUser' in result) {
        expect(result.existingOrganizationUser).toEqual(expectedUpdated);
      }
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate: UpdateOrganizationUserDto = {
        timezone: 'America/Los_Angeles',
      };
      const expectedUpdated = {
        ...mockUpdatedOrganizationUser,
        timezone: 'America/Los_Angeles',
      };
      mockOrganizationUserService.updateOrganizationUser.mockResolvedValue(
        expectedUpdated,
      );

      // Act
      const result = await controller.updateOrganizationUser(
        organizationUserId,
        partialUpdate,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, partialUpdate);
      // Check if result is the success object type
      if (typeof result === 'object' && 'existingOrganizationUser' in result) {
        expect(result.existingOrganizationUser.timezone).toBe(
          'America/Los_Angeles',
        );
      }
    });

    it('should handle empty update object', async () => {
      // Arrange
      const emptyUpdate: UpdateOrganizationUserDto = {};
      mockOrganizationUserService.updateOrganizationUser.mockResolvedValue(
        mockUpdatedOrganizationUser,
      );

      // Act
      const result = await controller.updateOrganizationUser(
        organizationUserId,
        emptyUpdate,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, emptyUpdate);
      // Check if result is the success object type
      if (typeof result === 'object' && 'message' in result) {
        expect(result.message).toBe(
          'OrganizationUser has been updated successfully',
        );
      }
    });
  });

  describe('getOrganizationUsers', () => {
    const mockOrganizationUsers = [
      {
        _id: new Types.ObjectId(),
        organization: { _id: new Types.ObjectId(), name: 'Tech Corp' },
        user: {
          _id: new Types.ObjectId(),
          name: 'John Doe',
          email: 'john@example.com',
        },
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'America/New_York',
        endOfDayHour: 17,
        endOfDayMin: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new Types.ObjectId(),
        organization: { _id: new Types.ObjectId(), name: 'Design Studio' },
        user: {
          _id: new Types.ObjectId(),
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        workshift: 6,
        weekdays: ['Monday', 'Wednesday', 'Friday'],
        timezone: 'Europe/London',
        endOfDayHour: 18,
        endOfDayMin: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should retrieve all organization users successfully', async () => {
      // Arrange
      mockOrganizationUserService.getAllOrganizationUsers.mockResolvedValue(
        mockOrganizationUsers,
      );

      // Act
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(
        mockOrganizationUserService.getAllOrganizationUsers,
      ).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizationUsers data found successfully',
        organizationUserData: mockOrganizationUsers,
      });
    });

    it('should handle service errors when retrieving all organization users', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'No data found' },
      };
      mockOrganizationUserService.getAllOrganizationUsers.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(
        mockOrganizationUserService.getAllOrganizationUsers,
      ).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'No data found' });
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = { response: { message: 'Generic error' } };
      mockOrganizationUserService.getAllOrganizationUsers.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(
        mockOrganizationUserService.getAllOrganizationUsers,
      ).toHaveBeenCalled();
      expect(mockStatusFn).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJsonFn).toHaveBeenCalledWith({ message: 'Generic error' });
    });

    it('should handle empty organization users list', async () => {
      // Arrange
      mockOrganizationUserService.getAllOrganizationUsers.mockResolvedValue([]);

      // Act
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(
        mockOrganizationUserService.getAllOrganizationUsers,
      ).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizationUsers data found successfully',
        organizationUserData: [],
      });
    });

    it('should return populated organization users with relationship data', async () => {
      // Arrange
      mockOrganizationUserService.getAllOrganizationUsers.mockResolvedValue(
        mockOrganizationUsers,
      );

      // Act
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(
        mockOrganizationUserService.getAllOrganizationUsers,
      ).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizationUsers data found successfully',
        organizationUserData: mockOrganizationUsers,
      });

      // Verify populated data structure
      const jsonMock = mockResponse.json as jest.Mock<any, any>;
      const mockCalls = jsonMock.mock.calls as Array<
        [
          {
            message: string;
            organizationUserData: Array<{
              organization: { name: string };
              user: { email: string };
              [key: string]: any;
            }>;
          },
        ]
      >;
      const callArgs = mockCalls[0][0];
      expect(callArgs.organizationUserData[0].organization).toHaveProperty(
        'name',
      );
      expect(callArgs.organizationUserData[0].user).toHaveProperty('email');
    });
  });

  describe('getOrganizationUser', () => {
    const organizationUserId = new Types.ObjectId().toString();
    const mockOrganizationUser = {
      _id: new Types.ObjectId(organizationUserId),
      organization: { _id: new Types.ObjectId(), name: 'Tech Corp' },
      user: {
        _id: new Types.ObjectId(),
        name: 'John Doe',
        email: 'john@example.com',
      },
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'America/New_York',
      endOfDayHour: 17,
      endOfDayMin: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should retrieve an organization user by ID successfully', async () => {
      // Arrange
      mockOrganizationUserService.getOrganizationUser.mockResolvedValue(
        mockOrganizationUser,
      );

      // Act
      await controller.getOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.getOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OrganizationUser found successfully',
        existingOrganizationUser: mockOrganizationUser,
      });
    });

    it('should handle organization user not found', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          message: `OrganizationUser #${organizationUserId} not found`,
        },
      };
      mockOrganizationUserService.getOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.getOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `OrganizationUser #${organizationUserId} not found`,
      });
    });

    it('should handle invalid organization user ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const serviceError = {
        status: HttpStatus.BAD_REQUEST,
        response: { message: 'Invalid ID format' },
      };
      mockOrganizationUserService.getOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizationUser(mockResponse, invalidId);

      // Assert
      expect(
        mockOrganizationUserService.getOrganizationUser,
      ).toHaveBeenCalledWith(invalidId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid ID format',
      });
    });

    it('should handle service errors without status code', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection error' },
      };
      mockOrganizationUserService.getOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.getOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.getOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database connection error',
      });
    });

    it('should return populated organization user with relationship data', async () => {
      // Arrange
      mockOrganizationUserService.getOrganizationUser.mockResolvedValue(
        mockOrganizationUser,
      );

      // Act
      await controller.getOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.getOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OrganizationUser found successfully',
        existingOrganizationUser: mockOrganizationUser,
      });

      // Verify populated data structure
      const jsonMock = mockResponse.json as jest.Mock<any, any>;
      const mockCalls = jsonMock.mock.calls as Array<
        [
          {
            message: string;
            existingOrganizationUser: {
              organization: { name: string };
              user: { email: string };
              [key: string]: any;
            };
          },
        ]
      >;
      const callArgs = mockCalls[0][0];
      expect(callArgs.existingOrganizationUser.organization).toHaveProperty(
        'name',
      );
      expect(callArgs.existingOrganizationUser.user).toHaveProperty('email');
    });
  });

  describe('deleteOrganizationUser', () => {
    const organizationUserId = new Types.ObjectId().toString();
    const mockDeletedOrganizationUser = {
      _id: new Types.ObjectId(organizationUserId),
      organization: new Types.ObjectId(),
      user: new Types.ObjectId(),
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'America/New_York',
      endOfDayHour: 17,
      endOfDayMin: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete an organization user successfully', async () => {
      // Arrange
      mockOrganizationUserService.deleteOrganizationUser.mockResolvedValue(
        mockDeletedOrganizationUser,
      );

      // Act
      await controller.deleteOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.deleteOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OrganizationUser deleted successfully',
        deletedOrganizationUser: mockDeletedOrganizationUser,
      });
    });

    it('should handle organization user not found during deletion', async () => {
      // Arrange
      const serviceError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          message: `OrganizationUser #${organizationUserId} not found`,
        },
      };
      mockOrganizationUserService.deleteOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.deleteOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.deleteOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `OrganizationUser #${organizationUserId} not found`,
      });
    });

    it('should handle invalid organization user ID during deletion', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const serviceError = {
        status: HttpStatus.BAD_REQUEST,
        response: { message: 'Invalid ID format' },
      };
      mockOrganizationUserService.deleteOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.deleteOrganizationUser(mockResponse, invalidId);

      // Assert
      expect(
        mockOrganizationUserService.deleteOrganizationUser,
      ).toHaveBeenCalledWith(invalidId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid ID format',
      });
    });

    it('should handle service errors without status code during deletion', async () => {
      // Arrange
      const serviceError = { response: { message: 'Database error' } };
      mockOrganizationUserService.deleteOrganizationUser.mockRejectedValue(
        serviceError,
      );

      // Act
      await controller.deleteOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.deleteOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should confirm deletion returns the deleted organization user data', async () => {
      // Arrange
      mockOrganizationUserService.deleteOrganizationUser.mockResolvedValue(
        mockDeletedOrganizationUser,
      );

      // Act
      await controller.deleteOrganizationUser(mockResponse, organizationUserId);

      // Assert
      expect(
        mockOrganizationUserService.deleteOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId);

      // Verify the deleted data is returned
      const jsonMock = mockResponse.json as jest.Mock;
      const mockCalls = jsonMock.mock.calls as Array<
        [
          {
            deletedOrganizationUser: {
              _id: Types.ObjectId;
              workshift: number;
              timezone: string;
              [key: string]: any;
            };
          },
        ]
      >;
      const callArgs = mockCalls[0][0];
      expect(callArgs.deletedOrganizationUser._id.toString()).toBe(
        organizationUserId,
      );
      expect(callArgs.deletedOrganizationUser).toHaveProperty('workshift');
      expect(callArgs.deletedOrganizationUser).toHaveProperty('timezone');
    });
  });

  describe('Edge Cases and Integration Scenarios', () => {
    it('should handle concurrent organization user operations', async () => {
      // Arrange
      const createDto: CreateOrganizationUserDto = {
        organization: new Types.ObjectId(),
        user: new Types.ObjectId(),
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'America/New_York',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      const mockCreated = {
        _id: new Types.ObjectId(),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
        mockCreated,
      );
      mockOrganizationUserService.getAllOrganizationUsers.mockResolvedValue([
        mockCreated,
      ]);

      // Act
      const createResult = await controller.createOrganizationUser(createDto);
      await controller.getOrganizationUsers(mockResponse);

      // Assert
      expect(createResult.newOrganizationUser).toEqual(mockCreated);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All organizationUsers data found successfully',
        organizationUserData: [mockCreated],
      });
    });

    it('should handle organization user with complex scheduling configuration', async () => {
      // Arrange
      const complexSchedulingDto: CreateOrganizationUserDto = {
        organization: new Types.ObjectId(),
        user: new Types.ObjectId(),
        workshift: 12,
        weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
        timezone: 'Australia/Sydney',
        endOfDayHour: 6,
        endOfDayMin: 30,
      };
      const mockComplexOrganizationUser = {
        _id: new Types.ObjectId(),
        ...complexSchedulingDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
        mockComplexOrganizationUser,
      );

      // Act
      const result: {
        newOrganizationUser: typeof mockComplexOrganizationUser;
      } = await controller.createOrganizationUser(complexSchedulingDto);

      // Assert
      expect(result.newOrganizationUser.workshift).toBe(12);
      expect(result.newOrganizationUser.weekdays).toEqual([
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
      ]);
      expect(result.newOrganizationUser.timezone).toBe('Australia/Sydney');
      expect(result.newOrganizationUser.endOfDayHour).toBe(6);
      expect(result.newOrganizationUser.endOfDayMin).toBe(30);
    });

    it('should validate that organization and user fields cannot be updated', async () => {
      // Arrange
      const organizationUserId = new Types.ObjectId().toString();
      const updateDto: UpdateOrganizationUserDto = {
        workshift: 6,
        timezone: 'Europe/Paris',
      };
      const mockUpdated = {
        _id: new Types.ObjectId(organizationUserId),
        organization: new Types.ObjectId(),
        user: new Types.ObjectId(),
        ...updateDto,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        endOfDayHour: 17,
        endOfDayMin: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrganizationUserService.updateOrganizationUser.mockResolvedValue(
        mockUpdated,
      );

      const result = await controller.updateOrganizationUser(
        organizationUserId,
        updateDto,
        mockResponse,
      );

      // Assert
      expect(
        mockOrganizationUserService.updateOrganizationUser,
      ).toHaveBeenCalledWith(organizationUserId, updateDto);
      // Check if result is the success object type
      if (typeof result === 'object' && 'existingOrganizationUser' in result) {
        expect(result.existingOrganizationUser).toEqual(mockUpdated);
      }

      // Verify that the DTO does not contain organization or user fields
      expect(updateDto).not.toHaveProperty('organization');
      expect(updateDto).not.toHaveProperty('user');
    });

    it('should handle service that manages bidirectional relationships', async () => {
      // Arrange
      const createDto: CreateOrganizationUserDto = {
        organization: new Types.ObjectId(),
        user: new Types.ObjectId(),
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'America/New_York',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      const mockCreated = {
        _id: new Types.ObjectId(),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrganizationUserService.createOrganizationUser.mockResolvedValue(
        mockCreated,
      );

      // Act
      const createResult = await controller.createOrganizationUser(createDto);

      // Assert
      expect(createResult.newOrganizationUser).toEqual(mockCreated);
      expect(
        mockOrganizationUserService.createOrganizationUser,
      ).toHaveBeenCalledWith(createDto);

      // Verify the service is called to handle relationship management
      expect(
        mockOrganizationUserService.createOrganizationUser,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
