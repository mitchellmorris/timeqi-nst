import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { EntryService } from './entry.service';
import { CreateEntryDto } from 'src/dto/create-entry.dto';
import { UpdateEntryDto } from 'src/dto/update-entry.dto';

@Controller('entry')
export class EntryController {

  constructor(private readonly entryService: EntryService) { }
  /**
   * Creates a new entry.
   * @param response - The response object to send the result.
   * @param createEntryDto - The data transfer object containing entry details.
   * @returns A JSON response with the status and created entry data.
   */
  @Post()
  async createEntry(@Res() response, @Body() createEntryDto: CreateEntryDto) {
    try {
      const newEntry = await this.entryService.createEntry(createEntryDto);
      return response.status(HttpStatus.CREATED).json({
        message: 'Entry has been created successfully',
        newEntry,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Error: Entry not created!',
        error: 'Bad Request'
      });
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
  async updateEntry(@Res() response, @Param('id') entryId: string,
    @Body() updateEntryDto: UpdateEntryDto) {
    try {
      const existingEntry = await this.entryService.updateEntry(entryId, updateEntryDto);
      return response.status(HttpStatus.OK).json({
        message: 'Entry has been successfully updated',
        existingEntry,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
  /**
   * Retrieves all entries.
   * @param response - The response object to send the result.
   * @returns A JSON response with the status and all entry data.
   */
  @Get()
  async getEntrys(@Res() response) {
    try {
      const entryData = await this.entryService.getAllEntrys();
      return response.status(HttpStatus.OK).json({
        message: 'All entrys data found successfully', entryData,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
  /**
   * Retrieves an entry by ID.
   * @param response - The response object to send the result.
   * @param entryId - The ID of the entry to retrieve.
   * @returns A JSON response with the status and found entry data.
   */
  @Get('/:id')
  async getEntry(@Res() response, @Param('id') entryId: string) {
    try {
      const existingEntry = await this.entryService.getEntry(entryId);
      return response.status(HttpStatus.OK).json({
        message: 'Entry found successfully', existingEntry,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
  /**
   * Deletes an entry by ID.
   * @param response - The response object to send the result.
   * @param entryId - The ID of the entry to delete.
   * @returns A JSON response with the status and deleted entry data.
   */
  @Delete('/:id')
  async deleteEntry(@Res() response, @Param('id') entryId: string) {
    try {
      const deletedEntry = await this.entryService.deleteEntry(entryId);
      return response.status(HttpStatus.OK).json({
        message: 'Entry deleted successfully',
        deletedEntry,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
}
