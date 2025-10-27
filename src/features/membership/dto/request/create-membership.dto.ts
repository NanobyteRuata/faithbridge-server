import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMembershipDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
