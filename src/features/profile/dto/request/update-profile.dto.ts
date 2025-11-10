import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from 'src/features/address/dto/requests/address/create-address.dto';
import { NullOrEmptyToUndefined } from 'src/shared/decorators/null-to-undefined.decorator';

export class UpdateProfileDto extends OmitType(PartialType(CreateProfileDto), ['addresses'] as const) {
  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProfileAddressDto)
  addresses?: UpdateProfileAddressDto[];
}

export class UpdateProfileAddressDto extends CreateAddressDto {
  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsNumber()
  id?: number; // If id exists, update; if no id, create; if existing id not in array, delete
}
