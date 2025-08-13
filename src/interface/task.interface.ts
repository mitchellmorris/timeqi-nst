import { Document } from 'mongoose';
export interface ITask extends Document {
  readonly name: string;
  readonly pitch: number;
  readonly estimate: number;
  readonly updatedAt: Date;
  readonly assignee: string; // ObjectId referencing User
  readonly users: string[];
  readonly project: string;
  readonly organization: string;
  readonly entries: string[]; // Array of ObjectIds referencing TimeEntry
}
