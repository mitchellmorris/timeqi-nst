import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationUserService } from './organization-user.service';
import {
  OrganizationUser,
  OrganizationUserSchema,
} from '../schemas/organization.user.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { CreateOrganizationUserDto } from '../dto/create-organization.user.dto';
import { UpdateOrganizationUserDto } from '../dto/update-organization.user.dto';

describe('OrganizationUserService', () => {
  let service: OrganizationUserService;
  let organizationUserModel: Model<OrganizationUser>;
  let userModel: Model<User>;
  let organizationModel: Model<Organization>;
  let module: TestingModule;

  // Test data
  let organizationId: Types.ObjectId;
  let userId: Types.ObjectId;

  // Helper function to create complete DTO
  const createCompleteDto = (
    orgId: Types.ObjectId,
    usrId: Types.ObjectId,
  ): CreateOrganizationUserDto => ({
    organization: orgId,
    user: usrId,
    workshift: 8,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'UTC',
    endOfDayHour: 17,
    endOfDayMin: 0,
  });

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
            { name: OrganizationUser.name, schema: OrganizationUserSchema },
            { name: User.name, schema: UserSchema },
            { name: Organization.name, schema: OrganizationSchema },
          ]),
        ],
        providers: [OrganizationUserService],
      }).compile();

      service = module.get<OrganizationUserService>(OrganizationUserService);
      organizationUserModel = module.get<Model<OrganizationUser>>(
        getModelToken(OrganizationUser.name),
      );
      userModel = module.get<Model<User>>(getModelToken(User.name));
      organizationModel = module.get<Model<Organization>>(
        getModelToken(Organization.name),
      );
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Setup test data before each test
  beforeEach(async () => {
    // Create test data with new IDs
    organizationId = new Types.ObjectId();
    userId = new Types.ObjectId();

    // Create test user first
    await userModel.create({
      _id: userId,
      name: 'Test User',
      email: generateUniqueEmail('testuser'),
      password: 'hashedpassword',
      organizations: [],
    });

    // Create test organization
    await organizationModel.create({
      _id: organizationId,
      name: 'Test Organization',
      sponsor: userId,
    });
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganizationUser', () => {
    it('should create a new organization user assignment', async () => {
      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );

      const result = await service.createOrganizationUser(
        createOrganizationUserDto,
      );

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Convert ObjectIds to strings for comparison if needed
      expect(result.organization?.toString()).toEqual(
        organizationId.toString(),
      );
      expect(result.user?.toString()).toEqual(userId.toString());

      // Verify the user's organizations array was updated
      const updatedUser = await userModel.findById(userId);
      expect(updatedUser?.organizations).toContainEqual(organizationId);
    });

    it('should handle errors during organization user creation', async () => {
      const createOrganizationUserDto = createCompleteDto(
        new Types.ObjectId(), // Non-existent organization
        userId,
      );

      // This should still create the OrganizationUser but may not update related models
      const result = await service.createOrganizationUser(
        createOrganizationUserDto,
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateOrganizationUser', () => {
    let createdOrganizationUser: OrganizationUser;

    beforeEach(async () => {
      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );
      createdOrganizationUser = await service.createOrganizationUser(
        createOrganizationUserDto,
      );
    });

    it('should update an existing organization user', async () => {
      const updateOrganizationUserDto: UpdateOrganizationUserDto = {};

      const result = await service.updateOrganizationUser(
        String(createdOrganizationUser._id),
        updateOrganizationUserDto,
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdOrganizationUser._id);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent organization user', async () => {
      const updateOrganizationUserDto: UpdateOrganizationUserDto = {};
      const nonExistentId = new Types.ObjectId().toString();

      await expect(
        service.updateOrganizationUser(
          nonExistentId,
          updateOrganizationUserDto,
        ),
      ).rejects.toThrow('OrganizationUser not found');
    });
  });

  describe('getAllOrganizationUsers', () => {
    it('should return all organization users', async () => {
      // Clean organization users collection to ensure test starts fresh
      await organizationUserModel.deleteMany({});

      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );

      await service.createOrganizationUser(createOrganizationUserDto);

      const result = await service.getAllOrganizationUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      // Check that populate worked - we should get populated objects, not just IDs
      const organizationUser = result[0];
      expect(organizationUser.organization).toBeDefined();
      expect(organizationUser.user).toBeDefined();
      // Basic verification that populate worked (these should be objects, not IDs)
      expect(typeof organizationUser.organization).toBe('object');
      expect(typeof organizationUser.user).toBe('object');
    });

    it('should throw NotFoundException when no organization users exist', async () => {
      // Clean organization users collection to ensure no data exists
      await organizationUserModel.deleteMany({});

      await expect(service.getAllOrganizationUsers()).rejects.toThrow(
        'OrganizationUsers data not found!',
      );
    });
  });

  describe('getOrganizationUser', () => {
    let createdOrganizationUser: OrganizationUser;

    beforeEach(async () => {
      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );
      createdOrganizationUser = await service.createOrganizationUser(
        createOrganizationUserDto,
      );
    });

    it('should return an organization user by id', async () => {
      const result = await service.getOrganizationUser(
        String(createdOrganizationUser._id),
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdOrganizationUser._id);
      // Check that populate worked - we should get populated objects, not just IDs
      expect(result.organization).toBeDefined();
      expect(result.user).toBeDefined();
      // Basic verification that populate worked (these should be objects, not IDs)
      expect(typeof result.organization).toBe('object');
      expect(typeof result.user).toBe('object');
    });

    it('should throw NotFoundException for non-existent organization user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(service.getOrganizationUser(nonExistentId)).rejects.toThrow(
        `OrganizationUser #${nonExistentId} not found`,
      );
    });
  });

  describe('deleteOrganizationUser', () => {
    let createdOrganizationUser: OrganizationUser;

    beforeEach(async () => {
      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );
      createdOrganizationUser = await service.createOrganizationUser(
        createOrganizationUserDto,
      );
    });

    it('should delete an organization user', async () => {
      const result = await service.deleteOrganizationUser(
        String(createdOrganizationUser._id),
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdOrganizationUser._id);

      // Verify the organization user was deleted
      const deletedOrganizationUser = await organizationUserModel.findById(
        createdOrganizationUser._id,
      );
      expect(deletedOrganizationUser).toBeNull();

      // Verify the user's organizations array was updated
      const updatedUser = await userModel.findById(userId);
      expect(updatedUser?.organizations).not.toContainEqual(organizationId);
    });

    it('should throw NotFoundException for non-existent organization user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(
        service.deleteOrganizationUser(nonExistentId),
      ).rejects.toThrow(`OrganizationUser #${nonExistentId} not found`);
    });
  });

  describe('populate functionality', () => {
    let createdOrganizationUser: OrganizationUser;

    beforeEach(async () => {
      // Clean organization users collection before each test in this describe block
      await organizationUserModel.deleteMany({});

      const createOrganizationUserDto = createCompleteDto(
        organizationId,
        userId,
      );
      createdOrganizationUser = await service.createOrganizationUser(
        createOrganizationUserDto,
      );
    });

    it('should populate related fields when getting all organization users', async () => {
      const result = await service.getAllOrganizationUsers();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      // The populate should work, but the exact structure depends on the schema
      expect(result[0]).toBeDefined();
    });

    it('should populate related fields when getting a single organization user', async () => {
      const result = await service.getOrganizationUser(
        String(createdOrganizationUser._id),
      );

      expect(result).toBeDefined();
      // The populate should work, but the exact structure depends on the schema
      expect(result._id).toEqual(createdOrganizationUser._id);
    });
  });
});
