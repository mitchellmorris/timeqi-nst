/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let mockResponse: Partial<Response>;

  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    organizations: [],
    projects: [],
    tasks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

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

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should create user successfully', async () => {
      // Arrange
      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      await controller.createUser(mockResponse as Response, createUserDto);

      // Assert
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User has been created successfully',
        newUser: mockUser,
      });
    });

    it('should handle user creation failure', async () => {
      // Arrange
      mockUserService.createUser.mockRejectedValue(new Error('Database error'));

      // Act
      await controller.createUser(mockResponse as Response, createUserDto);

      // Assert
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Error: User not created!',
        error: 'Bad Request',
      });
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      await controller.createUser(mockResponse as Response, createUserDto);

      // Assert
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    const userId = '507f1f77bcf86cd799439011';
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      email: 'updated@example.com',
    };
    const updatedUser = { ...mockUser, ...updateUserDto };

    it('should update user successfully', async () => {
      // Arrange
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      // Act
      await controller.updateUser(
        mockResponse as Response,
        userId,
        updateUserDto,
      );

      // Assert
      expect(userService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User has been successfully updated',
        existingUser: updatedUser,
      });
    });

    it('should handle user not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      };
      mockUserService.updateUser.mockRejectedValue(notFoundError);

      // Act
      await controller.updateUser(
        mockResponse as Response,
        userId,
        updateUserDto,
      );

      // Assert
      expect(userService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle unknown error with default status', async () => {
      // Arrange
      const unknownError = {
        response: { message: 'Unknown error' },
      };
      mockUserService.updateUser.mockRejectedValue(unknownError);

      // Act
      await controller.updateUser(
        mockResponse as Response,
        userId,
        updateUserDto,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(unknownError.response);
    });
  });

  describe('getUsers', () => {
    const usersData = [
      mockUser,
      { ...mockUser, _id: '507f1f77bcf86cd799439012' },
    ];

    it('should get all users successfully', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue(usersData);

      // Act
      await controller.getUsers(mockResponse as Response);

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All users data found successfully',
        userData: usersData,
      });
    });

    it('should handle no users found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'Users data not found!',
          error: 'Not Found',
        },
      };
      mockUserService.getAllUsers.mockRejectedValue(notFoundError);

      // Act
      await controller.getUsers(mockResponse as Response);

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });
  });

  describe('getProfile', () => {
    const userId = '507f1f77bcf86cd799439011';
    const mockRequest = {
      user: { sub: userId },
    };

    it('should get user profile successfully', async () => {
      // Arrange
      mockUserService.getUser.mockResolvedValue(mockUser);

      // Act
      await controller.getProfile(mockResponse as Response, mockRequest);

      // Assert
      expect(userService.getUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User profile retrieved successfully',
        user: mockUser,
      });
    });

    it('should handle missing user ID in request', async () => {
      // Arrange
      const invalidRequest = { user: {} } as {
        user: { sub: string };
      };

      // Act
      await controller.getProfile(mockResponse as Response, invalidRequest);

      // Assert
      expect(userService.getUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should handle user not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      };
      mockUserService.getUser.mockRejectedValue(notFoundError);

      // Act
      await controller.getProfile(mockResponse as Response, mockRequest);

      // Assert
      expect(userService.getUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });
  });

  describe('getUser', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should get user by id successfully', async () => {
      // Arrange
      mockUserService.getUser.mockResolvedValue(mockUser);

      // Act
      await controller.getUser(mockResponse as Response, userId);

      // Assert
      expect(userService.getUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User found successfully',
        existingUser: mockUser,
      });
    });

    it('should handle user not found error', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'User #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockUserService.getUser.mockRejectedValue(notFoundError);

      // Act
      await controller.getUser(mockResponse as Response, 'invalid-id');

      // Assert
      expect(userService.getUser).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });
  });

  describe('deleteUser', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should delete user successfully', async () => {
      // Arrange
      mockUserService.deleteUser.mockResolvedValue(mockUser);

      // Act
      await controller.deleteUser(mockResponse as Response, userId);

      // Assert
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
        deletedUser: mockUser,
      });
    });

    it('should handle user not found during deletion', async () => {
      // Arrange
      const notFoundError = {
        status: HttpStatus.NOT_FOUND,
        response: {
          statusCode: 404,
          message: 'User #invalid-id not found',
          error: 'Not Found',
        },
      };
      mockUserService.deleteUser.mockRejectedValue(notFoundError);

      // Act
      await controller.deleteUser(mockResponse as Response, 'invalid-id');

      // Assert
      expect(userService.deleteUser).toHaveBeenCalledWith('invalid-id');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(notFoundError.response);
    });

    it('should handle internal server error during deletion', async () => {
      // Arrange
      const serverError = {
        response: { message: 'Database connection failed' },
      };
      mockUserService.deleteUser.mockRejectedValue(serverError);

      // Act
      await controller.deleteUser(mockResponse as Response, userId);

      // Assert
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serverError.response);
    });
  });

  describe('Error handling patterns', () => {
    it('should handle service methods being called with correct parameters', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      await controller.createUser(mockResponse as Response, createUserDto);

      // Assert
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should handle response object methods being called correctly', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser]);

      // Act
      await controller.getUsers(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All users data found successfully',
        userData: [mockUser],
      });
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
