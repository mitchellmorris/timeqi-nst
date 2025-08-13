import { Document, Types } from 'mongoose';

export interface ITimeOff extends Document {
  readonly name: string;
  readonly startDate: string; // ISO date string
  readonly days: number; // Number of days off
  readonly extendedHours: number; // Additional hours for the time off
  readonly updatedAt: Date; // Last updated date
  readonly target: Types.ObjectId; // ObjectId reference to any of the three collections
  readonly type: 'User' | 'Organization' | 'Project'; // The model name
}
