import { PartialType } from '@nestjs/mapped-types';
import { CreateTownshipDto } from './create-township.dto';

export class UpdateTownshipDto extends PartialType(CreateTownshipDto) {}
