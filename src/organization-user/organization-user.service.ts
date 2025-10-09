import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrganizationUser } from '../interface/organization.user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrganizationUserDto } from '../dto/create-organization.user.dto';
import { UpdateOrganizationUserDto } from '../dto/update-organization.user.dto';
import { IUser } from '../interface/user.interface';
import { IOrganization } from '../interface/organization.interface';

@Injectable()
export class OrganizationUserService {
  constructor(
    @InjectModel('OrganizationUser')
    private readonly organizationUserModel: Model<IOrganizationUser>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Organization')
    private organizationModel: Model<IOrganization>,
  ) {}

  /**
   * Creates a new organization user assignment in the database.
   * @param createOrganizationUserDto - The data transfer object containing organization user details.
   * @returns The created organization user.
   */
  async createOrganizationUser(
    createOrganizationUserDto: CreateOrganizationUserDto,
  ): Promise<IOrganizationUser> {
    const newOrganizationUser = new this.organizationUserModel({
      ...createOrganizationUserDto,
    });

    // Add organization to the user's organizations array
    await this.userModel.findByIdAndUpdate(createOrganizationUserDto.user, {
      $addToSet: { organizations: newOrganizationUser.organization },
    });

    // Add user to the organization's users array (via virtual)
    // Note: Organization uses virtual field for users, so no direct update needed

    return newOrganizationUser.save();
  }

  /**
   * Updates an existing organization user in the database.
   * @param organizationUserId - The ID of the organization user to update.
   * @param updateOrganizationUserDto - The data transfer object containing updated organization user details.
   * @returns The updated organization user.
   */
  async updateOrganizationUser(
    organizationUserId: string,
    updateOrganizationUserDto: UpdateOrganizationUserDto,
  ): Promise<IOrganizationUser> {
    const existingOrganizationUser =
      await this.organizationUserModel.findByIdAndUpdate(
        organizationUserId,
        updateOrganizationUserDto,
        { new: true },
      );
    if (!existingOrganizationUser) {
      throw new NotFoundException('OrganizationUser not found');
    }
    return existingOrganizationUser;
  }

  /**
   * Retrieves all organization users from the database.
   * @returns An array of organization users.
   */
  async getAllOrganizationUsers(): Promise<IOrganizationUser[]> {
    const organizationUserData = await this.organizationUserModel
      .find()
      .populate('organization', 'name')
      .populate('user', 'name email');

    if (!organizationUserData || organizationUserData.length == 0) {
      throw new NotFoundException('OrganizationUsers data not found!');
    }
    return organizationUserData;
  }

  /**
   * Retrieves an organization user by its ID.
   * @param organizationUserId - The ID of the organization user to retrieve.
   * @returns The organization user with the specified ID.
   */
  async getOrganizationUser(
    organizationUserId: string,
  ): Promise<IOrganizationUser> {
    const existingOrganizationUser = await this.organizationUserModel
      .findById(organizationUserId)
      .populate('organization', 'name')
      .populate('user', 'name email');

    if (!existingOrganizationUser) {
      throw new NotFoundException(
        `OrganizationUser #${organizationUserId} not found`,
      );
    }
    return existingOrganizationUser;
  }

  /**
   * Deletes an organization user by its ID.
   * @param organizationUserId - The ID of the organization user to delete.
   * @returns The deleted organization user.
   */
  async deleteOrganizationUser(
    organizationUserId: string,
  ): Promise<IOrganizationUser> {
    const deletedOrganizationUser =
      await this.organizationUserModel.findByIdAndDelete(organizationUserId);
    if (!deletedOrganizationUser) {
      throw new NotFoundException(
        `OrganizationUser #${organizationUserId} not found`,
      );
    }

    // Remove organization from the user's organizations array
    await this.userModel.findByIdAndUpdate(deletedOrganizationUser.user, {
      $pull: { organizations: deletedOrganizationUser.organization },
    });

    return deletedOrganizationUser;
  }
}
