/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { IUser } from '../interface/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock user data
  const mockUserId = new Types.ObjectId();
  const mockUser: Partial<IUser> = {
    _id: mockUserId,
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  const mockUserService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const expectedToken = 'mock.jwt.token';
      const expectedPayload = {
        sub: mockUserId,
        email: mockUser.email,
      };

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(result).toEqual({ access_token: expectedToken });
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserService.findOneByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const email = 'test@example.com';
      const wrongPassword = 'wrongpassword';

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signIn(email, wrongPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user exists but has no password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const userWithoutPassword = { ...mockUser, password: undefined };

      mockUserService.findOneByEmail.mockResolvedValue(userWithoutPassword);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle empty string password correctly', async () => {
      // Arrange
      const email = 'test@example.com';
      const emptyPassword = '';
      const userWithEmptyPassword = { ...mockUser, password: '' };

      mockUserService.findOneByEmail.mockResolvedValue(userWithEmptyPassword);

      // Act
      const expectedToken = 'mock.jwt.token';
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signIn(email, emptyPassword);

      // Assert
      expect(result).toEqual({ access_token: expectedToken });
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUserId,
        email: mockUser.email,
      });
    });

    it('should handle UserService throwing an error', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const serviceError = new Error('Database connection failed');

      mockUserService.findOneByEmail.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(
        serviceError,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle JwtService throwing an error', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const jwtError = new Error('JWT signing failed');

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(jwtError);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(jwtError);
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUserId,
        email: mockUser.email,
      });
    });

    it('should create JWT payload with correct structure', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const expectedToken = 'mock.jwt.token';

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      await service.signIn(email, password);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUserId, // Should use user._id as subject
        email: 'test@example.com', // Should use user.email
      });
    });

    describe('edge cases', () => {
      it('should handle null email input', async () => {
        // Arrange
        const email = null;
        const password = 'password123';

        mockUserService.findOneByEmail.mockResolvedValue(null);

        // Act & Assert
        // TypeScript allows null to be passed, but service should handle gracefully
        await expect(
          service.signIn(email as unknown as string, password),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should handle undefined password input', async () => {
        // Arrange
        const email = 'test@example.com';
        const password = undefined;

        mockUserService.findOneByEmail.mockResolvedValue(mockUser);

        // Act & Assert
        // TypeScript allows undefined to be passed, but service should handle gracefully
        await expect(
          service.signIn(email, password as unknown as string),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should handle user with null password field', async () => {
        // Arrange
        const email = 'test@example.com';
        const password = 'password123';
        const userWithNullPassword = { ...mockUser, password: null };

        mockUserService.findOneByEmail.mockResolvedValue(userWithNullPassword);

        // Act & Assert
        await expect(service.signIn(email, password)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });
  });
});
