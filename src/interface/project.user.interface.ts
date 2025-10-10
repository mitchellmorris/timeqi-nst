import { Document, Types } from 'mongoose';
import { IProjectUser as ProjectUser } from '@betavc/timeqi-sh';

export type IProjectUser = ProjectUser &
  Document & {
    readonly _id: Types.ObjectId;
    readonly user: Types.ObjectId;
    readonly project: Types.ObjectId;
    readonly organization?: Types.ObjectId;
    readonly tasks?: Types.ObjectId[];
    readonly entries?: Types.ObjectId[];
  };
