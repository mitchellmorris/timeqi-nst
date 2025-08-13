import { Document } from 'mongoose';
export interface IOrganization extends Document {
  readonly name: string;
  readonly hours: number;
  readonly weekdays: string[];
  readonly sponsor: string; // ObjectId referencing User
  readonly projects: string[]; // Array of ObjectIds referencing Project
  readonly users: string[]; // Array of ObjectIds referencing User
  readonly timeOff: string[]; // Array of ObjectIds referencing TimeOff
  // Note: The properties 'projects', 'users', and 'timeOff' are arrays
  // of ObjectIds referencing their respective documents.
}
