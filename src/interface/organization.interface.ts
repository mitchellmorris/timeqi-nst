import { Document, Types } from 'mongoose';
import { IOrganization as Organization } from '@betavc/timeqi-sh';

export type IOrganization = Organization &
  Document & {
    readonly sponsor: Types.ObjectId | null;
    readonly users: Types.ObjectId[];
    readonly timeOff: Types.ObjectId[];
    readonly projects: Types.ObjectId[];
  };
