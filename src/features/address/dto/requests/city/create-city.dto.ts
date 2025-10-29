import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @IsNumber()
  @IsOptional()
  organizationId?: number;
}