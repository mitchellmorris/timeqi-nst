import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { IEntry } from '../interface/entry.interface';
import { Model, Types } from 'mongoose';
import { UpdateEntryDto } from '../dto/update-entry.dto';
import { ITask } from '../interface/task.interface';

@Injectable()
export class EntryService {
  constructor(
    @InjectModel('Entry') private entryModel: Model<IEntry>,
    @InjectModel('Task') private taskModel: Model<ITask>,
  ) {}
  /**
   * Creates a new entry in the database.
   * @param createEntryDto - The data transfer object containing entry details.
   * @returns The created entry.
   */
  async createEntry(createEntryDto: CreateEntryDto): Promise<IEntry> {
    const newEntry = new this.entryModel(createEntryDto);
    return newEntry.save();
  }
  /**
   * Updates an existing entry in the database.
   * @param entryId - The ID of the entry to update.
   * @param updateEntryDto - The data transfer object containing updated entry details.
   * @returns The updated entry.
   */
  async updateEntry(
    entryId: string,
    updateEntryDto: UpdateEntryDto,
  ): Promise<IEntry> {
    const existingEntry = await this.entryModel.findByIdAndUpdate(
      entryId,
      updateEntryDto,
      { new: true },
    );
    if (!existingEntry) {
      throw new NotFoundException(`Entry #${entryId} not found`);
    }
    return existingEntry;
  }
  /**
   * Retrieves all entrys from the database.
   * @returns An array of entrys.
   */
  async getAllEntrys(): Promise<IEntry[]> {
    const entryData = await this.entryModel.find();
    if (!entryData || entryData.length == 0) {
      throw new NotFoundException('Entrys data not found!');
    }
    return entryData;
  }
  /**
   * Retrieves all entrys from the database.
   * @returns An array of entrys.
   */
  async getProjectEntries(projectId: string): Promise<IEntry[]> {
    const entryData = await this.entryModel.find({
      project: new Types.ObjectId(projectId),
    });
    if (!entryData || entryData.length == 0) {
      throw new NotFoundException(
        `Entrys data for project ${projectId} not found!`,
      );
    }
    return entryData;
  }
  /**
   * Retrieves an entry by its ID.
   * @param entryId - The ID of the entry to retrieve.
   * @returns The entry with the specified ID.
   */
  async getEntry(entryId: string): Promise<IEntry> {
    const existingEntry = await this.entryModel.findById(entryId).exec();
    if (!existingEntry) {
      throw new NotFoundException(`Entry #${entryId} not found`);
    }
    return existingEntry;
  }
  /**
   * Deletes an entry by its ID.
   * @param entryId - The ID of the entry to delete.
   * @returns The deleted entry.
   */
  async deleteEntry(entryId: string): Promise<IEntry> {
    const deletedEntry = await this.entryModel.findByIdAndDelete(entryId);
    if (!deletedEntry) {
      throw new NotFoundException(`Entry #${entryId} not found`);
    }
    return deletedEntry;
  }
}
