import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ITask } from '../interface/task.interface';
import { Model } from 'mongoose';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { IProject } from '../interface/project.interface';
import { IUser } from '../interface/user.interface';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task') private taskModel: Model<ITask>,
    @InjectModel('Project') private projectModel: Model<IProject>,
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}
  /**
   * Creates a new task in the database.
   * @param createTaskDto - The data transfer object containing task details.
   * @returns The created task.
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<ITask> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      users: [createTaskDto.assignee], // initialize users array with assignee
    });
    return newTask.save();
  }
  /**
   * Updates an existing task in the database.
   * @param taskId - The ID of the task to update.
   * @param updateTaskDto - The data transfer object containing updated task details.
   * @returns The updated task.
   */
  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<ITask> {
    const existingTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      updateTaskDto,
      { new: true },
    );
    if (!existingTask) {
      throw new NotFoundException(`Task #${taskId} not found`);
    }
    return existingTask;
  }
  /**
   * Retrieves all tasks from the database.
   * @returns An array of tasks.
   */
  async getAllTasks(): Promise<ITask[]> {
    const taskData = await this.taskModel.find();
    if (!taskData || taskData.length == 0) {
      throw new NotFoundException('Tasks data not found!');
    }
    return taskData;
  }
  /**
   * Retrieves a task by its ID.
   * @param taskId - The ID of the task to retrieve.
   * @returns The task with the specified ID.
   */
  async getTask(taskId: string): Promise<ITask> {
    const existingTask = await this.taskModel
      .findById(taskId)
      .populate({
        path: 'entries',
        select: '_id name',
        populate: {
          path: 'performer',
          select: '_id name',
        },
      })
      .exec();
    if (!existingTask) {
      throw new NotFoundException(`Task #${taskId} not found`);
    }
    return existingTask;
  }
  /**
   * Deletes an task by its ID.
   * @param taskId - The ID of the task to delete.
   * @returns The deleted task.
   */
  async deleteTask(taskId: string): Promise<ITask> {
    const deletedTask = await this.taskModel.findByIdAndDelete(taskId);
    if (!deletedTask) {
      throw new NotFoundException(`Task #${taskId} not found`);
    }
    return deletedTask;
  }
}
