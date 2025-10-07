import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { TimeOff, TimeOffSchema } from '../schemas/time-off.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationModel: Model<Organization>;
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
            { name: Organization.name, schema: OrganizationSchema },
            { name: User.name, schema: UserSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: TimeOff.name, schema: TimeOffSchema },
          ]),
        ],
        providers: [OrganizationService],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);
      // Get the Mongoose Model instances directly to query the database later
      organizationModel = module.get<Model<Organization>>(
        getModelToken(Organization.name),
      );
      userModel = module.get<Model<User>>(getModelToken(User.name));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Clean all collections for test isolation
    if (organizationModel) {
      await organizationModel.deleteMany({});
    }
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

    it('should have access to organization model', () => {
      expect(organizationModel).toBeDefined();
    });

    it('should have access to user model', () => {
      expect(userModel).toBeDefined();
    });
  });

  describe('createOrganization', () => {
    it('should create a new organization successfully', async () => {
      // Arrange - Create a sponsor user first
      const sponsorUser = new userModel({
        name: 'Sponsor User',
        email: 'sponsor@example.com',
        password: 'password123',
        organizations: [],
      });
      const savedSponsor = await sponsorUser.save();

      const createOrganizationDto: CreateOrganizationDto = {
        name: 'Test Organization',
        sponsor: savedSponsor._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // Act
      const result = await service.createOrganization(createOrganizationDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createOrganizationDto.name);
      expect(result.sponsor?.toString()).toBe(savedSponsor._id.toString());
      expect(result._id).toBeDefined();
    });

    it('should add organization to sponsor user organizations array', async () => {
      // Arrange - Create a sponsor user first
      const sponsorUser = new userModel({
        name: 'Sponsor User 2',
        email: 'sponsor2@example.com',
        password: 'password123',
        organizations: [],
      });
      const savedSponsor = await sponsorUser.save();

      const createOrganizationDto: CreateOrganizationDto = {
        name: 'Test Organization 2',
        sponsor: savedSponsor._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // Act
      const result = await service.createOrganization(createOrganizationDto);

      // Assert - Check if organization was added to user's organizations
      const updatedUser = await userModel.findById(savedSponsor._id);
      expect(updatedUser!.organizations).toHaveLength(1);
      expect(updatedUser!.organizations).toContainEqual(result._id);
    });

    it('should save organization to database', async () => {
      // Arrange - Create a sponsor user first
      const sponsorUser = new userModel({
        name: 'Sponsor User 3',
        email: 'sponsor3@example.com',
        password: 'password123',
        organizations: [],
      });
      const savedSponsor = await sponsorUser.save();

      const createOrganizationDto: CreateOrganizationDto = {
        name: 'Database Test Org',
        sponsor: savedSponsor._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // Act
      await service.createOrganization(createOrganizationDto);

      // Assert - Check if organization exists in database
      const orgInDb = await organizationModel.findOne({
        name: createOrganizationDto.name,
      });
      expect(orgInDb).toBeDefined();
      expect(orgInDb!.name).toBe(createOrganizationDto.name);
    });
  });

  describe('getAllOrganizations', () => {
    it('should return all organizations when organizations exist', async () => {
      // Arrange - Create test organizations
      const org1 = new organizationModel({
        name: 'Organization 1',
        sponsor: '507f1f77bcf86cd799439011',
      });
      const org2 = new organizationModel({
        name: 'Organization 2',
        sponsor: '507f1f77bcf86cd799439012',
      });
      await org1.save();
      await org2.save();

      // Act
      const result = await service.getAllOrganizations();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Organization 1');
      expect(result[1].name).toBe('Organization 2');
    });

    it('should throw NotFoundException when no organizations exist', async () => {
      // Act & Assert
      await expect(service.getAllOrganizations()).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getAllOrganizations()).rejects.toThrow(
        'Organizations data not found!',
      );
    });
  });

  describe('getOrganization', () => {
    it('should return an organization by ID', async () => {
      // Arrange
      const organization = new organizationModel({
        name: 'Test Org',
        sponsor: '507f1f77bcf86cd799439011',
      });
      const savedOrg = await organization.save();

      // Act
      const result = await service.getOrganization(savedOrg._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Org');
      expect(result.sponsor?.toString()).toBe('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException for non-existent organization', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getOrganization(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getOrganization(nonExistentId)).rejects.toThrow(
        `Organization #${nonExistentId} not found`,
      );
    });
  });

  describe('updateOrganization', () => {
    it('should update an existing organization', async () => {
      // Arrange
      const organization = new organizationModel({
        name: 'Original Name',
        sponsor: '507f1f77bcf86cd799439011',
      });
      const savedOrg = await organization.save();

      const updateOrganizationDto: UpdateOrganizationDto = {
        name: 'Updated Name',
      };

      // Act
      const result = await service.updateOrganization(
        savedOrg._id.toString(),
        updateOrganizationDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.sponsor?.toString()).toBe('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException for non-existent organization', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateOrganizationDto: UpdateOrganizationDto = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(
        service.updateOrganization(nonExistentId, updateOrganizationDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateOrganization(nonExistentId, updateOrganizationDto),
      ).rejects.toThrow(`Organization #${nonExistentId} not found`);
    });
  });

  describe('deleteOrganization', () => {
    it('should delete an existing organization', async () => {
      // Arrange - Create a sponsor user and organization
      const sponsorUser = new userModel({
        name: 'Delete Test User',
        email: 'delete@example.com',
        password: 'password123',
        organizations: [],
      });
      const savedSponsor = await sponsorUser.save();

      const organization = new organizationModel({
        name: 'To Be Deleted',
        sponsor: savedSponsor._id,
      });
      const savedOrg = await organization.save();

      // Add organization to user's organizations array
      await userModel.findByIdAndUpdate(savedSponsor._id, {
        $addToSet: { organizations: savedOrg._id },
      });

      // Act
      const result = await service.deleteOrganization(savedOrg._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify organization is actually deleted
      const deletedOrg = await organizationModel.findById(savedOrg._id);
      expect(deletedOrg).toBeNull();

      // Verify organization was removed from user's organizations array
      const updatedUser = await userModel.findById(savedSponsor._id);
      expect(updatedUser!.organizations).not.toContainEqual(savedOrg._id);
    });

    it('should throw NotFoundException for non-existent organization', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteOrganization(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteOrganization(nonExistentId)).rejects.toThrow(
        `Organization #${nonExistentId} not found`,
      );
    });
  });
});
