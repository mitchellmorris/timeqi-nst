import { Document } from 'mongoose';
export interface ITask extends Document {
  readonly name: string;
  readonly users: string[];
  readonly project: string;
  readonly organization: string;
}
