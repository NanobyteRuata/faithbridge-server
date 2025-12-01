import { IsArray, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class RemoveGroupMembersDto {
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    profileIds: number[];
}