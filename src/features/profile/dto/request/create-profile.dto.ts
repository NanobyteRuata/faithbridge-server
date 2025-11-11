import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateAddressDto } from 'src/features/address/dto/requests/address/create-address.dto';
import { NullOrEmptyToUndefined } from 'src/shared/decorators/null-to-undefined.decorator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  lastName?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  nickName?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsNumber()
  membershipId?: number;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsNumber()
  statusId: number;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isPersonalEmailPublic?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isWorkEmailPublic?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isPersonalPhonePublic?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  personalPhone?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isHomePhonePublic?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  homePhone?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact1Public?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact1Type?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact1?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact2Public?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact2Type?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact2?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact3Public?: boolean;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact3Type?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsString()
  otherContact3?: string;

  @NullOrEmptyToUndefined()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProfileAddressDto)
  addresses?: CreateProfileAddressDto[];

  @IsOptional()
  @IsNumber()
  householdId?: number;

  @IsOptional()
  @IsNumber()
  groupId?: number;
}

export class CreateProfileAddressDto extends CreateAddressDto {
  // No additional fields needed for create
}
