import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsOptional()
  road?: string;

  @IsNumber()
  @IsOptional()
  townshipId?: number;

  @IsNumber()
  @IsOptional()
  cityId?: number;

  @IsNumber()
  @IsOptional()
  stateId?: number;

  @IsNumber()
  @IsOptional()
  countryId?: number;
}
