import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  addressId?: number;

  @IsOptional()
  @IsInt()
  headProfileId?: number;

  @IsOptional()
  @IsInt()
  profileIds?: number[];
}
