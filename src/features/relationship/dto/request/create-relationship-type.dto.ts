import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRelationshipTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  inverseRelationshipTypeId?: number;
}
