import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsArray, IsInt, IsBoolean } from 'class-validator';
import { toArray } from 'src/shared/util/to-array';

export class GetProfilesDto extends PaginationDto {
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  membershipIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  statusIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  townshipIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  cityIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  stateIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  countryIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  householdIds?: number[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  groupIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isUser?: boolean;
}
