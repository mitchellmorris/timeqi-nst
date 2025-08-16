import { Document, Types } from 'mongoose';
import { IProject as Project } from '@betavc/timeqi-sh';

export type IProject = Project &
  Document & {
    readonly organization: Types.ObjectId;
    readonly users: Types.ObjectId[];
    readonly sponsor: Types.ObjectId;
    readonly timeOff: Types.ObjectId[];
    readonly tasks: Types.ObjectId[];
  };
