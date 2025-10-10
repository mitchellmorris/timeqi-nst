/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: ProjectService;
  let mockResponse: Partial<Response>;

  const mockProjectService = {
    createProject: jest.fn(),
    updateProject: jest.fn(),
    getAllProjects: jest.fn(),
    getProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  const mockProject = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Project',
    organization: new Types.ObjectId('507f1f77bcf86cd799439012'),
    sponsor: new Types.ObjectId('507f1f77bcf86cd799439013'),
    startDate: '2025-01-01T00:00:00.000Z',
    estimate: 160,
    workshift: 8,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
    tasks: [],
    users: [],
    timeOff: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);

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

  describe('createProject', () => {
    const createProjectDto: CreateProjectDto = {
      name: 'New Project',
      organization: new Types.ObjectId('507f1f77bcf86cd799439012'),
      sponsor: new Types.ObjectId('507f1f77bcf86cd799439013'),
      startDate: '2025-01-01T00:00:00.000Z',
      estimate: 160,
      workshift: 8,
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC',
      endOfDayHour: 17,
      endOfDayMin: 0,
    };

    it('should create project successfully', async () => {
      // Arrange
      mockProjectService.createProject.mockResolvedValue(mockProject);

      // Act
      const result = await controller.createProject(createProjectDto);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        createProjectDto,
      );
      expect(result).toEqual({
        message: 'Project has been created successfully',
        newProject: mockProject,
      });
    });

    it('should throw HttpException when project creation fails', async () => {
      // Arrange
      mockProjectService.createProject.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(controller.createProject(createProjectDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error: Project not created!',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(projectService.createProject).toHaveBeenCalledWith(
        createProjectDto,
      );
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockProjectService.createProject.mockResolvedValue(mockProject);

      // Act
      await controller.createProject(createProjectDto);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        createProjectDto,
      );
      expect(projectService.createProject).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors and throw HttpException', async () => {
      // Arrange
      const serviceError = new Error('Validation failed');
      mockProjectService.createProject.mockRejectedValue(serviceError);

      // Act & Assert
      const expectedError = new HttpException(
        {
          message: 'Error: Project not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      await expect(controller.createProject(createProjectDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('should return the exact project data from service', async () => {
      // Arrange
      const customProject = { ...mockProject, name: 'Custom Project Name' };
      mockProjectService.createProject.mockResolvedValue(customProject);

      // Act
      const result = await controller.createProject(createProjectDto);

      // Assert
      expect(result.newProject).toEqual(customProject);
      expect(result.newProject.name).toBe('Custom Project Name');
    });
  });

  describe('updateProject', () => {
    const projectId = '507f1f77bcf86cd799439011';
    const updateProjectDto: UpdateProjectDto = {
      name: 'Updated Project',
      estimate: 200,
    };
    const updatedProject = { ...mockProject, ...updateProjectDto };

    it('should update project successfully', async () => {
      // Arrange
      mockProjectService.updateProject.mockResolvedValue(updatedProject);

      // Act
      await controller.updateProject(
        mockResponse as Response,
        projectId,
        updateProjectDto,
      );

      // Assert
      expect(projectService.updateProject).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project has been successfully updated',
        existingProject: updatedProject,
      });
    });

    it('should handle project not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Project not found',
          error: 'Not Found',
        },
      };
      mockProjectService.updateProject.mockRejectedValue(notFoundError);

      // Act
      await controller.updateProject(
        mockResponse as Response,
        projectId,
        updateProjectDto,
      );

      // Assert
      expect(projectService.updateProject).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockProjectService.updateProject.mockRejectedValue(unknownError);

      // Act
      await controller.updateProject(
        mockResponse as Response,
        projectId,
        updateProjectDto,
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
      mockProjectService.updateProject.mockRejectedValue(validationError);

      // Act
      await controller.updateProject(
        mockResponse as Response,
        projectId,
        updateProjectDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(validationError.response);
    });
  });

  describe('getProjects', () => {
    const projectsData = [
      mockProject,
      { ...mockProject, _id: new Types.ObjectId('507f1f77bcf86cd799439014') },
    ];

    it('should get all projects successfully', async () => {
      // Arrange
      mockProjectService.getAllProjects.mockResolvedValue(projectsData);

      // Act
      await controller.getProjects(mockResponse as Response);

      // Assert
      expect(projectService.getAllProjects).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All projects data found successfully',
        projectData: projectsData,
      });
    });

    it('should handle no projects found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Projects data not found!',
          error: 'Not Found',
        },
      };
      mockProjectService.getAllProjects.mockRejectedValue(notFoundError);

      // Act
      await controller.getProjects(mockResponse as Response);

      // Assert
      expect(projectService.getAllProjects).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle service errors with default status', async () => {
      // Arrange
      const serviceError = {
        response: { message: 'Database connection failed' },
      };
      mockProjectService.getAllProjects.mockRejectedValue(serviceError);

      // Act
      await controller.getProjects(mockResponse as Response);

      // Assert
      expect(projectService.getAllProjects).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });

    it('should return empty array when no projects exist', async () => {
      // Arrange
      mockProjectService.getAllProjects.mockResolvedValue([]);

      // Act
      await controller.getProjects(mockResponse as Response);

      // Assert
      expect(projectService.getAllProjects).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All projects data found successfully',
        projectData: [],
      });
    });
  });

  describe('getProject', () => {
    const projectId = '507f1f77bcf86cd799439011';

    it('should get project by id successfully', async () => {
      // Arrange
      mockProjectService.getProject.mockResolvedValue(mockProject);

      // Act
      await controller.getProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project found successfully',
        existingProject: mockProject,
      });
    });

    it('should handle project not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Project #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockProjectService.getProject.mockRejectedValue(notFoundError);

      // Act
      await controller.getProject(mockResponse as Response, 'invalid-id');

      // Assert
      expect(projectService.getProject).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle invalid ObjectId format', async () => {
      // Arrange
      const invalidIdError = {
        status: HttpStatus.BAD_REQUEST,
        response: {
          statusCode: 400,
          message: 'Invalid project ID format',
          error: 'Bad Request',
        },
      };
      mockProjectService.getProject.mockRejectedValue(invalidIdError);

      // Act
      await controller.getProject(
        mockResponse as Response,
        'invalid-object-id',
      );

      // Assert
      expect(projectService.getProject).toHaveBeenCalledWith(
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
      mockProjectService.getProject.mockRejectedValue(serviceError);

      // Act
      await controller.getProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceError.response);
    });
  });

  describe('deleteProject', () => {
    const projectId = '507f1f77bcf86cd799439011';

    it('should delete project successfully', async () => {
      // Arrange
      mockProjectService.deleteProject.mockResolvedValue(mockProject);

      // Act
      await controller.deleteProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.deleteProject).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project deleted successfully',
        deletedProject: mockProject,
      });
    });

    it('should handle project not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Project #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockProjectService.deleteProject.mockRejectedValue(notFoundError);

      // Act
      await controller.deleteProject(mockResponse as Response, 'invalid-id');

      // Assert
      expect(projectService.deleteProject).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle dependency conflicts during deletion', async () => {
      // Arrange
      const conflictError = {
        status: HttpStatus.CONFLICT,
        response: {
          statusCode: 409,
          message: 'Cannot delete project with existing tasks',
          error: 'Conflict',
        },
      };
      mockProjectService.deleteProject.mockRejectedValue(conflictError);

      // Act
      await controller.deleteProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.deleteProject).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(conflictError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockProjectService.deleteProject.mockRejectedValue(serverError);

      // Act
      await controller.deleteProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.deleteProject).toHaveBeenCalledWith(projectId);
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
      mockProjectService.deleteProject.mockRejectedValue(errorWithStatus);

      // Act
      await controller.deleteProject(mockResponse as Response, projectId);

      // Assert
      expect(projectService.deleteProject).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(errorWithStatus.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should properly handle service method parameters', async () => {
      // Arrange
      const createDto: CreateProjectDto = {
        name: 'Test Project',
        organization: new Types.ObjectId(),
        sponsor: new Types.ObjectId(),
        startDate: '2025-01-01T00:00:00.000Z',
        estimate: 120,
        workshift: 6,
        weekdays: ['Monday', 'Wednesday', 'Friday'],
        timezone: 'America/New_York',
        endOfDayHour: 18,
        endOfDayMin: 30,
      };
      mockProjectService.createProject.mockResolvedValue(mockProject);

      // Act
      await controller.createProject(createDto);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(createDto);
      expect(projectService.createProject).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods correctly', async () => {
      // Arrange
      mockProjectService.getAllProjects.mockResolvedValue([mockProject]);

      // Act
      await controller.getProjects(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All projects data found successfully',
        projectData: [mockProject],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should handle different error response formats', async () => {
      // Test error without status property
      const errorWithoutStatus = {
        response: { message: 'Error without status' },
      };
      mockProjectService.getProject.mockRejectedValue(errorWithoutStatus);

      await controller.getProject(mockResponse as Response, 'test-id');

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        errorWithoutStatus.response,
      );
    });

    it('should handle mixed DTO properties correctly', async () => {
      // Test with partial update DTO
      const partialUpdate: UpdateProjectDto = {
        name: 'Partially Updated Project',
      };
      const updatedProject = {
        ...mockProject,
        name: 'Partially Updated Project',
      };
      mockProjectService.updateProject.mockResolvedValue(updatedProject);

      await controller.updateProject(
        mockResponse as Response,
        '507f1f77bcf86cd799439011',
        partialUpdate,
      );

      expect(projectService.updateProject).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        partialUpdate,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project has been successfully updated',
        existingProject: updatedProject,
      });
    });
  });
});
