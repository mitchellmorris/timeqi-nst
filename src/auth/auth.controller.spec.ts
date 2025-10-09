/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SignInDto } from '../dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockConfigService.get.mockReturnValue('test-jwt-secret');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token on successful login', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'mock.jwt.token' };

      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when AuthService throws', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const serviceError = new Error('Database connection failed');

      mockAuthService.signIn.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(serviceError);
      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should pass through the exact DTO properties to service', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'user@domain.com',
        password: 'complexPassword123!',
      };
      const expectedResult = { access_token: 'token.for.complex.password' };

      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(
        'user@domain.com',
        'complexPassword123!',
      );
    });

    describe('input validation edge cases', () => {
      it('should handle empty string email', async () => {
        // Arrange
        const signInDto: SignInDto = {
          email: '',
          password: 'password123',
        };

        mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

        // Act & Assert
        await expect(controller.signIn(signInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(authService.signIn).toHaveBeenCalledWith('', 'password123');
      });

      it('should handle empty string password', async () => {
        // Arrange
        const signInDto: SignInDto = {
          email: 'test@example.com',
          password: '',
        };

        mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

        // Act & Assert
        await expect(controller.signIn(signInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(authService.signIn).toHaveBeenCalledWith('test@example.com', '');
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      // Arrange
      const mockUser = {
        sub: 'user123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567899,
      };
      const mockRequest = { user: mockUser };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should handle different user data structures', () => {
      // Arrange
      const mockUser = {
        sub: 'different-user-id',
        email: 'different@example.com',
        iat: 9876543210,
        exp: 9876543219,
      };
      const mockRequest = { user: mockUser };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.sub).toBe('different-user-id');
      expect(result.email).toBe('different@example.com');
    });

    it('should return user object with all expected properties', () => {
      // Arrange
      const mockUser = {
        sub: 'user123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567899,
      };
      const mockRequest = { user: mockUser };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('iat');
      expect(result).toHaveProperty('exp');
      expect(typeof result.sub).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.iat).toBe('number');
      expect(typeof result.exp).toBe('number');
    });
  });
});
