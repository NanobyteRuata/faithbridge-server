import { AccessCode } from '@prisma/client';
import { Omit } from '@prisma/client/runtime/library';

export type AccessCodeResponseDto = Omit<AccessCode, 'hashedCode'>;
