import {
  Injectable,
  NotFoundException,
  // NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';
import { ITimeOff } from '../interface/time-off.interface';
import { Model } from 'mongoose';
// import { UpdateTimeOffDto } from '../dto/update-time-off.dto';
import { IUser } from '../interface/user.interface';
import { UpdateTimeOffDto } from '../dto/update-time-off.dto';

@Injectable()
export class TimeOffService {
  constructor(
    @InjectModel('TimeOff')
    private timeOffModel: Model<ITimeOff>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Organization') private organizationModel: Model<IUser>,
    @InjectModel('Project') private projectModel: Model<IUser>,
  ) {}
  /**
   * Creates a new time off in the database.
   * @param createTimeOffDto - The data transfer object containing time off details.
   * @returns The created time off.
   */
  async createTimeOff(createTimeOffDto: CreateTimeOffDto): Promise<ITimeOff> {
    const newTimeOff = new this.timeOffModel(createTimeOffDto);
    return newTimeOff.save();
  }
  /**
   * Updates an existing time off in the database.
   * @param timeOffId - The ID of the time off to update.
   * @param updateTimeOffDto - The data transfer object containing updated time off details.
   * @returns The updated time off.
   */
  async updateTimeOff(
    timeOffId: string,
    updateTimeOffDto: UpdateTimeOffDto,
  ): Promise<ITimeOff> {
    // Fetch the existing time off
    const currentTimeOff = await this.timeOffModel.findById(timeOffId);
    if (!currentTimeOff) {
      throw new NotFoundException(`TimeOff #${timeOffId} not found`);
    }

    // Update the time off document
    const existingTimeOff = await this.timeOffModel.findByIdAndUpdate(
      timeOffId,
      updateTimeOffDto,
      { new: true },
    );
    if (!existingTimeOff) {
      throw new NotFoundException(`TimeOff #${timeOffId} not found`);
    }
    return existingTimeOff;
  }

  /**
   * Retrieves all timeOffs from the database.
   * @returns An array of time off.
   */
  async getAllTimeOffs(): Promise<ITimeOff[]> {
    const timeOffData = await this.timeOffModel.find();
    if (!timeOffData || timeOffData.length == 0) {
      throw new NotFoundException('TimeOffs data not found!');
    }
    return timeOffData;
  }
  /**
   * Retrieves an time off by its ID.
   * @param timeOffId - The ID of the time off to retrieve.
   * @returns The time off with the specified ID.
   */
  async getTimeOff(timeOffId: string): Promise<ITimeOff> {
    const timeOff = await this.timeOffModel.findById(timeOffId).exec();
    if (!timeOff) {
      throw new NotFoundException(`TimeOff #${timeOffId} not found`);
    }

    let existingTimeOff: ITimeOff | null = null;
    switch (timeOff.type) {
      case 'Organization':
        existingTimeOff = await this.timeOffModel
          .findById(timeOffId)
          .populate({
            path: 'target',
            select: '_id name',
            model: 'Organization',
          })
          .exec();
        break;
      case 'Project':
        existingTimeOff = await this.timeOffModel
          .findById(timeOffId)
          .populate({
            path: 'target',
            select: '_id name',
            model: 'Project',
          })
          .exec();
        break;
      case 'Task':
        existingTimeOff = await this.timeOffModel
          .findById(timeOffId)
          .populate({
            path: 'target',
            select: '_id name',
            model: 'Task',
          })
          .exec();
        break;
      default:
        existingTimeOff = timeOff;
    }
    return existingTimeOff as ITimeOff;
  }
  /**
   * Deletes a time off by its ID.
   * @param timeOffId - The ID of the time off to delete.
   * @returns The deleted time off.
   */
  async deleteTimeOff(timeOffId: string): Promise<ITimeOff> {
    const deletedTimeOff = await this.timeOffModel.findByIdAndDelete(timeOffId);
    if (!deletedTimeOff) {
      throw new NotFoundException(`TimeOff #${timeOffId} not found`);
    }
    return deletedTimeOff;
  }
}
