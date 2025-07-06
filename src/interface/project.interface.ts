import { Document } from 'mongoose';
export interface IProject extends Document {
  readonly name: string;
}
