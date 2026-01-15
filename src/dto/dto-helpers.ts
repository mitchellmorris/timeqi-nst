import { Types } from 'mongoose';

export const objectIdTrnfmr = ({ value }: { value: unknown }) =>
  value ? new Types.ObjectId(value as string) : value;

export const objectIdArrayTrnfmr = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value.map((v) => new Types.ObjectId(v as string))
    : value;
