import { Document, Types } from 'mongoose';

export interface IOrganizationUser extends Document {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
