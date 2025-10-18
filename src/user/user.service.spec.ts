import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { TimeOff, TimeOffSchema } from '../schemas/time-off.schema';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let module: TestingModule;

  beforeAll(async () => {
    try {
      // We need to establish a connection for the test module
      // The setupFile.ts handles the global connection, but test modules need their own
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGO_DATABASE || 'test-db';

      module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(`${mongoUri}/${dbName}`),
          MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: TimeOff.name, schema: TimeOffSchema },
          ]),
        ],
        providers: [UserService],
      }).compile();

      service = module.get<UserService>(UserService);
      // Get the Mongoose Model instance directly to query the database later
      userModel = module.get<Model<User>>(getModelToken(User.name));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Clean all collections sequentially to avoid race conditions
    if (userModel) {
      await userModel.deleteMany({});
    }
  });

  // Close the module after all tests (but not the database connection)
  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Basic Setup', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have access to user model', () => {
      expect(userModel).toBeDefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: `john.doe-${Date.now()}-${Math.random()}@example.com`,
        password: 'securePassword123',
      };

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBe(createUserDto.password);
      expect(result._id).toBeDefined();
    });

    it('should save user to database', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Jane Smith',
        email: `jane.smith-${Date.now()}-${Math.random()}@example.com`,
        password: 'anotherPassword456',
      };

      // Act
      await service.createUser(createUserDto);

      // Assert - Check if user exists in database
      const userInDb = await userModel.findOne({ email: createUserDto.email });
      expect(userInDb).toBeDefined();
      expect(userInDb!.name).toBe(createUserDto.name);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users when users exist', async () => {
      // Arrange
      const user1 = new userModel({
        name: 'User 1',
        email: 'user1@test.com',
        password: 'pass1',
      });
      const user2 = new userModel({
        name: 'User 2',
        email: 'user2@test.com',
        password: 'pass2',
      });
      await user1.save();
      await user2.save();

      // Act
      const result = await service.getAllUsers();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('User 1');
      expect(result[1].name).toBe('User 2');
    });

    it('should throw NotFoundException when no users exist', async () => {
      // Act & Assert
      await expect(service.getAllUsers()).rejects.toThrow(NotFoundException);
      await expect(service.getAllUsers()).rejects.toThrow(
        'Users data not found!',
      );
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const user = new userModel({
        name: 'Test User',
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        password: 'testpass',
      });
      const savedUser = await user.save();

      // Act
      const result = await service.getUser(savedUser._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test User');
      expect(result.email).toBe(savedUser.email);
      expect(result.password).toBeUndefined(); // Should be excluded by select
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getUser(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUser(nonExistentId)).rejects.toThrow(
        `User #${nonExistentId} not found`,
      );
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      // Arrange
      const user = new userModel({
        name: 'Original Name',
        email: `original-${Date.now()}-${Math.random()}@example.com`,
        password: 'originalpass',
      });
      const savedUser = await user.save();

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: `updated-${Date.now()}-${Math.random()}@example.com`,
      };

      // Act
      const result = await service.updateUser(
        savedUser._id.toString(),
        updateUserDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe(updateUserDto.email);
      expect(result.password).toBe('originalpass'); // Should remain unchanged
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = { name: 'New Name' };

      // Act & Assert
      await expect(
        service.updateUser(nonExistentId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateUser(nonExistentId, updateUserDto),
      ).rejects.toThrow(`User #${nonExistentId} not found`);
    });
  });

  describe('findOneByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = new userModel({
        name: 'Email Test User',
        email: `email.test-${Date.now()}-${Math.random()}@example.com`,
        password: 'emailpass',
      });
      await user.save();

      // Act
      const result = await service.findOneByEmail(user.email);

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe('Email Test User');
      expect(result!.email).toBe(user.email);
    });

    it('should return null for non-existent email', async () => {
      // Act
      const result = await service.findOneByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      // Arrange
      const user = new userModel({
        name: 'To Be Deleted',
        email: `delete-${Date.now()}-${Math.random()}@example.com`,
        password: 'deletepass',
      });
      const savedUser = await user.save();

      // Act
      const result = await service.deleteUser(savedUser._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify user is actually deleted
      const deletedUser = await userModel.findById(savedUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteUser(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteUser(nonExistentId)).rejects.toThrow(
        `User #${nonExistentId} not found`,
      );
    });
  });
});
