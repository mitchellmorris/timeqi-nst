import { Document, Types } from 'mongoose';
import { ITask as Task } from '@betavc/timeqi-sh';

export type ITask = Task &
  Document & {
    readonly assignee?: Types.ObjectId;
    readonly sponsor?: Types.ObjectId;
    readonly taskUser?: Types.ObjectId;
    readonly organization?: Types.ObjectId;
    readonly project?: Types.ObjectId;
    readonly users?: Types.ObjectId[];
    readonly entries?: Types.ObjectId[];
    readonly timeOff?: Types.ObjectId[];
  };
