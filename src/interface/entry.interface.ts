import { Document, Types } from 'mongoose';
import { IEntry as Entry } from '@betavc/timeqi-sh';

export type IEntry = Entry &
  Document & {
    readonly organization: Types.ObjectId;
    readonly project: Types.ObjectId;
    readonly performer: Types.ObjectId;
    readonly task: Types.ObjectId;
  };
