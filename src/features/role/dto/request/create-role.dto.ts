import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNumber()
  @IsNotEmpty()
  permissions: number[];
}
