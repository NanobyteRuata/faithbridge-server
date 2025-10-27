import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStatusDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
