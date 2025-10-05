import { Document, Types } from 'mongoose';
import { IOrganization as OrganizationUser } from '@betavc/timeqi-sh';

export type IOrganizationUser = OrganizationUser &
  Document & {
    readonly user?: Types.ObjectId;
    readonly organization?: Types.ObjectId;
    readonly projects?: Types.ObjectId[];
    readonly entries?: Types.ObjectId[];
  };
