import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupRoleDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsNumber()
  @IsNotEmpty()
  groupTypeId: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
