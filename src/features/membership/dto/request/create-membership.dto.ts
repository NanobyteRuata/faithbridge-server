import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
