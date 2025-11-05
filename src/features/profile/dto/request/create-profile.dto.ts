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
import { NullToUndefined } from 'src/shared/decorators/null-to-undefined.decorator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  lastName?: string;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  nickName?: string;

  @NullToUndefined()
  @IsOptional()
  @IsNumber()
  membershipId?: number;

  @NullToUndefined()
  @IsOptional()
  @IsNumber()
  statusId: number;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isPersonalEmailPublic?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isWorkEmailPublic?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isPersonalPhonePublic?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  personalPhone?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isHomePhonePublic?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  homePhone?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact1Public?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact1Type?: string;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact1?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact2Public?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact2Type?: string;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact2?: string;

  @NullToUndefined()
  @IsOptional()
  @IsBoolean()
  isOtherContact3Public?: boolean;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact3Type?: string;

  @NullToUndefined()
  @IsOptional()
  @IsString()
  otherContact3?: string;

  @NullToUndefined()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProfileAddressDto)
  addresses?: CreateProfileAddressDto[];
}

export class CreateProfileAddressDto extends CreateAddressDto {
  // No additional fields needed for create
}
