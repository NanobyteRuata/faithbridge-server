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

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsNumber()
  membershipId?: number;

  @IsOptional()
  @IsNumber()
  statusId: number;

  @IsOptional()
  @IsBoolean()
  isPersonalEmailPublic?: boolean;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsBoolean()
  isWorkEmailPublic?: boolean;

  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @IsOptional()
  @IsBoolean()
  isPersonalPhonePublic?: boolean;

  @IsOptional()
  @IsString()
  personalPhone?: string;

  @IsOptional()
  @IsBoolean()
  isWorkPhonePublic?: boolean;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsBoolean()
  isOtherContact1Public?: boolean;

  @IsOptional()
  @IsString()
  otherContact1Type?: string;

  @IsOptional()
  @IsString()
  otherContact1?: string;

  @IsOptional()
  @IsBoolean()
  isOtherContact2Public?: boolean;

  @IsOptional()
  @IsString()
  otherContact2Type?: string;

  @IsOptional()
  @IsString()
  otherContact2?: string;

  @IsOptional()
  @IsBoolean()
  isOtherContact3Public?: boolean;

  @IsOptional()
  @IsString()
  otherContact3Type?: string;

  @IsOptional()
  @IsString()
  otherContact3?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProfileAddressDto)
  addresses?: CreateProfileAddressDto[];
}

export class CreateProfileAddressDto extends CreateAddressDto {
  // No additional fields needed for create
}
