import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsString()
  street: string;

  @IsString()
  township: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsString()
  country: string;
}
