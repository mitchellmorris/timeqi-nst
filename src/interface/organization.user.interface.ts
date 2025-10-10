import { Document, Types } from 'mongoose';
import { IOrganizationUser as OrganizationUser } from '@betavc/timeqi-sh';
//TODO: Figure out why the Omit is necessary when it works fine for project.user
export type IOrganizationUser = Omit<
  OrganizationUser,
  'projects' | 'tasks' | 'entries'
> &
  Document & {
    readonly _id: Types.ObjectId;
    readonly user: Types.ObjectId;
    readonly organization: Types.ObjectId;
    readonly projects?: Types.ObjectId[];
    readonly tasks?: Types.ObjectId[];
    readonly entries?: Types.ObjectId[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
