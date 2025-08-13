import { Document } from 'mongoose';
export interface IProjectUser extends Document {
  readonly pitch: number;
  readonly fulfillment: number;
  readonly accuracy: number;
  readonly estimate: number;
  readonly hours: number;
  readonly weekdays: (
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  )[];
  readonly project: string; // ObjectId referencing Project
  readonly user: string; // ObjectId referencing User
}
