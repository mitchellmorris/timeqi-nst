import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffService } from './time-off.service';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { TimeOff, TimeOffSchema } from '../schemas/time-off.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';
import { UpdateTimeOffDto } from '../dto/update-time-off.dto';

describe('TimeOffService', () => {
  let service: TimeOffService;
  let timeOffModel: Model<TimeOff>;
  let userModel: Model<User>;
  let organizationModel: Model<Organization>;
  let projectModel: Model<Project>;
  let taskModel: Model<Task>;
  let module: TestingModule;

  beforeAll(async () => {
    try {
      // We need to establish a connection for the test module
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGO_DATABASE || 'test-db';

      module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(`${mongoUri}/${dbName}`),
          MongooseModule.forFeature([
            { name: TimeOff.name, schema: TimeOffSchema },
            { name: User.name, schema: UserSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: Task.name, schema: TaskSchema },
          ]),
        ],
        providers: [TimeOffService],
      }).compile();

      service = module.get<TimeOffService>(TimeOffService);
      // Get the Mongoose Model instances directly to query the database later
      timeOffModel = module.get<Model<TimeOff>>(getModelToken(TimeOff.name));
      userModel = module.get<Model<User>>(getModelToken(User.name));
      organizationModel = module.get<Model<Organization>>(
        getModelToken(Organization.name),
      );
      projectModel = module.get<Model<Project>>(getModelToken(Project.name));
      taskModel = module.get<Model<Task>>(getModelToken(Task.name));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Clean all collections for test isolation
    if (timeOffModel) {
      await timeOffModel.deleteMany({});
    }
    if (userModel) {
      await userModel.deleteMany({});
    }
    if (organizationModel) {
      await organizationModel.deleteMany({});
    }
    if (projectModel) {
      await projectModel.deleteMany({});
    }
    if (taskModel) {
      await taskModel.deleteMany({});
    }
  });

  // Close the module after all tests
  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Basic Setup', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have access to timeOff model', () => {
      expect(timeOffModel).toBeDefined();
    });

    it('should have access to user model', () => {
      expect(userModel).toBeDefined();
    });

    it('should have access to organization model', () => {
      expect(organizationModel).toBeDefined();
    });

    it('should have access to project model', () => {
      expect(projectModel).toBeDefined();
    });

    it('should have access to task model', () => {
      expect(taskModel).toBeDefined();
    });
  });

  describe('createTimeOff', () => {
    it('should create a new time off for Task successfully', async () => {
      // Arrange - Create a task first
      const task = new taskModel({
        name: 'Test Task',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      const createTimeOffDto: CreateTimeOffDto = {
        name: 'Task Break',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 5,
        extendedHours: 0,
        target: savedTask._id,
        type: 'Task', // Use string literal if 'type' is string, or use enum if available
      };

      // Act
      const result = await service.createTimeOff(createTimeOffDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createTimeOffDto.name);
      expect(result.startDate).toBe(createTimeOffDto.startDate);
      expect(result.days).toBe(createTimeOffDto.days);
      expect(result.target?.toString()).toBe(savedTask._id.toString());
      expect(result.type).toBe('Task');
      expect(result._id).toBeDefined();
    });

    it('should create a new time off for Organization successfully', async () => {
      // Arrange - Create an organization first
      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: '507f1f77bcf86cd799439011',
      });
      const savedOrganization = await organization.save();

      const createTimeOffDto: CreateTimeOffDto = {
        name: 'Company Holiday',
        startDate: '2024-12-25T00:00:00.000Z',
        days: 1,
        extendedHours: 8,
        target: savedOrganization._id,
        type: 'Organization',
      };

      // Act
      const result = await service.createTimeOff(createTimeOffDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createTimeOffDto.name);
      expect(result.target?.toString()).toBe(savedOrganization._id.toString());
      expect(result.type).toBe('Organization');
    });

    it('should create a new time off for Project successfully', async () => {
      // Arrange - Create a project first
      const project = new projectModel({
        name: 'Test Project',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
      });
      const savedProject = await project.save();

      const createTimeOffDto: CreateTimeOffDto = {
        name: 'Project Break',
        startDate: '2024-06-15T00:00:00.000Z',
        days: 3,
        extendedHours: 24,
        target: savedProject._id,
        type: 'Project',
      };

      // Act
      const result = await service.createTimeOff(createTimeOffDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createTimeOffDto.name);
      expect(result.target?.toString()).toBe(savedProject._id.toString());
      expect(result.type).toBe('Project');
    });

    it('should save time off to database', async () => {
      // Arrange - Create a task first
      const task = new taskModel({
        name: 'DB Test Task',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      const createTimeOffDto: CreateTimeOffDto = {
        name: 'Database Test TimeOff',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 2,
        extendedHours: 16,
        target: savedTask._id, // Use a valid ObjectId
        type: 'Task', // Type assertion for now
      };

      // Act
      await service.createTimeOff(createTimeOffDto);

      // Assert - Check if time off exists in database
      const timeOffInDb = await timeOffModel.findOne({
        name: createTimeOffDto.name,
      });
      expect(timeOffInDb).toBeDefined();
      expect(timeOffInDb!.name).toBe(createTimeOffDto.name);
      expect(timeOffInDb!.days).toBe(createTimeOffDto.days);
    });
  });

  describe('getAllTimeOffs', () => {
    it('should return all time offs when time offs exist', async () => {
      // Arrange - Create test time offs
      const timeOff1 = new timeOffModel({
        name: 'TimeOff 1',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 1,
        extendedHours: 8,
        target: '507f1f77bcf86cd799439011',
        type: 'Organization',
      });
      const timeOff2 = new timeOffModel({
        name: 'TimeOff 2',
        startDate: '2024-02-01T00:00:00.000Z',
        days: 2,
        extendedHours: 16,
        target: '507f1f77bcf86cd799439012',
        type: 'Project',
      });
      await timeOff1.save();
      await timeOff2.save();

      // Act
      const result = await service.getAllTimeOffs();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('TimeOff 1');
      expect(result[1].name).toBe('TimeOff 2');
    });

    it('should throw NotFoundException when no time offs exist', async () => {
      // Act & Assert
      await expect(service.getAllTimeOffs()).rejects.toThrow(NotFoundException);
      await expect(service.getAllTimeOffs()).rejects.toThrow(
        'TimeOffs data not found!',
      );
    });
  });

  describe('getTimeOff', () => {
    it('should return a time off by ID with Task population', async () => {
      // Arrange - Create task and time off
      const task = new taskModel({
        name: 'Test Task',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      const timeOff = new timeOffModel({
        name: 'Task TimeOff',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 3,
        extendedHours: 24,
        target: savedTask._id,
        type: 'Task',
      });
      const savedTimeOff = await timeOff.save();

      // Act
      const result = await service.getTimeOff(savedTimeOff._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Task TimeOff');
      expect(result.type).toBe('Task');
      expect(result.target).toBeDefined();
      // The target should be populated with task data via refPath mechanism
      expect(result.target).toHaveProperty('name', 'Test Task');
      expect(result.target).toHaveProperty('_id');
    });

    it('should return a time off by ID with Organization population', async () => {
      // Arrange - Create user, organization and time off
      const user = new userModel({
        name: 'Test User',
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
      });
      const savedUser = await user.save();

      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: savedUser._id,
      });
      const savedOrganization = await organization.save();

      const timeOff = new timeOffModel({
        name: 'Organization TimeOff',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 1,
        extendedHours: 8,
        target: savedOrganization._id,
        type: 'Organization',
      });
      const savedTimeOff = await timeOff.save();

      // Act
      const result = await service.getTimeOff(savedTimeOff._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Organization TimeOff');
      expect(result.type).toBe('Organization');
      expect(result.target).toBeDefined();
      // The target should be populated with organization data
      expect(result.target).toHaveProperty('name', 'Test Organization');
    });

    it('should return a time off by ID with Project population', async () => {
      // Arrange - Create user, organization, project and time off
      const user = new userModel({
        name: 'Test User',
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
      });
      const savedUser = await user.save();

      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: savedUser._id,
      });
      const savedOrganization = await organization.save();

      const project = new projectModel({
        name: 'Test Project',
        sponsor: savedUser._id,
        organization: savedOrganization._id,
      });
      const savedProject = await project.save();

      const timeOff = new timeOffModel({
        name: 'Project TimeOff',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 2,
        extendedHours: 16,
        target: savedProject._id,
        type: 'Project',
      });
      const savedTimeOff = await timeOff.save();

      // Act
      const result = await service.getTimeOff(savedTimeOff._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Project TimeOff');
      expect(result.type).toBe('Project');
      expect(result.target).toBeDefined();
      // The target should be populated with project data
      expect(result.target).toHaveProperty('name', 'Test Project');
    });

    it('should throw NotFoundException for non-existent time off', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getTimeOff(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTimeOff(nonExistentId)).rejects.toThrow(
        `TimeOff #${nonExistentId} not found`,
      );
    });
  });

  describe('updateTimeOff', () => {
    it('should update an existing time off', async () => {
      // Arrange
      const timeOff = new timeOffModel({
        name: 'Original Name',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 1,
        extendedHours: 8,
        target: '507f1f77bcf86cd799439011',
        type: 'Task',
      });
      const savedTimeOff = await timeOff.save();

      const updateTimeOffDto: UpdateTimeOffDto = {
        name: 'Updated Name',
        days: 3,
        extendedHours: 24,
      };

      // Act
      const result = await service.updateTimeOff(
        savedTimeOff._id.toString(),
        updateTimeOffDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.days).toBe(3);
      expect(result.startDate).toBe('2024-01-01T00:00:00.000Z'); // Should remain unchanged
      expect(result.type).toBe('Task'); // Should remain unchanged
    });

    it('should throw NotFoundException for non-existent time off', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateTimeOffDto: UpdateTimeOffDto = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(
        service.updateTimeOff(nonExistentId, updateTimeOffDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateTimeOff(nonExistentId, updateTimeOffDto),
      ).rejects.toThrow(`TimeOff #${nonExistentId} not found`);
    });
  });

  describe('deleteTimeOff', () => {
    it('should delete an existing time off', async () => {
      // Arrange
      const timeOff = new timeOffModel({
        name: 'To Be Deleted',
        startDate: '2024-01-01T00:00:00.000Z',
        days: 1,
        extendedHours: 8,
        target: '507f1f77bcf86cd799439011',
        type: 'Task',
      });
      const savedTimeOff = await timeOff.save();

      // Act
      const result = await service.deleteTimeOff(savedTimeOff._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify time off is actually deleted
      const deletedTimeOff = await timeOffModel.findById(savedTimeOff._id);
      expect(deletedTimeOff).toBeNull();
    });

    it('should throw NotFoundException for non-existent time off', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteTimeOff(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteTimeOff(nonExistentId)).rejects.toThrow(
        `TimeOff #${nonExistentId} not found`,
      );
    });
  });
});
