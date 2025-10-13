import { IsString } from "class-validator";

export class AccessCodeLoginDto {
  @IsString()
  accessCode: string;

  @IsString()
  organizationCode: string;
}