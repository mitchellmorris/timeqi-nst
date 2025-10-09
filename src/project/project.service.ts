import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProjectDto } from '../dto/create-project.dto';
import { IProject } from '../interface/project.interface';
import { Model } from 'mongoose';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { IUser } from '../interface/user.interface';
import { IOrganization } from '../interface/organization.interface';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project') private projectModel: Model<IProject>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Organization')
    private organizationModel: Model<IOrganization>,
  ) {}
  /**
   * Creates a new project in the database.
   * @param createProjectDto - The data transfer object containing project details.
   * @returns The created project.
   */
  async createProject(createProjectDto: CreateProjectDto): Promise<IProject> {
    const newProject = new this.projectModel({
      ...createProjectDto,
      users: [createProjectDto.sponsor], // initialize users array with sponsor
    });
    // Add project to the organization's projects array
    await this.organizationModel.findByIdAndUpdate(
      createProjectDto.organization,
      {
        $addToSet: { projects: newProject._id },
      },
    );
    return newProject.save();
  }
  /**
   * Updates an existing project in the database.
   * @param projectId - The ID of the project to update.
   * @param updateProjectDto - The data transfer object containing updated project details.
   * @returns The updated project.
   */
  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<IProject> {
    const existingProject = await this.projectModel.findByIdAndUpdate(
      projectId,
      updateProjectDto,
      { new: true },
    );
    if (!existingProject) {
      throw new NotFoundException(`Project #${projectId} not found`);
    }
    return existingProject;
  }
  /**
   * Retrieves all projects from the database.
   * @returns An array of projects.
   */
  async getAllProjects(): Promise<IProject[]> {
    const projectData = await this.projectModel.find();
    if (!projectData || projectData.length == 0) {
      throw new NotFoundException('Projects data not found!');
    }
    return projectData;
  }
  /**
   * Retrieves a project by its ID.
   * @param projectId - The ID of the project to retrieve.
   * @returns The project with the specified ID.
   */
  async getProject(projectId: string): Promise<IProject> {
    const existingProject = await this.projectModel
      .findById(projectId)
      .select('-users')
      .populate({
        path: 'tasks',
        select: '_id name',
        populate: {
          path: 'assignee',
          select: '_id name',
        },
      })
      .populate({
        path: 'timeOff',
        select: '_id name',
      })
      .exec();
    if (!existingProject) {
      throw new NotFoundException(`Project #${projectId} not found`);
    }
    return existingProject;
  }
  /**
   * Deletes an project by its ID.
   * @param projectId - The ID of the project to delete.
   * @returns The deleted project.
   */
  async deleteProject(projectId: string): Promise<IProject> {
    const deletedProject = await this.projectModel.findByIdAndDelete(projectId);
    if (!deletedProject) {
      throw new NotFoundException(`Project #${projectId} not found`);
    }
    // Remove project from the organization's projects array
    await this.organizationModel.findByIdAndUpdate(
      deletedProject.get('organization'),
      {
        $pull: { projects: projectId },
      },
    );
    return deletedProject;
  }
}
