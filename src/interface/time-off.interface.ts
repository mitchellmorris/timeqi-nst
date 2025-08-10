import { Document, Types } from 'mongoose';

export interface ITimeOff extends Document {
  readonly name: string;
  readonly target: Types.ObjectId; // ObjectId reference to any of the three collections
  readonly type: 'User' | 'Organization' | 'Project'; // The model name
}
