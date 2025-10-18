import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ProjectUserService } from './project-user.service';
import { CreateProjectUserDto } from '../dto/create-project.user.dto';
import { Response } from 'express';

@Controller('project-user')
export class ProjectUserController {
  constructor(private readonly projectUserService: ProjectUserService) {}
  /**
   * Creates a new organization.
   * @param response - The response object to send the result.
   * @param createProjectUserDto - The data transfer object containing organization details.
   * @returns A JSON response with the status and created organization data.
   */
  @Post()
  async createProjectUser(
    @Body() createProjectUserDto: CreateProjectUserDto,
  ): Promise<{ message: string; newProjectUser: any }> {
    try {
      const newProjectUser =
        await this.projectUserService.createProjectUser(createProjectUserDto);
      return {
        message: 'ProjectUser has been created successfully',
        newProjectUser,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: ProjectUser not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Updates an existing organization by ID.
   * @param response - The response object to send the result.
   * @param organizationId - The ID of the organization to update.
   * @param updateProjectUserDto - The data transfer object containing updated organization details.
   * @returns A JSON response with the status and updated organization data.
   */
  @Put('/:id')
  async updateProjectUser(
    @Param('id') projectUserId: string,
    @Body() updateProjectUserDto: CreateProjectUserDto,
  ) {
    try {
      const existingProjectUser =
        await this.projectUserService.updateProjectUser(
          projectUserId,
          updateProjectUserDto,
        );
      return {
        message: 'ProjectUser has been updated successfully',
        existingProjectUser,
      };
    } catch {
      throw new HttpException(
        { message: 'Error updating project user' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * Retrieves all projectUsers.
   * @returns An array of projectUsers.
   */
  @Get()
  async getProjectUsers(@Res() response: Response) {
    try {
      const projectUserData =
        await this.projectUserService.getAllProjectUsers();
      return response.status(HttpStatus.OK).json({
        message: 'All projectUsers data found successfully',
        projectUserData,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  /**
   * Retrieves a projectUser by its ID.
   * @param projectUserId - The ID of the projectUser to retrieve.
   * @returns The projectUser with the specified ID.
   */
  @Get('/:id')
  async getProjectUser(
    @Res() response: Response,
    @Param('id') projectUserId: string,
  ) {
    try {
      const existingProjectUser =
        await this.projectUserService.getProjectUser(projectUserId);
      return response.status(HttpStatus.OK).json({
        message: 'ProjectUser found successfully',
        existingProjectUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  /**
   * Deletes a projectUser by its ID.
   * @param projectUserId - The ID of the projectUser to delete.
   * @returns The deleted projectUser.
   */
  @Delete('/:id')
  async deleteProjectUser(
    @Res() response: Response,
    @Param('id') projectUserId: string,
  ) {
    try {
      const deletedProjectUser =
        await this.projectUserService.deleteProjectUser(projectUserId);
      return response.status(HttpStatus.OK).json({
        message: 'ProjectUser deleted successfully',
        deletedProjectUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
}
