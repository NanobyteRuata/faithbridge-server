import { IsArray, IsInt, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class AddGroupMembersDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  profileIds: number[];

  @IsOptional()
  @IsNumber()
  groupRoleId?: number;
}
