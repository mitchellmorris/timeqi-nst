import { Document, Types } from 'mongoose';
import { ITimeOff as TimeOff } from '@betavc/timeqi-sh';

export type ITimeOff = TimeOff &
  Document & {
    readonly target: Types.ObjectId;
  };
