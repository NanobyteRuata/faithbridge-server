import { PartialType } from '@nestjs/mapped-types';
import { CreateTownshipDto } from './township/create-township.dto';

export class UpdateTownshipDto extends PartialType(CreateTownshipDto) {}
