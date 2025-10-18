import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ProjectUserController } from './project-user.controller';
import { ProjectUserService } from './project-user.service';
import { CreateProjectUserDto } from '../dto/create-project.user.dto';

describe('ProjectUserController', () => {
  let controller: ProjectUserController;

  const mockProjectUserService = {
    createProjectUser: jest.fn(),
    updateProjectUser: jest.fn(),
    getAllProjectUsers: jest.fn(),
    getProjectUser: jest.fn(),
    deleteProjectUser: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockCreateProjectUserDto: CreateProjectUserDto = {
    organization: new Types.ObjectId(),
    project: new Types.ObjectId(),
    user: new Types.ObjectId(),
    workshift: 8,
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
  };

  const mockProjectUser = {
    _id: new Types.ObjectId(),
    organization: new Types.ObjectId(),
    project: new Types.ObjectId(),
    user: new Types.ObjectId(),
    workshift: 8,
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectUserController],
      providers: [
        {
          provide: ProjectUserService,
          useValue: mockProjectUserService,
        },
      ],
    }).compile();

    controller = module.get<ProjectUserController>(ProjectUserController);
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('createProjectUser', () => {
    it('should create a project user successfully', async () => {
      mockProjectUserService.createProjectUser.mockResolvedValue(
        mockProjectUser,
      );

      const result = await controller.createProjectUser(
        mockCreateProjectUserDto,
      );

      expect(mockProjectUserService.createProjectUser).toHaveBeenCalledWith(
        mockCreateProjectUserDto,
      );
      expect(result).toEqual({
        message: 'ProjectUser has been created successfully',
        newProjectUser: mockProjectUser,
      });
    });

    it('should throw HttpException when service throws error', async () => {
      mockProjectUserService.createProjectUser.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        controller.createProjectUser(mockCreateProjectUserDto),
      ).rejects.toMatchObject({
        message: 'Error: ProjectUser not created!',
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should handle service returning null', async () => {
      mockProjectUserService.createProjectUser.mockResolvedValue(null);

      const result = await controller.createProjectUser(
        mockCreateProjectUserDto,
      );

      expect(result).toEqual({
        message: 'ProjectUser has been created successfully',
        newProjectUser: null,
      });
    });
  });

  describe('updateProjectUser', () => {
    const projectUserId = new Types.ObjectId().toString();
    const updatedProjectUser = { ...mockProjectUser, workshift: 10 };

    it('should update a project user successfully', async () => {
      mockProjectUserService.updateProjectUser.mockResolvedValue(
        updatedProjectUser,
      );

      const result = await controller.updateProjectUser(
        projectUserId,
        mockCreateProjectUserDto,
      );

      expect(mockProjectUserService.updateProjectUser).toHaveBeenCalledWith(
        projectUserId,
        mockCreateProjectUserDto,
      );
      expect(result).toEqual({
        message: 'ProjectUser has been updated successfully',
        existingProjectUser: updatedProjectUser,
      });
    });

    it('should handle service error', async () => {
      mockProjectUserService.updateProjectUser.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        controller.updateProjectUser(projectUserId, mockCreateProjectUserDto),
      ).rejects.toThrow();

      expect(mockProjectUserService.updateProjectUser).toHaveBeenCalledWith(
        projectUserId,
        mockCreateProjectUserDto,
      );
    });
  });

  describe('getProjectUsers', () => {
    const mockProjectUsers = [
      mockProjectUser,
      { ...mockProjectUser, _id: new Types.ObjectId() },
    ];

    it('should get all project users successfully', async () => {
      mockProjectUserService.getAllProjectUsers.mockResolvedValue(
        mockProjectUsers,
      );

      await controller.getProjectUsers(mockResponse);

      expect(mockProjectUserService.getAllProjectUsers).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All projectUsers data found successfully',
        projectUserData: mockProjectUsers,
      });
    });

    it('should handle service error', async () => {
      const errorWithStatus = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: { message: 'Database error' },
      };
      mockProjectUserService.getAllProjectUsers.mockRejectedValue(
        errorWithStatus,
      );

      await controller.getProjectUsers(mockResponse);

      expect(mockProjectUserService.getAllProjectUsers).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('getProjectUser', () => {
    const projectUserId = new Types.ObjectId().toString();

    it('should get a project user by ID successfully', async () => {
      mockProjectUserService.getProjectUser.mockResolvedValue(mockProjectUser);

      await controller.getProjectUser(mockResponse, projectUserId);

      expect(mockProjectUserService.getProjectUser).toHaveBeenCalledWith(
        projectUserId,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ProjectUser found successfully',
        existingProjectUser: mockProjectUser,
      });
    });

    it('should handle service error', async () => {
      const errorWithStatus = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'ProjectUser not found' },
      };
      mockProjectUserService.getProjectUser.mockRejectedValue(errorWithStatus);

      await controller.getProjectUser(mockResponse, projectUserId);

      expect(mockProjectUserService.getProjectUser).toHaveBeenCalledWith(
        projectUserId,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ProjectUser not found',
      });
    });
  });

  describe('deleteProjectUser', () => {
    const projectUserId = new Types.ObjectId().toString();

    it('should delete a project user successfully', async () => {
      mockProjectUserService.deleteProjectUser.mockResolvedValue(
        mockProjectUser,
      );

      await controller.deleteProjectUser(mockResponse, projectUserId);

      expect(mockProjectUserService.deleteProjectUser).toHaveBeenCalledWith(
        projectUserId,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ProjectUser deleted successfully',
        deletedProjectUser: mockProjectUser,
      });
    });

    it('should handle service error', async () => {
      const errorWithStatus = {
        status: HttpStatus.NOT_FOUND,
        response: { message: 'ProjectUser not found' },
      };
      mockProjectUserService.deleteProjectUser.mockRejectedValue(
        errorWithStatus,
      );

      await controller.deleteProjectUser(mockResponse, projectUserId);

      expect(mockProjectUserService.deleteProjectUser).toHaveBeenCalledWith(
        projectUserId,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ProjectUser not found',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid project user ID', async () => {
      const invalidId = 'invalid-id';
      mockProjectUserService.getProjectUser.mockRejectedValue(
        new Error('Invalid ID'),
      );

      await controller.getProjectUser(mockResponse, invalidId);

      expect(mockProjectUserService.getProjectUser).toHaveBeenCalledWith(
        invalidId,
      );
    });

    it('should handle empty DTO for creation', async () => {
      const emptyDto = {} as CreateProjectUserDto;
      mockProjectUserService.createProjectUser.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(
        controller.createProjectUser(emptyDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });
});
