import { Document, Types } from 'mongoose';
import { IUser as User } from '@betavc/timeqi-sh';

export type IUser = User &
  Document & {
    readonly organization: Types.ObjectId;
  };
