import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { TimeOff, TimeOffSchema } from '../schemas/time-off.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectModel: Model<Project>;
  let userModel: Model<User>;
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
            { name: Project.name, schema: ProjectSchema },
            { name: User.name, schema: UserSchema },
            { name: Organization.name, schema: OrganizationSchema },
            { name: Task.name, schema: TaskSchema },
            { name: TimeOff.name, schema: TimeOffSchema },
          ]),
        ],
        providers: [ProjectService],
      }).compile();

      service = module.get<ProjectService>(ProjectService);
      // Get the Mongoose Model instances directly to query the database later
      projectModel = module.get<Model<Project>>(getModelToken(Project.name));
      userModel = module.get<Model<User>>(getModelToken(User.name));
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
    if (projectModel) {
      await projectModel.deleteMany({});
    }
    if (userModel) {
      await userModel.deleteMany({});
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

    it('should have access to project model', () => {
      expect(projectModel).toBeDefined();
    });

    it('should have access to user model', () => {
      expect(userModel).toBeDefined();
    });

    it('should have access to organization model', () => {
      expect(organizationModel).toBeDefined();
    });
  });

  describe('createProject', () => {
    it('should create a new project successfully', async () => {
      // Arrange - Create sponsor user and organization first
      const sponsorUser = new userModel({
        name: 'Sponsor User',
        email: 'sponsor@example.com',
        password: 'password123',
      });
      const savedSponsor = await sponsorUser.save();

      const organization = new organizationModel({
        name: 'Test Organization',
        sponsor: savedSponsor._id,
        projects: [],
      });
      const savedOrganization = await organization.save();

      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        sponsor: savedSponsor._id,
        organization: savedOrganization._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 100,
      };

      // Act
      const result = await service.createProject(createProjectDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createProjectDto.name);
      expect(result.sponsor?.toString()).toBe(savedSponsor._id.toString());
      expect(result.organization?.toString()).toBe(
        savedOrganization._id.toString(),
      );
      expect(result._id).toBeDefined();
      // Check that sponsor is added to users array
      expect(result.users).toContainEqual(savedSponsor._id);
    });

    it('should add project to organization projects array', async () => {
      // Arrange - Create sponsor user and organization first
      const sponsorUser = new userModel({
        name: 'Sponsor User 2',
        email: 'sponsor2@example.com',
        password: 'password123',
      });
      const savedSponsor = await sponsorUser.save();

      const organization = new organizationModel({
        name: 'Test Organization 2',
        sponsor: savedSponsor._id,
        projects: [],
      });
      const savedOrganization = await organization.save();

      const createProjectDto: CreateProjectDto = {
        name: 'Test Project 2',
        sponsor: savedSponsor._id,
        organization: savedOrganization._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 100,
      };

      // Act
      const result = await service.createProject(createProjectDto);

      // Assert - Check if project was added to organization's projects
      const updatedOrganization = await organizationModel.findById(
        savedOrganization._id,
      );
      expect(updatedOrganization!.projects).toContainEqual(result._id);
    });

    it('should save project to database', async () => {
      // Arrange - Create sponsor user and organization first
      const sponsorUser = new userModel({
        name: 'Sponsor User 3',
        email: 'sponsor3@example.com',
        password: 'password123',
      });
      const savedSponsor = await sponsorUser.save();

      const organization = new organizationModel({
        name: 'Test Organization 3',
        sponsor: savedSponsor._id,
        projects: [],
      });
      const savedOrganization = await organization.save();

      const createProjectDto: CreateProjectDto = {
        name: 'Database Test Project',
        sponsor: savedSponsor._id,
        organization: savedOrganization._id,
        workshift: 8,
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timezone: 'UTC',
        endOfDayHour: 17,
        endOfDayMin: 0,
        startDate: '2024-01-01T00:00:00.000Z',
        estimate: 100,
      };

      // Act
      await service.createProject(createProjectDto);

      // Assert - Check if project exists in database
      const projectInDb = await projectModel.findOne({
        name: createProjectDto.name,
      });
      expect(projectInDb).toBeDefined();
      expect(projectInDb!.name).toBe(createProjectDto.name);
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects when projects exist', async () => {
      // Arrange - Create test projects
      const project1 = new projectModel({
        name: 'Project 1',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
      });
      const project2 = new projectModel({
        name: 'Project 2',
        sponsor: '507f1f77bcf86cd799439013',
        organization: '507f1f77bcf86cd799439014',
      });
      await project1.save();
      await project2.save();

      // Act
      const result = await service.getAllProjects();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Project 1');
      expect(result[1].name).toBe('Project 2');
    });

    it('should throw NotFoundException when no projects exist', async () => {
      // Act & Assert
      await expect(service.getAllProjects()).rejects.toThrow(NotFoundException);
      await expect(service.getAllProjects()).rejects.toThrow(
        'Projects data not found!',
      );
    });
  });

  describe('getProject', () => {
    it('should return a project by ID', async () => {
      // Arrange
      const project = new projectModel({
        name: 'Test Project',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
      });
      const savedProject = await project.save();

      // Act
      const result = await service.getProject(savedProject._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Project');
      expect(result.sponsor?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012');
    });

    it('should throw NotFoundException for non-existent project', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.getProject(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProject(nonExistentId)).rejects.toThrow(
        `Project #${nonExistentId} not found`,
      );
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      // Arrange
      const project = new projectModel({
        name: 'Original Name',
        sponsor: '507f1f77bcf86cd799439011',
        organization: '507f1f77bcf86cd799439012',
      });
      const savedProject = await project.save();

      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
      };

      // Act
      const result = await service.updateProject(
        savedProject._id.toString(),
        updateProjectDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.sponsor?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(result.organization?.toString()).toBe('507f1f77bcf86cd799439012');
    });

    it('should throw NotFoundException for non-existent project', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateProjectDto: UpdateProjectDto = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(
        service.updateProject(nonExistentId, updateProjectDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateProject(nonExistentId, updateProjectDto),
      ).rejects.toThrow(`Project #${nonExistentId} not found`);
    });
  });

  describe('deleteProject', () => {
    it('should delete an existing project', async () => {
      // Arrange - Create organization and project
      const organization = new organizationModel({
        name: 'Delete Test Org',
        sponsor: '507f1f77bcf86cd799439011',
        projects: [],
      });
      const savedOrganization = await organization.save();

      const project = new projectModel({
        name: 'To Be Deleted',
        sponsor: '507f1f77bcf86cd799439011',
        organization: savedOrganization._id,
      });
      const savedProject = await project.save();

      // Add project to organization's projects array
      await organizationModel.findByIdAndUpdate(savedOrganization._id, {
        $addToSet: { projects: savedProject._id },
      });

      // Act
      const result = await service.deleteProject(savedProject._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('To Be Deleted');

      // Verify project is actually deleted
      const deletedProject = await projectModel.findById(savedProject._id);
      expect(deletedProject).toBeNull();

      // Verify project was removed from organization's projects array
      const updatedOrganization = await organizationModel.findById(
        savedOrganization._id,
      );
      expect(updatedOrganization!.projects).not.toContainEqual(
        savedProject._id,
      );
    });

    it('should throw NotFoundException for non-existent project', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act & Assert
      await expect(service.deleteProject(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteProject(nonExistentId)).rejects.toThrow(
        `Project #${nonExistentId} not found`,
      );
    });
  });
});
