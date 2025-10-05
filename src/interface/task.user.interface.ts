import { Document, Types } from 'mongoose';
import { ITask as Task } from '@betavc/timeqi-sh';

export type ITask = Task &
  Document & {
    readonly user?: Types.ObjectId;
    readonly organization?: Types.ObjectId;
    readonly project?: Types.ObjectId;
    readonly task?: Types.ObjectId;
    readonly entries?: Types.ObjectId[];
  };
