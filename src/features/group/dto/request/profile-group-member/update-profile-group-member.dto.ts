import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileGroupMemberDto } from './create-profile-group-member.dto';

export class UpdateProfileGroupMemberDto extends PartialType(CreateProfileGroupMemberDto) {}
