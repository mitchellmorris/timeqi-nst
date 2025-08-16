import {
  Injectable,
  NotFoundException,
  // NotFoundException
} from '@nestjs/common';
import { IProjectUser } from 'src/interface/project.user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjectUserDto } from 'src/dto/create-project.user.dto';
import { IUser } from 'src/interface/user.interface';
import { IProject } from 'src/interface/project.interface';

@Injectable()
export class ProjectUserService {
  constructor(
    @InjectModel('ProjectUser')
    private readonly projectUserModel: Model<IProjectUser>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Project') private projectModel: Model<IProject>,
  ) {}
  /**
   * Creates a new organization in the database.
   * @param createOrganizationDto - The data transfer object containing organization details.
   * @returns The created organization.
   */
  async createProjectUser(
    createProjectUserDto: CreateProjectUserDto,
  ): Promise<IProjectUser> {
    const newProjectUser = new this.projectUserModel({
      ...createProjectUserDto,
    });
    // Add project to the user's projects array
    await this.userModel.findByIdAndUpdate(createProjectUserDto.user, {
      $addToSet: { projects: newProjectUser.project },
    });
    // Add user to the project's users array
    await this.projectModel.findByIdAndUpdate(newProjectUser.project, {
      $addToSet: { users: createProjectUserDto.user },
    });
    return newProjectUser.save();
  }
  /**
   * Updates an existing projectUser in the database.
   * @param projectUserId - The ID of the projectUser to update.
   * @param updateProjectUserDto - The data transfer object containing updated projectUser details.
   * @returns The updated projectUser.
   */
  async updateProjectUser(
    projectUserId: string,
    updateProjectUserDto: CreateProjectUserDto,
  ): Promise<IProjectUser> {
    const existingProjectUser = await this.projectUserModel.findByIdAndUpdate(
      projectUserId,
      updateProjectUserDto,
      { new: true },
    );
    if (!existingProjectUser) {
      throw new NotFoundException('ProjectUser not found');
    }
    return existingProjectUser;
  }
  /**
   * Retrieves all projectUsers from the database.
   * @returns An array of projectUsers.
   */
  async getAllProjectUsers(): Promise<IProjectUser[]> {
    const projectUserData = await this.projectUserModel.find();
    if (!projectUserData || projectUserData.length == 0) {
      throw new NotFoundException('ProjectUsers data not found!');
    }
    return projectUserData;
  }
  /**
   * Retrieves a projectUser by its ID.
   * @param projectUserId - The ID of the projectUser to retrieve.
   * @returns The projectUser with the specified ID.
   */
  async getProjectUser(projectUserId: string): Promise<IProjectUser> {
    const existingProjectUser =
      await this.projectUserModel.findById(projectUserId);
    if (!existingProjectUser) {
      throw new NotFoundException(`ProjectUser #${projectUserId} not found`);
    }
    return existingProjectUser;
  }
  /**
   * Deletes a projectUser by its ID.
   * @param projectUserId - The ID of the projectUser to delete.
   * @returns The deleted projectUser.
   */
  async deleteProjectUser(projectUserId: string): Promise<IProjectUser> {
    const deletedProjectUser =
      await this.projectUserModel.findByIdAndDelete(projectUserId);
    if (!deletedProjectUser) {
      throw new NotFoundException(`ProjectUser #${projectUserId} not found`);
    }
    // Remove project from the user's projects array
    await this.userModel.findByIdAndUpdate(deletedProjectUser.user, {
      $pull: { projects: deletedProjectUser.project },
    });
    // Remove user from the project's users array
    await this.projectModel.findByIdAndUpdate(deletedProjectUser.project, {
      $pull: { users: deletedProjectUser.user },
    });
    return deletedProjectUser;
  }
}
