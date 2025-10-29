import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProfileGroupDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  groupTypeId: number;
}
