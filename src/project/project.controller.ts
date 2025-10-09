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
import { ProjectService } from './project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Response } from 'express';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  /**
   * Creates a new project.
   * @param response - The response object to send the result.
   * @param createProjectDto - The data transfer object containing project details.
   * @returns A JSON response with the status and created project data.
   */
  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    try {
      const newProject =
        await this.projectService.createProject(createProjectDto);
      return {
        message: 'Project has been created successfully',
        newProject,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: Project not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Updates an existing project by ID.
   * @param response - The response object to send the result.
   * @param projectId - The ID of the project to update.
   * @param updateProjectDto - The data transfer object containing updated project details.
   * @returns A JSON response with the status and updated project data.
   */
  @Put('/:id')
  async updateProject(
    @Res() response: Response,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      const existingProject = await this.projectService.updateProject(
        projectId,
        updateProjectDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'Project has been successfully updated',
        existingProject,
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
   * Retrieves all projects.
   * @param response - The response object to send the result.
   * @returns A JSON response with the status and all project data.
   */
  @Get()
  async getProjects(@Res() response: Response) {
    try {
      const projectData = await this.projectService.getAllProjects();
      return response.status(HttpStatus.OK).json({
        message: 'All projects data found successfully',
        projectData,
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
   * Retrieves a project by ID.
   * @param response - The response object to send the result.
   * @param projectId - The ID of the project to retrieve.
   * @returns A JSON response with the status and found project data.
   */
  @Get('/:id')
  async getProject(@Res() response: Response, @Param('id') projectId: string) {
    try {
      const existingProject = await this.projectService.getProject(projectId);
      return response.status(HttpStatus.OK).json({
        message: 'Project found successfully',
        existingProject,
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
   * Deletes a project by ID.
   * @param response - The response object to send the result.
   * @param projectId - The ID of the project to delete.
   * @returns A JSON response with the status and deleted project data.
   */
  @Delete('/:id')
  async deleteProject(
    @Res() response: Response,
    @Param('id') projectId: string,
  ) {
    try {
      const deletedProject = await this.projectService.deleteProject(projectId);
      return response.status(HttpStatus.OK).json({
        message: 'Project deleted successfully',
        deletedProject,
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
