import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
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

  @IsNumber()
  statusId: number;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @IsOptional()
  @IsString()
  personalPhone?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  otherContact1Type?: string;

  @IsOptional()
  @IsString()
  otherContact1?: string;

  @IsOptional()
  @IsString()
  otherContact2Type?: string;

  @IsOptional()
  @IsString()
  otherContact2?: string;

  @IsOptional()
  @IsString()
  otherContact3Type?: string;

  @IsOptional()
  @IsString()
  otherContact3?: string;

  @IsOptional()
  @Type(() => CreateOrUpdateProfileAddressDto)
  @ValidateNested({ each: true })
  addresses?: CreateOrUpdateProfileAddressDto[];
}

export class CreateOrUpdateProfileAddressDto extends CreateAddressDto {
  @IsOptional()
  @IsNumber()
  id?: number;
}
