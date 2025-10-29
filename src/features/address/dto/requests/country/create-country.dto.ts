import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  organizationId?: number;
}