import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProjectUserService } from './project-user.service';
import { ProjectUser, ProjectUserSchema } from '../schemas/project.user.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { CreateProjectUserDto } from '../dto/create-project.user.dto';
import { IProjectUser } from '../interface/project.user.interface';

describe('ProjectUserService', () => {
  let service: ProjectUserService;
  let projectUserModel: Model<ProjectUser>;
  let userModel: Model<User>;
  let projectModel: Model<Project>;
  let organizationModel: Model<Organization>;
  let module: TestingModule;

  // Test data
  let organizationId: Types.ObjectId;
  let projectId: Types.ObjectId;
  let userId: Types.ObjectId;

  beforeAll(async () => {
    try {
      // We need to establish a connection for the test module
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGO_DATABASE || 'test-db';

      module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(`${mongoUri}/${dbName}`),
          MongooseModule.forFeature([
            { name: ProjectUser.name, schema: ProjectUserSchema },
            { name: User.name, schema: UserSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: Organization.name, schema: OrganizationSchema },
          ]),
        ],
        providers: [ProjectUserService],
      }).compile();

      service = module.get<ProjectUserService>(ProjectUserService);
      projectUserModel = module.get<Model<ProjectUser>>(
        getModelToken(ProjectUser.name),
      );
      userModel = module.get<Model<User>>(getModelToken(User.name));
      projectModel = module.get<Model<Project>>(getModelToken(Project.name));
      organizationModel = module.get<Model<Organization>>(
        getModelToken(Organization.name),
      );
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Clean all collections sequentially to avoid race conditions
    if (projectUserModel) {
      await projectUserModel.deleteMany({});
    }
    if (userModel) {
      await userModel.deleteMany({});
    }
    if (projectModel) {
      await projectModel.deleteMany({});
    }
    if (organizationModel) {
      await organizationModel.deleteMany({});
    }

    // Create test data
    organizationId = new Types.ObjectId();
    projectId = new Types.ObjectId();
    userId = new Types.ObjectId();

    // Create test organization
    await organizationModel.create({
      _id: organizationId,
      name: 'Test Organization',
      sponsor: userId,
    });

    // Create test user
    await userModel.create({
      _id: userId,
      name: 'Test User',
      email: `testuser-${Date.now()}-${Math.random()}@example.com`,
      password: 'hashedpassword',
      organizations: [organizationId],
    });

    // Create test project
    await projectModel.create({
      _id: projectId,
      name: 'Test Project',
      organization: organizationId,
      sponsor: userId,
      users: [],
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

  describe('createProjectUser', () => {
    it('should create a new project user assignment', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      const result = await service.createProjectUser(createProjectUserDto);

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Convert ObjectIds to strings for comparison
      expect(result.organization?.toString()).toEqual(
        organizationId.toString(),
      );
      expect(result.project?.toString()).toEqual(projectId.toString());
      expect(result.user?.toString()).toEqual(userId.toString());
      expect(result.workshift).toEqual(8);
      expect(result.weekdays).toEqual([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
      ]);
      expect(result.timezone).toEqual('UTC');
      expect(result.endOfDayHour).toEqual(17);
      expect(result.endOfDayMin).toEqual(0);

      // Verify the project's users array was updated
      const updatedProject = await projectModel.findById(projectId);
      expect(updatedProject?.users).toContainEqual(userId);
    });

    it('should handle errors during project user creation', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: new Types.ObjectId(), // Non-existent organization
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // This should still create the ProjectUser but may not update related models
      const result = await service.createProjectUser(createProjectUserDto);
      expect(result).toBeDefined();
    });

    it('should create project user with minimal data', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 4,
        weekdays: ['monday'],
        timezone: 'EST',
        endOfDayHour: 18,
        endOfDayMin: 30,
      };

      const result = await service.createProjectUser(createProjectUserDto);

      expect(result).toBeDefined();
      expect(result.workshift).toEqual(4);
      expect(result.weekdays).toEqual(['monday']);
      expect(result.timezone).toEqual('EST');
      expect(result.endOfDayHour).toEqual(18);
      expect(result.endOfDayMin).toEqual(30);
    });
  });

  describe('updateProjectUser', () => {
    let createdProjectUser: IProjectUser;

    beforeEach(async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      createdProjectUser =
        await service.createProjectUser(createProjectUserDto);
    });

    it('should update an existing project user', async () => {
      const updateProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 10,
        weekdays: ['monday', 'tuesday', 'wednesday'],
        timezone: 'PST',
        endOfDayHour: 18,
        endOfDayMin: 30,
      };

      const result = await service.updateProjectUser(
        String(createdProjectUser._id),
        updateProjectUserDto,
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdProjectUser._id);
      expect(result.workshift).toEqual(10);
      expect(result.weekdays).toEqual(['monday', 'tuesday', 'wednesday']);
      expect(result.timezone).toEqual('PST');
      expect(result.endOfDayHour).toEqual(18);
      expect(result.endOfDayMin).toEqual(30);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent project user', async () => {
      const updateProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      const nonExistentId = new Types.ObjectId().toString();

      await expect(
        service.updateProjectUser(nonExistentId, updateProjectUserDto),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.updateProjectUser(nonExistentId, updateProjectUserDto),
      ).rejects.toThrow('ProjectUser not found');
    });

    it('should update partial fields', async () => {
      const updateProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 6,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      const result = await service.updateProjectUser(
        String(createdProjectUser._id),
        updateProjectUserDto,
      );

      expect(result).toBeDefined();
      expect(result.workshift).toEqual(6);
      expect(result.weekdays).toEqual(createdProjectUser.weekdays);
    });
  });

  describe('getAllProjectUsers', () => {
    it('should return all project users', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      await service.createProjectUser(createProjectUserDto);

      const result = await service.getAllProjectUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);

      const projectUser = result[0];
      expect(projectUser).toBeDefined();
      expect(projectUser.organization?.toString()).toEqual(
        organizationId.toString(),
      );
      expect(projectUser.project?.toString()).toEqual(projectId.toString());
      expect(projectUser.user?.toString()).toEqual(userId.toString());
    });

    it('should return multiple project users', async () => {
      const createProjectUserDto1: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // Create second user and project for testing
      const userId2 = new Types.ObjectId();
      const projectId2 = new Types.ObjectId();

      await userModel.create({
        _id: userId2,
        name: 'Test User 2',
        email: `testuser2-${Date.now()}-${Math.random()}@example.com`,
        password: 'hashedpassword',
        organizations: [organizationId],
      });

      await projectModel.create({
        _id: projectId2,
        name: 'Test Project 2',
        organization: organizationId,
        sponsor: userId2,
        users: [],
      });

      const createProjectUserDto2: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId2,
        user: userId2,
        workshift: 6,
        weekdays: ['monday', 'wednesday', 'friday'],
        timezone: 'PST',
        endOfDayHour: 18,
        endOfDayMin: 0,
      };

      await service.createProjectUser(createProjectUserDto1);
      await service.createProjectUser(createProjectUserDto2);

      const result = await service.getAllProjectUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should throw NotFoundException when no project users exist', async () => {
      await expect(service.getAllProjectUsers()).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.getAllProjectUsers()).rejects.toThrow(
        'ProjectUsers data not found!',
      );
    });
  });

  describe('getProjectUser', () => {
    let createdProjectUser: IProjectUser;

    beforeEach(async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      createdProjectUser =
        await service.createProjectUser(createProjectUserDto);
    });

    it('should return a project user by id', async () => {
      const result = await service.getProjectUser(
        String(createdProjectUser._id),
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdProjectUser._id);
      expect(result.organization?.toString()).toEqual(
        organizationId.toString(),
      );
      expect(result.project?.toString()).toEqual(projectId.toString());
      expect(result.user?.toString()).toEqual(userId.toString());
      expect(result.workshift).toEqual(8);
      expect(result.weekdays).toEqual([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
      ]);
      expect(result.timezone).toEqual('UTC');
      expect(result.endOfDayHour).toEqual(17);
      expect(result.endOfDayMin).toEqual(0);
    });

    it('should throw NotFoundException for non-existent project user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(service.getProjectUser(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.getProjectUser(nonExistentId)).rejects.toThrow(
        `ProjectUser #${nonExistentId} not found`,
      );
    });

    it('should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      await expect(service.getProjectUser(invalidId)).rejects.toThrow();
    });
  });

  describe('deleteProjectUser', () => {
    let createdProjectUser: IProjectUser;

    beforeEach(async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };
      createdProjectUser =
        await service.createProjectUser(createProjectUserDto);
    });

    it('should delete a project user', async () => {
      const result = await service.deleteProjectUser(
        String(createdProjectUser._id),
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdProjectUser._id);

      // Verify the project user was deleted
      const deletedProjectUser = await projectUserModel.findById(
        createdProjectUser._id,
      );
      expect(deletedProjectUser).toBeNull();

      // Verify the project's users array was updated
      const updatedProject = await projectModel.findById(projectId);
      expect(updatedProject?.users).not.toContainEqual(userId);
    });

    it('should throw NotFoundException for non-existent project user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(service.deleteProjectUser(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.deleteProjectUser(nonExistentId)).rejects.toThrow(
        `ProjectUser #${nonExistentId} not found`,
      );
    });

    it('should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      await expect(service.deleteProjectUser(invalidId)).rejects.toThrow();
    });

    it('should handle deletion when user or project no longer exists', async () => {
      // Delete the user first
      await userModel.findByIdAndDelete(userId);

      // Deletion should still work (just won't update the user's projects array)
      const result = await service.deleteProjectUser(
        String(createdProjectUser._id),
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdProjectUser._id);

      // Verify the project user was deleted
      const deletedProjectUser = await projectUserModel.findById(
        createdProjectUser._id,
      );
      expect(deletedProjectUser).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle creation with duplicate user-project combination', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      // Create first project user
      await service.createProjectUser(createProjectUserDto);

      // Try to create duplicate - should still work (business logic dependent)
      const result = await service.createProjectUser(createProjectUserDto);
      expect(result).toBeDefined();
    });

    it('should handle extreme workshift values', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 24, // Maximum hours
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC',
        endOfDayHour: 23,
        endOfDayMin: 59,
      };

      const result = await service.createProjectUser(createProjectUserDto);
      expect(result).toBeDefined();
      expect(result.workshift).toEqual(24);
      expect(result.endOfDayHour).toEqual(23);
      expect(result.endOfDayMin).toEqual(59);
    });

    it('should handle empty weekdays array', async () => {
      const createProjectUserDto: CreateProjectUserDto = {
        organization: organizationId,
        project: projectId,
        user: userId,
        workshift: 8,
        weekdays: [], // Empty weekdays
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
      };

      const result = await service.createProjectUser(createProjectUserDto);
      expect(result).toBeDefined();
      expect(result.weekdays).toEqual([]);
    });
  });
});
