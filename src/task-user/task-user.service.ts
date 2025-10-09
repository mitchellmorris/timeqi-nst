import { Injectable, NotFoundException } from '@nestjs/common';
import { ITaskUser } from '../interface/task.user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskUserDto } from '../dto/create-task.user';
import { UpdateTaskUserDto } from '../dto/update-task.user.dto';
import { IUser } from '../interface/user.interface';
import { ITask } from '../interface/task.interface';

@Injectable()
export class TaskUserService {
  constructor(
    @InjectModel('TaskUser')
    private readonly taskUserModel: Model<ITaskUser>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Task') private taskModel: Model<ITask>,
  ) {}

  /**
   * Creates a new task user assignment in the database.
   * @param createTaskUserDto - The data transfer object containing task user details.
   * @returns The created task user.
   */
  async createTaskUser(
    createTaskUserDto: CreateTaskUserDto,
  ): Promise<ITaskUser> {
    const newTaskUser = new this.taskUserModel({
      ...createTaskUserDto,
    });

    // Add task to the user's tasks array
    await this.userModel.findByIdAndUpdate(createTaskUserDto.user, {
      $addToSet: { tasks: newTaskUser.task },
    });

    // Add user to the task's users array (if the task schema has users array)
    await this.taskModel.findByIdAndUpdate(newTaskUser.task, {
      $addToSet: { users: createTaskUserDto.user },
    });

    return newTaskUser.save();
  }

  /**
   * Updates an existing task user in the database.
   * @param taskUserId - The ID of the task user to update.
   * @param updateTaskUserDto - The data transfer object containing updated task user details.
   * @returns The updated task user.
   */
  async updateTaskUser(
    taskUserId: string,
    updateTaskUserDto: UpdateTaskUserDto,
  ): Promise<ITaskUser> {
    const existingTaskUser = await this.taskUserModel.findByIdAndUpdate(
      taskUserId,
      updateTaskUserDto,
      { new: true },
    );
    if (!existingTaskUser) {
      throw new NotFoundException('TaskUser not found');
    }
    return existingTaskUser;
  }

  /**
   * Retrieves all task users from the database.
   * @returns An array of task users.
   */
  async getAllTaskUsers(): Promise<ITaskUser[]> {
    const taskUserData = await this.taskUserModel
      .find()
      .populate('organization', 'name')
      .populate('project', 'name')
      .populate('task', 'name')
      .populate('user', 'name email');

    if (!taskUserData || taskUserData.length == 0) {
      throw new NotFoundException('TaskUsers data not found!');
    }
    return taskUserData;
  }

  /**
   * Retrieves a task user by its ID.
   * @param taskUserId - The ID of the task user to retrieve.
   * @returns The task user with the specified ID.
   */
  async getTaskUser(taskUserId: string): Promise<ITaskUser> {
    const existingTaskUser = await this.taskUserModel
      .findById(taskUserId)
      .populate('organization', 'name')
      .populate('project', 'name')
      .populate('task', 'name')
      .populate('user', 'name email');

    if (!existingTaskUser) {
      throw new NotFoundException(`TaskUser #${taskUserId} not found`);
    }
    return existingTaskUser;
  }

  /**
   * Deletes a task user by its ID.
   * @param taskUserId - The ID of the task user to delete.
   * @returns The deleted task user.
   */
  async deleteTaskUser(taskUserId: string): Promise<ITaskUser> {
    const deletedTaskUser =
      await this.taskUserModel.findByIdAndDelete(taskUserId);
    if (!deletedTaskUser) {
      throw new NotFoundException(`TaskUser #${taskUserId} not found`);
    }

    // Remove task from the user's tasks array
    await this.userModel.findByIdAndUpdate(deletedTaskUser.user, {
      $pull: { tasks: deletedTaskUser.task },
    });

    // Remove user from the task's users array
    await this.taskModel.findByIdAndUpdate(deletedTaskUser.task, {
      $pull: { users: deletedTaskUser.user },
    });

    return deletedTaskUser;
  }
}
