import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileGroupDto } from './create-profile-group.dto';

export class UpdateProfileGroupDto extends PartialType(CreateProfileGroupDto) {}
