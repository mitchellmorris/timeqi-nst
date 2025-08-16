import { Document, Types } from 'mongoose';
import { IProjectUser as ProjectUser } from '@betavc/timeqi-sh';

export type IProjectUser = ProjectUser &
  Document & {
    readonly user: Types.ObjectId;
    readonly project: Types.ObjectId;
  };
