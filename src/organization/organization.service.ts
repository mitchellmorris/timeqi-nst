import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { IOrganization } from '../interface/organization.interface';
import { Model, Types } from 'mongoose';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { IUser } from '../interface/user.interface';
import {
  PROJECT_POPULATED_REQUEST_FIELDS,
  TIME_OFF_POPULATED_REQUEST_FIELDS,
  USER_POPULATED_REQUEST_FIELDS,
} from '@betavc/timeqi-sh';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel('Organization')
    private organizationModel: Model<IOrganization>,
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}
  /**
   * Creates a new organization in the database.
   * @param createOrganizationDto - The data transfer object containing organization details.
   * @returns The created organization.
   */
  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
    sponsor: Types.ObjectId,
  ): Promise<IOrganization> {
    const newOrganization = new this.organizationModel({
      ...createOrganizationDto,
      sponsor,
    });
    // Add organization to the user's organizations array
    await this.userModel.findByIdAndUpdate(sponsor, {
      $addToSet: { organizations: newOrganization._id },
    });
    return newOrganization.save();
  }
  /**
   * Updates an existing organization in the database.
   * @param organizationId - The ID of the organization to update.
   * @param updateOrganizationDto - The data transfer object containing updated organization details.
   * @returns The updated organization.
   */
  async updateOrganization(
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<IOrganization> {
    const existingOrganization = await this.organizationModel.findByIdAndUpdate(
      organizationId,
      updateOrganizationDto,
      { new: true },
    );
    if (!existingOrganization) {
      throw new NotFoundException(`Organization #${organizationId} not found`);
    }
    return existingOrganization;
  }
  /**
   * Retrieves all organizations from the database.
   * @returns An array of organizations.
   */
  async getAllOrganizations(): Promise<IOrganization[]> {
    const organizationData = await this.organizationModel.find();
    if (!organizationData || organizationData.length == 0) {
      throw new NotFoundException('Organizations data not found!');
    }
    return organizationData;
  }
  /**
   * Retrieves an organization by its ID.
   * @param organizationId - The ID of the organization to retrieve.
   * @returns The organization with the specified ID.
   */
  async getOrganization(organizationId: string): Promise<IOrganization> {
    const existingOrganization = await this.organizationModel
      .findById(organizationId)
      .populate({
        path: 'projects',
        select: PROJECT_POPULATED_REQUEST_FIELDS as string[],
      })
      .populate({
        path: 'timeOff',
        select: TIME_OFF_POPULATED_REQUEST_FIELDS as string[],
        populate: {
          path: 'users',
          select: USER_POPULATED_REQUEST_FIELDS as string[],
        },
      })
      .populate({
        path: 'users',
        select: USER_POPULATED_REQUEST_FIELDS as string[],
      })
      .exec();
    if (!existingOrganization) {
      throw new NotFoundException(`Organization #${organizationId} not found`);
    }
    return existingOrganization;
  }
  /**
   * Deletes an organization by its ID.
   * @param organizationId - The ID of the organization to delete.
   * @returns The deleted organization.
   */
  async deleteOrganization(organizationId: string): Promise<IOrganization> {
    const deletedOrganization =
      await this.organizationModel.findByIdAndDelete(organizationId);
    if (!deletedOrganization) {
      throw new NotFoundException(`Organization #${organizationId} not found`);
    }
    // Remove organization from the user's organizations array
    await this.userModel.findByIdAndUpdate(deletedOrganization.get('sponsor'), {
      $pull: { organizations: organizationId },
    });
    return deletedOrganization;
  }
}
