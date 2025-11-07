import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccessCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsOptional()
  @IsDate()
  expireDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
