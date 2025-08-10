import {
  Injectable,
  NotFoundException,
  // NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTimeOffDto } from 'src/dto/create-time-off.dto';
import { ITimeOff } from 'src/interface/time-off.interface';
import { Model } from 'mongoose';
// import { UpdateTimeOffDto } from 'src/dto/update-time-off.dto';
import { IUser } from 'src/interface/user.interface';
import { UpdateTimeOffDto } from 'src/dto/update-time-off.dto';

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
    switch (createTimeOffDto.type) {
      case 'User':
        // Add time off to the user's time offs array
        await this.userModel.findByIdAndUpdate(createTimeOffDto.target, {
          $addToSet: { timeOff: newTimeOff._id },
        });
        break;
      case 'Organization':
        // Add time off to the organization's time offs array
        await this.organizationModel.findByIdAndUpdate(
          createTimeOffDto.target,
          {
            $addToSet: { timeOff: newTimeOff._id },
          },
        );
        break;
      case 'Project':
        // Add time off to the project's time offs array
        await this.projectModel.findByIdAndUpdate(createTimeOffDto.target, {
          $addToSet: { timeOff: newTimeOff._id },
        });
        break;
    }
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

    // Check if type or target changed
    const typeChanged =
      updateTimeOffDto.type &&
      updateTimeOffDto.type !== currentTimeOff.get('type');
    const targetChanged =
      updateTimeOffDto.target &&
      updateTimeOffDto.target !== currentTimeOff.get('target');

    if (typeChanged || targetChanged) {
      // Remove from old type set
      switch (currentTimeOff.get('type')) {
        case 'User':
          await this.userModel.findByIdAndUpdate(currentTimeOff.get('target'), {
            $pull: { timeOff: currentTimeOff._id },
          });
          break;
        case 'Organization':
          await this.organizationModel.findByIdAndUpdate(
            currentTimeOff.get('target'),
            {
              $pull: { timeOff: currentTimeOff._id },
            },
          );
          break;
        case 'Project':
          await this.projectModel.findByIdAndUpdate(
            currentTimeOff.get('target'),
            {
              $pull: { timeOff: currentTimeOff._id },
            },
          );
          break;
      }
      // Add to new type set
      const newType: ITimeOff['type'] =
        updateTimeOffDto.type || currentTimeOff.get('type');
      const newTarget = updateTimeOffDto.target || currentTimeOff.get('target');
      switch (newType) {
        case 'User':
          await this.userModel.findByIdAndUpdate(newTarget, {
            $addToSet: { timeOff: currentTimeOff._id },
          });
          break;
        case 'Organization':
          await this.organizationModel.findByIdAndUpdate(newTarget, {
            $addToSet: { timeOff: currentTimeOff._id },
          });
          break;
        case 'Project':
          await this.projectModel.findByIdAndUpdate(newTarget, {
            $addToSet: { timeOff: currentTimeOff._id },
          });
          break;
      }
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
      case 'User':
        existingTimeOff = await this.timeOffModel
          .findById(timeOffId)
          .populate({
            path: 'target',
            select: '_id name',
            model: 'User',
          })
          .exec();
        break;
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
      default:
        existingTimeOff = timeOff;
    }
    if (!existingTimeOff) {
      throw new NotFoundException(`TimeOff #${timeOffId} not found`);
    }
    return existingTimeOff;
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

    // Remove time off from the corresponding type's set
    switch (deletedTimeOff.get('type')) {
      case 'User':
        await this.userModel.findByIdAndUpdate(deletedTimeOff.get('target'), {
          $pull: { timeOff: timeOffId },
        });
        break;
      case 'Organization':
        await this.organizationModel.findByIdAndUpdate(
          deletedTimeOff.get('target'),
          {
            $pull: { timeOff: timeOffId },
          },
        );
        break;
      case 'Project':
        await this.projectModel.findByIdAndUpdate(
          deletedTimeOff.get('target'),
          {
            $pull: { timeOff: timeOffId },
          },
        );
        break;
    }

    return deletedTimeOff;
  }
}
