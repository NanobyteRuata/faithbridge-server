import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsOptional()
  @IsArray()
  @IsNumber()
  emailIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber()
  phoneIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber()
  addressIds?: number[];
}
