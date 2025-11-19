import { Test, TestingModule } from '@nestjs/testing';
import { EntryService } from './entry.service';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Entry, EntrySchema } from '../schemas/entry.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { UpdateEntryDto } from '../dto/update-entry.dto';

describe('EntryService', () => {
  let service: EntryService;
  let entryModel: Model<Entry>;
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
            { name: Entry.name, schema: EntrySchema },
            { name: User.name, schema: UserSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: Task.name, schema: TaskSchema },
          ]),
        ],
        providers: [EntryService],
      }).compile();

      service = module.get<EntryService>(EntryService);
      // Get the Mongoose Model instances directly to query the database later
      entryModel = module.get<Model<Entry>>(getModelToken(Entry.name));
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
    if (entryModel) {
      await entryModel.deleteMany({});
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

    it('should have access to entry model', () => {
      expect(entryModel).toBeDefined();
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

  describe('createEntry', () => {
    it('should create a new entry successfully', async () => {
      // Arrange - Create all required entities first
      const performer = new userModel({
        name: 'Performer User',
        email: 'performer@example.com',
        password: 'password123',
      });
      const savedPerformer = await performer.save();

      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: savedPerformer._id,
      });
      const savedOrganization = await organization.save();

      const project = new projectModel({
        name: 'Test Project',
        sponsor: savedPerformer._id,
        organization: savedOrganization._id,
      });
      const savedProject = await project.save();

      const task = new taskModel({
        name: 'Test Task',
        index: 1,
        assignee: savedPerformer._id,
        sponsor: savedPerformer._id,
        organization: savedOrganization._id,
        project: savedProject._id,
      });
      const savedTask = await task.save();

      const createEntryDto: CreateEntryDto = {
        name: 'Work Entry',
        hours: 8,
        description: 'Daily work on project',
        date: new Date('2024-01-01T09:00:00.000Z'),
        performer: savedPerformer._id,
        organization: savedOrganization._id,
        project: savedProject._id,
        task: savedTask._id,
        forecast: 8,
      };

      // Act
      const result = await service.createEntry(createEntryDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createEntryDto.name);
      expect(result.hours).toBe(createEntryDto.hours);
      expect(result.description).toBe(createEntryDto.description);
      expect(result.performer?.toString()).toBe(savedPerformer._id.toString());
      expect(result.organization?.toString()).toBe(
        savedOrganization._id.toString(),
      );
      expect(result.project?.toString()).toBe(savedProject._id.toString());
      expect(result.task?.toString()).toBe(savedTask._id.toString());
      expect(result._id).toBeDefined();
    });

    it('should save entry to database', async () => {
      // Arrange - Create minimal required entities
      const performer = new userModel({
        name: 'DB Test User',
        email: 'dbtest@example.com',
        password: 'password123',
      });
      const savedPerformer = await performer.save();

      const createEntryDto: CreateEntryDto = {
        name: 'Database Test Entry',
        hours: 4,
        description: 'Test entry for database persistence',
        date: new Date('2024-01-01T14:00:00.000Z'),
        performer: savedPerformer._id,
        organization: savedPerformer._id, // Use same ID for simplicity
        project: savedPerformer._id,
        task: savedPerformer._id,
        forecast: 4,
      };

      // Act
      await service.createEntry(createEntryDto);

      // Assert - Check if entry exists in database
      const entryInDb = await entryModel.findOne({
        name: createEntryDto.name,
      });
      expect(entryInDb).toBeDefined();
      expect(entryInDb!.name).toBe(createEntryDto.name);
      expect(entryInDb!.hours).toBe(createEntryDto.hours);
      expect(entryInDb!.description).toBe(createEntryDto.description);
    });
  });

  describe('getAllEntries', () => {
    it('should return all entries when entries exist', async () => {
      // Arrange - Create test entries
      const entry1 = new entryModel({
        name: 'Entry 1',
        hours: 4,
        description: 'First entry',
        date: new Date('2024-01-01T09:00:00.000Z'),
        performer: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
        task: '507f1f77bcf86cd799439014',
        forecast: 4,
      });
      const entry2 = new entryModel({
        name: 'Entry 2',
        hours: 6,
        description: 'Second entry',
        date: new Date('2024-01-02T10:00:00.000Z'),
        performer: '507f1f77bcf86cd799439015',
        organization: '507f1f77bcf86cd799439016',
        project: '507f1f77bcf86cd799439017',
        task: '507f1f77bcf86cd799439018',
        forecast: 6,
      });
      await entry1.save();
      await entry2.save();

      // Act
      const result = await service.getAllEntries();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Entry 1');
      expect(result[1].name).toBe('Entry 2');
    });

    it('should throw NotFoundException when no entries exist', async () => {
      // Act & Assert
      await expect(service.getAllEntries()).rejects.toThrow(NotFoundException);
      await expect(service.getAllEntries()).rejects.toThrow(
        'Entries data not found!',
      );
    });
  });

  describe('getEntry', () => {
    it('should return an entry by ID', async () => {
      // Arrange
      const entry = new entryModel({
        name: 'Test Entry',
        hours: 5,
        description: 'Test entry description',
        date: new Date('2024-01-01T11:00:00.000Z'),
        performer: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
        task: '507f1f77bcf86cd799439014',
        forecast: 5,
      });
      const savedEntry = await entry.save();

      // Act
      const result = await service.getEntry(savedEntry._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Entry');
      expect(result.hours).toBe(5);
      expect(result.description).toBe('Test entry description');
      expect(result.performer?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012');
      expect(result.project?.toString()).toBe('507f1f77bcf86cd799439013');
      expect(result.task?.toString()).toBe('507f1f77bcf86cd799439014');
    });

    it('should throw NotFoundException for non-existent entry', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getEntry(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getEntry(nonExistentId)).rejects.toThrow(
        `Entry #${nonExistentId} not found`,
      );
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry', async () => {
      // Arrange
      const entry = new entryModel({
        name: 'Original Entry',
        hours: 3,
        description: 'Original description',
        date: new Date('2024-01-01T08:00:00.000Z'),
        performer: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
        task: '507f1f77bcf86cd799439014',
        forecast: 3,
      });
      const savedEntry = await entry.save();

      const updateEntryDto: UpdateEntryDto = {
        name: 'Updated Entry',
        hours: 7,
        description: 'Updated description',
      };

      // Act
      const result = await service.updateEntry(
        savedEntry._id.toString(),
        updateEntryDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Entry');
      expect(result.hours).toBe(7);
      expect(result.description).toBe('Updated description');
      expect(result.performer?.toString()).toBe('507f1f77bcf86cd799439011'); // Should remain unchanged
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012'); // Should remain unchanged
    });

    it('should throw NotFoundException for non-existent entry', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateEntryDto: UpdateEntryDto = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(
        service.updateEntry(nonExistentId, updateEntryDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateEntry(nonExistentId, updateEntryDto),
      ).rejects.toThrow(`Entry #${nonExistentId} not found`);
    });
  });

  describe('deleteEntry', () => {
    it('should delete an existing entry', async () => {
      // Arrange
      const entry = new entryModel({
        name: 'To Be Deleted',
        hours: 2,
        description: 'Entry to be deleted',
        date: new Date('2024-01-01T16:00:00.000Z'),
        performer: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
        project: '507f1f77bcf86cd799439013',
        task: '507f1f77bcf86cd799439014',
        forecast: 2,
      });
      const savedEntry = await entry.save();

      // Act
      const result = await service.deleteEntry(savedEntry._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify entry is actually deleted
      const deletedEntry = await entryModel.findById(savedEntry._id);
      expect(deletedEntry).toBeNull();
    });

    it('should throw NotFoundException for non-existent entry', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteEntry(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteEntry(nonExistentId)).rejects.toThrow(
        `Entry #${nonExistentId} not found`,
      );
    });
  });
});
