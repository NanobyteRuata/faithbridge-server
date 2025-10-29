import { PartialType } from '@nestjs/mapped-types';
import { CreateCityDto } from './city/create-city.dto';

export class UpdateCityDto extends PartialType(CreateCityDto) {}
