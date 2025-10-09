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
import { OrganizationUserService } from './organization-user.service';
import { CreateOrganizationUserDto } from '../dto/create-organization.user.dto';
import { UpdateOrganizationUserDto } from '../dto/update-organization.user.dto';
import { response, Response } from 'express';

@Controller('organization-user')
export class OrganizationUserController {
  constructor(
    private readonly organizationUserService: OrganizationUserService,
  ) {}

  /**
   * Creates a new organization user assignment.
   * @param createOrganizationUserDto - The data transfer object containing organization user details.
   * @returns A JSON response with the status and created organization user data.
   */
  @Post()
  async createOrganizationUser(
    @Body() createOrganizationUserDto: CreateOrganizationUserDto,
  ): Promise<{ message: string; newOrganizationUser: any }> {
    try {
      const newOrganizationUser =
        await this.organizationUserService.createOrganizationUser(
          createOrganizationUserDto,
        );
      return {
        message: 'OrganizationUser has been created successfully',
        newOrganizationUser,
      };
    } catch {
      throw new HttpException(
        {
          message: 'Error: OrganizationUser not created!',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Updates an existing organization user by ID.
   * @param organizationUserId - The ID of the organization user to update.
   * @param updateOrganizationUserDto - The data transfer object containing updated organization user details.
   * @returns A JSON response with the status and updated organization user data.
   */
  @Put('/:id')
  async updateOrganizationUser(
    @Param('id') organizationUserId: string,
    @Body() updateOrganizationUserDto: UpdateOrganizationUserDto,
  ) {
    try {
      const existingOrganizationUser =
        await this.organizationUserService.updateOrganizationUser(
          organizationUserId,
          updateOrganizationUserDto,
        );
      return {
        message: 'OrganizationUser has been updated successfully',
        existingOrganizationUser,
      };
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
   * Retrieves all organization users.
   * @returns An array of organization users.
   */
  @Get()
  async getOrganizationUsers(@Res() response: Response) {
    try {
      const organizationUserData =
        await this.organizationUserService.getAllOrganizationUsers();
      return response.status(HttpStatus.OK).json({
        message: 'All organizationUsers data found successfully',
        organizationUserData,
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
   * Retrieves an organization user by its ID.
   * @param organizationUserId - The ID of the organization user to retrieve.
   * @returns The organization user with the specified ID.
   */
  @Get('/:id')
  async getOrganizationUser(
    @Res() response: Response,
    @Param('id') organizationUserId: string,
  ) {
    try {
      const existingOrganizationUser =
        await this.organizationUserService.getOrganizationUser(
          organizationUserId,
        );
      return response.status(HttpStatus.OK).json({
        message: 'OrganizationUser found successfully',
        existingOrganizationUser,
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
   * Deletes an organization user by its ID.
   * @param organizationUserId - The ID of the organization user to delete.
   * @returns The deleted organization user.
   */
  @Delete('/:id')
  async deleteOrganizationUser(
    @Res() response: Response,
    @Param('id') organizationUserId: string,
  ) {
    try {
      const deletedOrganizationUser =
        await this.organizationUserService.deleteOrganizationUser(
          organizationUserId,
        );
      return response.status(HttpStatus.OK).json({
        message: 'OrganizationUser deleted successfully',
        deletedOrganizationUser,
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
