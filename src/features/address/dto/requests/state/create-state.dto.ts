import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @IsNumber()
  @IsOptional()
  organizationId?: number;
}