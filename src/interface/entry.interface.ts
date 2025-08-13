import { Document } from 'mongoose';
export interface IEntry extends Document {
  readonly name: string;
  readonly description: string;
  readonly date: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly performer: string; // ObjectId referencing User
  readonly project: string; // ObjectId referencing Project
  readonly organization: string; // ObjectId referencing Organization
  readonly task: string;
}
