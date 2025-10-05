import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTimeOffDto } from './create-time-off.dto';
export class UpdateTimeOffDto extends PartialType(
  OmitType(CreateTimeOffDto, [
    // can't assign new target or type
    'target',
    'type',
  ] as const),
) {}
