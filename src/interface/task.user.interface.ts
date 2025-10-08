import { Document, Types } from 'mongoose';

export interface ITaskUser extends Document {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  project: Types.ObjectId;
  task: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
