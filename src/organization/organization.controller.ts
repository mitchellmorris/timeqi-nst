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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from 'src/dto/create-organization.dto';
import { UpdateOrganizationDto } from 'src/dto/update-organization.dto';
import { Response } from 'express';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}
  /**
   * Creates a new organization.
   * @param response - The response object to send the result.
   * @param createOrganizationDto - The data transfer object containing organization details.
   * @returns A JSON response with the status and created organization data.
   */
  @Post()
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<{ message: string; newOrganization: any }> {
    try {
      const newOrganization = await this.organizationService.createOrganization(
        createOrganizationDto,
      );
      return {
        message: 'Organization has been created successfully',
        newOrganization,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: Organization not created!',
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
   * @param updateOrganizationDto - The data transfer object containing updated organization details.
   * @returns A JSON response with the status and updated organization data.
   */
  @Put('/:id')
  async updateOrganization(
    @Res() response: Response,
    @Param('id') organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    try {
      const existingOrganization =
        await this.organizationService.updateOrganization(
          organizationId,
          updateOrganizationDto,
        );
      return response.status(HttpStatus.OK).json({
        message: 'Organization has been successfully updated',
        existingOrganization,
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
   * Retrieves all organizations.
   * @returns A JSON response with the status and all organization data.
   */
  @Get()
  async getOrganizations(@Res() response: Response) {
    try {
      const organizationData =
        await this.organizationService.getAllOrganizations();
      return response.status(HttpStatus.OK).json({
        message: 'All organizations data found successfully',
        organizationData,
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
   * Retrieves an organization by ID.
   * @param response - The response object to send the result.
   * @param organizationId - The ID of the organization to retrieve.
   * @returns A JSON response with the status and found organization data.
   */
  @Get('/:id')
  async getOrganization(
    @Res() response: Response,
    @Param('id') organizationId: string,
  ) {
    try {
      const existingOrganization =
        await this.organizationService.getOrganization(organizationId);
      return response.status(HttpStatus.OK).json({
        message: 'Organization found successfully',
        existingOrganization,
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
   * Deletes an organization by ID.
   * @param response - The response object to send the result.
   * @param organizationId - The ID of the organization to delete.
   * @returns A JSON response with the status and deleted organization data.
   */
  @Delete('/:id')
  async deleteOrganization(
    @Res() response: Response,
    @Param('id') organizationId: string,
  ) {
    try {
      const deletedOrganization =
        await this.organizationService.deleteOrganization(organizationId);
      return response.status(HttpStatus.OK).json({
        message: 'Organization deleted successfully',
        deletedOrganization,
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
