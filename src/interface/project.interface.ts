import { Document } from 'mongoose';
export interface IProject extends Document {
  readonly name: string;
  readonly description: string;
  readonly startDate: Date;
  readonly pitch: number;
  readonly fulfillment: number;
  readonly accuracy: number;
  readonly estimate: number;
  readonly updatedAt: Date;
  readonly sponsor: string; // ObjectId referencing User
  readonly organization: string; // ObjectId referencing Organization
  readonly tasks: string[]; // Array of ObjectIds referencing Task
  readonly users: string[]; // Array of ObjectIds referencing User
  readonly timeOff: string[]; // Array of ObjectIds referencing TimeOff
}
