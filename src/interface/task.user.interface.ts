import { Document, Types } from 'mongoose';
import { ITaskUser as TaskUser } from '@betavc/timeqi-sh';
//TODO: Figure out why the Omit is necessary when it works fine for project.user
export type ITaskUser = Omit<TaskUser, 'entries'> &
  Document & {
    readonly _id: Types.ObjectId;
    readonly user: Types.ObjectId;
    readonly task: Types.ObjectId;
    readonly organization: Types.ObjectId;
    readonly project: Types.ObjectId;
    readonly entries?: Types.ObjectId[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
