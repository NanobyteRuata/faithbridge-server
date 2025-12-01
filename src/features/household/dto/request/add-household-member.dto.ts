import { IsArray, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class AddHouseholdMembersDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  profileIds: number[];
}