import {
  Body,
  Controller,
  Delete,
  Get,
  // Delete,
  // Get,
  HttpException,
  HttpStatus,
  Param,
  // Param,
  Post,
  Put,
  Res,
  // Put,
  // Res,
} from '@nestjs/common';
import { TimeOffService } from './time-off.service';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';
// import { UpdateTimeOffDto } from '../dto/update-time-off.dto';
import { Response } from 'express';
import { UpdateTimeOffDto } from '../dto/update-time-off.dto';

@Controller('time-off')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}
  /**
   * Creates a new time off.
   * @param response - The response object to send the result.
   * @param createOrganizationDto - The data transfer object containing time off details.
   * @returns A JSON response with the status and created time off data.
   */
  @Post()
  async createTimeOff(
    @Body() createTimeOffDto: CreateTimeOffDto,
  ): Promise<{ message: string; newTimeOff: any }> {
    try {
      const newTimeOff =
        await this.timeOffService.createTimeOff(createTimeOffDto);
      return {
        message: 'Time off has been created successfully',
        newTimeOff,
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
  async updateTimeOff(
    @Res() response: Response,
    @Param('id') timeOffId: string,
    @Body() updateTimeOffDto: UpdateTimeOffDto,
  ) {
    try {
      const existingTimeOff = await this.timeOffService.updateTimeOff(
        timeOffId,
        updateTimeOffDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'Time off has been successfully updated',
        existingTimeOff,
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
  async getTimeAllOff(@Res() response: Response) {
    try {
      const timeOffData = await this.timeOffService.getAllTimeOffs();
      return response.status(HttpStatus.OK).json({
        message: 'All time off data found successfully',
        timeOffData,
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
  async getTimeOff(@Res() response: Response, @Param('id') timeOffId: string) {
    try {
      const existingTimeOff = await this.timeOffService.getTimeOff(timeOffId);
      return response.status(HttpStatus.OK).json({
        message: 'Time off found successfully',
        existingTimeOff,
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
  async deleteTimeOff(
    @Res() response: Response,
    @Param('id') timeOffId: string,
  ) {
    try {
      const deletedTimeOff = await this.timeOffService.deleteTimeOff(timeOffId);
      return response.status(HttpStatus.OK).json({
        message: 'Time off deleted successfully',
        deletedTimeOff,
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
