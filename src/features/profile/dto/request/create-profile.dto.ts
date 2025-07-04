import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsNumber()
  membershipId?: number;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @IsOptional()
  @IsString()
  personalPhone?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  otherContact1Type?: string;

  @IsOptional()
  @IsString()
  otherContact1?: string;

  @IsOptional()
  @IsString()
  otherContact2Type?: string;

  @IsOptional()
  @IsString()
  otherContact2?: string;

  @IsOptional()
  @IsString()
  otherContact3Type?: string;

  @IsOptional()
  @IsString()
  otherContact3?: string;
}
