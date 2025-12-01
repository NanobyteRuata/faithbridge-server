import { Type } from "class-transformer";
import { IsArray, IsInt } from "class-validator";

export class RemoveHouseholdMembersDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  profileIds: number[];
}
