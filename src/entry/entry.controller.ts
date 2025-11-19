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
import { Response } from 'express';
import { EntryService } from './entry.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { UpdateEntryDto } from '../dto/update-entry.dto';

@Controller('entry')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}
  /**
   * Creates a new entry.
   * @param createEntryDto - The data transfer object containing entry details.
   * @returns A JSON response with the status and created entry data.
   */
  @Post()
  async createEntry(@Body() createEntryDto: CreateEntryDto) {
    try {
      const newEntry = await this.entryService.createEntry(createEntryDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Entry has been created successfully',
        newEntry,
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
   * Updates an existing entry by ID.
   * @param response - The response object to send the result.
   * @param entryId - The ID of the entry to update.
   * @param updateEntryDto - The data transfer object containing updated entry details.
   * @returns A JSON response with the status and updated entry data.
   */
  @Put('/:id')
  async updateEntry(
    @Res() response: Response,
    @Param('id') entryId: string,
    @Body() updateEntryDto: UpdateEntryDto,
  ) {
    try {
      const existingEntry = await this.entryService.updateEntry(
        entryId,
        updateEntryDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'Entry has been successfully updated',
        existingEntry,
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
   * Retrieves all entries.
   * @param response - The response object to send the result.
   * @returns A JSON response with the status and all entry data.
   */
  @Get()
  async getEntries(@Res() response: Response) {
    try {
      const entryData = await this.entryService.getAllEntries();
      return response.status(HttpStatus.OK).json({
        message: 'All entries data found successfully',
        entryData,
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
  @Get('/project/:projectId')
  async getProjectEntries(
    @Res() response: Response,
    @Param('projectId') projectId: string,
  ) {
    try {
      const entryData = await this.entryService.getProjectEntries(projectId);
      return response.status(HttpStatus.OK).json({
        message: 'All entries data found successfully',
        entryData,
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
   * Retrieves an entry by ID.
   * @param response - The response object to send the result.
   * @param entryId - The ID of the entry to retrieve.
   * @returns A JSON response with the status and found entry data.
   */
  @Get('/:id')
  async getEntry(@Res() response: Response, @Param('id') entryId: string) {
    try {
      const existingEntry = await this.entryService.getEntry(entryId);
      return response.status(HttpStatus.OK).json({
        message: 'Entry found successfully',
        existingEntry,
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
   * Deletes an entry by ID.
   * @param response - The response object to send the result.
   * @param entryId - The ID of the entry to delete.
   * @returns A JSON response with the status and deleted entry data.
   */
  @Delete('/:id')
  async deleteEntry(@Res() response: Response, @Param('id') entryId: string) {
    try {
      const deletedEntry = await this.entryService.deleteEntry(entryId);
      return response.status(HttpStatus.OK).json({
        message: 'Entry deleted successfully',
        deletedEntry,
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
