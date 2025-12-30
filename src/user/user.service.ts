import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from '../interface/user.interface';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}
  /**
   * Creates a new user in the database.
   * @param createUserDto - The data transfer object containing user details.
   * @returns The created user.
   */
  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }
  /**
   * Updates an existing user in the database.
   * @param userId - The ID of the user to update.
   * @param updateUserDto - The data transfer object containing updated user details.
   * @returns The updated user.
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IUser> {
    const existingUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true },
    );
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }
  /**
   * Retrieves all users from the database.
   * @returns An array of users.
   */
  async getAllUsers(): Promise<IUser[]> {
    const userData = await this.userModel.find();
    if (!userData || userData.length == 0) {
      throw new NotFoundException('Users data not found!');
    }
    return userData;
  }
  /**
   * Retrieves a user by their ID.
   * @param userId - The ID of the user to retrieve.
   * @returns The user with the specified ID.
   */
  async getUser(userId: string): Promise<IUser> {
    const existingUser = await this.userModel
      .findById(userId)
      .select('-password -projects -tasks')
      .populate({
        path: 'organizations',
        select: '_id name sponsor',
      })
      .exec();
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }

  findOneByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }
  /**
   * Deletes a user by their ID.
   * @param userId - The ID of the user to delete.
   * @returns The deleted user.
   */
  async deleteUser(userId: string): Promise<IUser> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return deletedUser;
  }
}
