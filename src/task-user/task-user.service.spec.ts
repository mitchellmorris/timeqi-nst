import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskUserService } from './task-user.service';
import { TaskUser, TaskUserSchema } from '../schemas/task.user.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { CreateTaskUserDto } from '../dto/create-task.user';
import { UpdateTaskUserDto } from '../dto/update-task.user.dto';

describe('TaskUserService', () => {
  let service: TaskUserService;
  let taskUserModel: Model<TaskUser>;
  let userModel: Model<User>;
  let taskModel: Model<Task>;
  let organizationModel: Model<Organization>;
  let projectModel: Model<Project>;
  let module: TestingModule;

  // Test data
  let organizationId: Types.ObjectId;
  let projectId: Types.ObjectId;
  let taskId: Types.ObjectId;
  let userId: Types.ObjectId;

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
            { name: TaskUser.name, schema: TaskUserSchema },
            { name: User.name, schema: UserSchema },
            { name: Task.name, schema: TaskSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: Project.name, schema: ProjectSchema },
          ]),
        ],
        providers: [TaskUserService],
      }).compile();

      service = module.get<TaskUserService>(TaskUserService);
      taskUserModel = module.get<Model<TaskUser>>(getModelToken(TaskUser.name));
      userModel = module.get<Model<User>>(getModelToken(User.name));
      taskModel = module.get<Model<Task>>(getModelToken(Task.name));
      organizationModel = module.get<Model<Organization>>(
        getModelToken(Organization.name),
      );
      projectModel = module.get<Model<Project>>(getModelToken(Project.name));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Clean all collections
    if (taskUserModel) {
      await taskUserModel.deleteMany({});
    }
    if (userModel) {
      await userModel.deleteMany({});
    }
    if (taskModel) {
      await taskModel.deleteMany({});
    }
    if (organizationModel) {
      await organizationModel.deleteMany({});
    }
    if (projectModel) {
      await projectModel.deleteMany({});
    }

    // Create test data
    organizationId = new Types.ObjectId();
    projectId = new Types.ObjectId();
    taskId = new Types.ObjectId();
    userId = new Types.ObjectId();

    // Create test organization
    await organizationModel.create({
      _id: organizationId,
      name: 'Test Organization',
      sponsor: userId, // Add required sponsor field
    });

    // Create test project
    await projectModel.create({
      _id: projectId,
      name: 'Test Project',
      organization: organizationId,
      sponsor: userId,
    });

    // Create test user
    await userModel.create({
      _id: userId,
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'hashedpassword',
      organizations: [organizationId],
    });

    // Create test task
    await taskModel.create({
      _id: taskId,
      name: 'Test Task',
      index: 1, // Add required index field
      organization: organizationId,
      project: projectId,
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

  describe('createTaskUser', () => {
    it('should create a new task user assignment', async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };

      const result = await service.createTaskUser(createTaskUserDto);

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Convert ObjectIds to strings for comparison if needed
      expect(result.organization?.toString()).toEqual(
        organizationId.toString(),
      );
      expect(result.project?.toString()).toEqual(projectId.toString());
      expect(result.task?.toString()).toEqual(taskId.toString());
      expect(result.user?.toString()).toEqual(userId.toString());

      // Verify the task's users array was updated
      const updatedTask = await taskModel.findById(taskId);
      expect(updatedTask?.users).toContainEqual(userId);
    });

    it('should handle errors during task user creation', async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: new Types.ObjectId(), // Non-existent organization
        project: projectId,
        task: taskId,
        user: userId,
      };

      // This should still create the TaskUser but may not update related models
      const result = await service.createTaskUser(createTaskUserDto);
      expect(result).toBeDefined();
    });
  });

  describe('updateTaskUser', () => {
    let createdTaskUser: TaskUser;

    beforeEach(async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };
      createdTaskUser = await service.createTaskUser(createTaskUserDto);
    });

    it('should update an existing task user', async () => {
      const updateTaskUserDto: UpdateTaskUserDto = {};

      const result = await service.updateTaskUser(
        String(createdTaskUser._id),
        updateTaskUserDto,
      );

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdTaskUser._id);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent task user', async () => {
      const updateTaskUserDto: UpdateTaskUserDto = {};
      const nonExistentId = new Types.ObjectId().toString();

      await expect(
        service.updateTaskUser(nonExistentId, updateTaskUserDto),
      ).rejects.toThrow('TaskUser not found');
    });
  });

  describe('getAllTaskUsers', () => {
    it('should return all task users', async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };

      await service.createTaskUser(createTaskUserDto);

      const result = await service.getAllTaskUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      // Check that populate worked - we should get populated objects, not just IDs
      const taskUser = result[0];
      expect(taskUser.organization).toBeDefined();
      expect(taskUser.project).toBeDefined();
      expect(taskUser.task).toBeDefined();
      expect(taskUser.user).toBeDefined();
      // Basic verification that populate worked (these should be objects, not IDs)
      expect(typeof taskUser.organization).toBe('object');
      expect(typeof taskUser.project).toBe('object');
      expect(typeof taskUser.task).toBe('object');
      expect(typeof taskUser.user).toBe('object');
    });

    it('should throw NotFoundException when no task users exist', async () => {
      await expect(service.getAllTaskUsers()).rejects.toThrow(
        'TaskUsers data not found!',
      );
    });
  });

  describe('getTaskUser', () => {
    let createdTaskUser: TaskUser;

    beforeEach(async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };
      createdTaskUser = await service.createTaskUser(createTaskUserDto);
    });

    it('should return a task user by id', async () => {
      const result = await service.getTaskUser(String(createdTaskUser._id));

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdTaskUser._id);
      expect(result).toBeDefined();
      expect(result._id).toEqual(createdTaskUser._id);
      // Check that populate worked - we should get populated objects, not just IDs
      expect(result.organization).toBeDefined();
      expect(result.project).toBeDefined();
      expect(result.task).toBeDefined();
      expect(result.user).toBeDefined();
      // Basic verification that populate worked (these should be objects, not IDs)
      expect(typeof result.organization).toBe('object');
      expect(typeof result.project).toBe('object');
      expect(typeof result.task).toBe('object');
      expect(typeof result.user).toBe('object');
    });

    it('should throw NotFoundException for non-existent task user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(service.getTaskUser(nonExistentId)).rejects.toThrow(
        `TaskUser #${nonExistentId} not found`,
      );
    });
  });

  describe('deleteTaskUser', () => {
    let createdTaskUser: TaskUser;

    beforeEach(async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };
      createdTaskUser = await service.createTaskUser(createTaskUserDto);
    });

    it('should delete a task user', async () => {
      const result = await service.deleteTaskUser(String(createdTaskUser._id));

      expect(result).toBeDefined();
      expect(result._id).toEqual(createdTaskUser._id);

      // Verify the task user was deleted
      const deletedTaskUser = await taskUserModel.findById(createdTaskUser._id);
      expect(deletedTaskUser).toBeNull();

      // Verify the task's users array was updated
      const updatedTask = await taskModel.findById(taskId);
      expect(updatedTask?.users).not.toContainEqual(userId);
    });

    it('should throw NotFoundException for non-existent task user', async () => {
      const nonExistentId = new Types.ObjectId().toString();

      await expect(service.deleteTaskUser(nonExistentId)).rejects.toThrow(
        `TaskUser #${nonExistentId} not found`,
      );
    });
  });

  describe('populate functionality', () => {
    let createdTaskUser: TaskUser;

    beforeEach(async () => {
      const createTaskUserDto: CreateTaskUserDto = {
        organization: organizationId,
        project: projectId,
        task: taskId,
        user: userId,
      };
      createdTaskUser = await service.createTaskUser(createTaskUserDto);
    });

    it('should populate related fields when getting all task users', async () => {
      const result = await service.getAllTaskUsers();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      // The populate should work, but the exact structure depends on the schema
      expect(result[0]).toBeDefined();
    });

    it('should populate related fields when getting a single task user', async () => {
      const result = await service.getTaskUser(String(createdTaskUser._id));

      expect(result).toBeDefined();
      // The populate should work, but the exact structure depends on the schema
      expect(result._id).toEqual(createdTaskUser._id);
    });
  });
});
