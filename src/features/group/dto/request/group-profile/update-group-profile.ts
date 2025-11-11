import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupProfileDto } from './create-group-profile';

export class UpdateGroupProfileDto extends PartialType(CreateGroupProfileDto) {}
