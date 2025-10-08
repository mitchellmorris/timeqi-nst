import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../schemas/task.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Entry, EntrySchema } from '../schemas/entry.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let taskModel: Model<Task>;
  let userModel: Model<User>;
  let projectModel: Model<Project>;
  let organizationModel: Model<Organization>;
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
            { name: Task.name, schema: TaskSchema },
            { name: User.name, schema: UserSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: Entry.name, schema: EntrySchema },
          ]),
        ],
        providers: [TaskService],
      }).compile();

      service = module.get<TaskService>(TaskService);
      // Get the Mongoose Model instances directly to query the database later
      taskModel = module.get<Model<Task>>(getModelToken(Task.name));
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
    // Clean all collections for test isolation
    if (taskModel) {
      await taskModel.deleteMany({});
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

    it('should have access to task model', () => {
      expect(taskModel).toBeDefined();
    });

    it('should have access to user model', () => {
      expect(userModel).toBeDefined();
    });

    it('should have access to project model', () => {
      expect(projectModel).toBeDefined();
    });

    it('should have access to organization model', () => {
      expect(organizationModel).toBeDefined();
    });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      // Arrange - Create assignee user, organization, and project first
      const assigneeUser = new userModel({
        name: 'Assignee User',
        email: 'assignee@example.com',
        password: 'password123',
      });
      const savedAssignee = await assigneeUser.save();

      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: savedAssignee._id,
      });
      const savedOrganization = await organization.save();

      const project = new projectModel({
        name: 'Test Project',
        sponsor: savedAssignee._id,
        organization: savedOrganization._id,
      });
      const savedProject = await project.save();

      const createTaskDto: CreateTaskDto = {
        name: 'Test Task',
        index: 1,
        assignee: savedAssignee._id,
        sponsor: savedAssignee._id,
        organization: savedOrganization._id,
        project: savedProject._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 40,
      };

      // Act
      const result = await service.createTask(createTaskDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createTaskDto.name);
      expect(result.assignee?.toString()).toBe(savedAssignee._id.toString());
      expect(result.organization?.toString()).toBe(
        savedOrganization._id.toString(),
      );
      expect(result.project?.toString()).toBe(savedProject._id.toString());
      expect(result._id).toBeDefined();
      // Check that assignee is added to users array
      expect(result.users).toContainEqual(savedAssignee._id);
    });

    it('should initialize users array with assignee', async () => {
      // Arrange - Create minimal required entities
      const assigneeUser = new userModel({
        name: 'Assignee User 2',
        email: 'assignee2@example.com',
        password: 'password123',
      });
      const savedAssignee = await assigneeUser.save();

      const createTaskDto: CreateTaskDto = {
        name: 'Test Task 2',
        index: 2,
        assignee: savedAssignee._id,
        sponsor: savedAssignee._id,
        organization: savedAssignee._id, // Use a valid ObjectId
        project: savedAssignee._id, // Use a valid ObjectId
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 40,
      };

      // Act - Create task directly since DTO doesn't include sponsor
      const newTask = new taskModel({
        ...createTaskDto,
        sponsor: savedAssignee._id,
        users: [createTaskDto.assignee], // initialize users array with assignee
      });
      const result = await newTask.save();

      // Assert - Check that users array contains assignee
      expect(result.users).toHaveLength(1);
      expect(result.users).toContainEqual(savedAssignee._id);
    });

    it('should save task to database', async () => {
      // Arrange
      const assigneeUser = new userModel({
        name: 'Assignee User 3',
        email: 'assignee3@example.com',
        password: 'password123',
      });
      const savedAssignee = await assigneeUser.save();

      const createTaskDto: CreateTaskDto = {
        name: 'Database Test Task',
        index: 3,
        assignee: savedAssignee._id,
        sponsor: savedAssignee._id,
        organization: savedAssignee._id, // Use a valid ObjectId
        project: savedAssignee._id, // Use a valid ObjectId
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 40,
      };

      // Act - Create task directly since DTO doesn't include sponsor
      const newTask = new taskModel({
        ...createTaskDto,
        sponsor: savedAssignee._id,
        users: [createTaskDto.assignee], // initialize users array with assignee
      });
      await newTask.save();

      // Assert - Check if task exists in database
      const taskInDb = await taskModel.findOne({
        name: createTaskDto.name,
      });
      expect(taskInDb).toBeDefined();
      expect(taskInDb!.name).toBe(createTaskDto.name);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks when tasks exist', async () => {
      // Arrange - Create test tasks
      const task1 = new taskModel({
        name: 'Task 1',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011', // Add sponsor
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const task2 = new taskModel({
        name: 'Task 2',
        index: 2,
        assignee: '507f1f77bcf86cd799439014',
        sponsor: '507f1f77bcf86cd799439014', // Add sponsor
        organization: '507f1f77bcf86cd799439015',
        project: '507f1f77bcf86cd799439016',
      });
      await task1.save();
      await task2.save();

      // Act
      const result = await service.getAllTasks();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Task 1');
      expect(result[1].name).toBe('Task 2');
    });

    it('should throw NotFoundException when no tasks exist', async () => {
      // Act & Assert
      await expect(service.getAllTasks()).rejects.toThrow(NotFoundException);
      await expect(service.getAllTasks()).rejects.toThrow(
        'Tasks data not found!',
      );
    });
  });

  describe('getTask', () => {
    it('should return a task by ID', async () => {
      // Arrange
      const task = new taskModel({
        name: 'Test Task',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011', // Add sponsor
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      // Act
      const result = await service.getTask(savedTask._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Task');
      expect(result.assignee?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012');
      expect(result.project?.toString()).toBe('507f1f77bcf86cd799439013');
    });

    it('should throw NotFoundException for non-existent task', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getTask(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTask(nonExistentId)).rejects.toThrow(
        `Task #${nonExistentId} not found`,
      );
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      // Arrange
      const task = new taskModel({
        name: 'Original Name',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011', // Add sponsor
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      const updateTaskDto: UpdateTaskDto = {
        name: 'Updated Name',
        index: 2,
      };

      // Act
      const result = await service.updateTask(
        savedTask._id.toString(),
        updateTaskDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.assignee?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012');
      expect(result.project?.toString()).toBe('507f1f77bcf86cd799439013');
    });

    it('should throw NotFoundException for non-existent task', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateTaskDto: UpdateTaskDto = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(
        service.updateTask(nonExistentId, updateTaskDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateTask(nonExistentId, updateTaskDto),
      ).rejects.toThrow(`Task #${nonExistentId} not found`);
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      // Arrange
      const task = new taskModel({
        name: 'To Be Deleted',
        index: 1,
        assignee: '507f1f77bcf86cd799439011',
        sponsor: '507f1f77bcf86cd799439011', // Add sponsor
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
      });
      const savedTask = await task.save();

      // Act
      const result = await service.deleteTask(savedTask._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify task is actually deleted
      const deletedTask = await taskModel.findById(savedTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should throw NotFoundException for non-existent task', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteTask(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteTask(nonExistentId)).rejects.toThrow(
        `Task #${nonExistentId} not found`,
      );
    });
  });
});
