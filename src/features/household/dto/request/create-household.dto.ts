import { IsString, IsOptional, IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHouseholdDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  headProfileId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  addressId?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @IsInt({ each: true })
  @Type(() => Number)
  memberProfileIds?: number[];
}
