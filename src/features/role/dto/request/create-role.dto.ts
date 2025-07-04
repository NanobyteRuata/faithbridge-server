import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  permissions: number[];
}
