import { Document } from 'mongoose';
export interface IEntry extends Document {
  readonly name: string;
  readonly task: string;
}
