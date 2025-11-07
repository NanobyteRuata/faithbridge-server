import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsBoolean()
  @IsOptional()
  isOwner?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isUserRole: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  permissions: number[];
}
