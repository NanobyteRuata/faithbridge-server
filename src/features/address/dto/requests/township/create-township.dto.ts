import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTownshipDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @IsNumber()
  @IsOptional()
  organizationId?: number;
}