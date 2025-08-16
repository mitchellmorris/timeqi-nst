import { Document, Types } from 'mongoose';
import { ITask as Task } from '@betavc/timeqi-sh';

export type ITask = Task &
  Document & {
    readonly project: Types.ObjectId;
    readonly assignee: Types.ObjectId;
    readonly organization: Types.ObjectId;
    readonly users: Types.ObjectId[];
    readonly entries: Types.ObjectId[];
  };
