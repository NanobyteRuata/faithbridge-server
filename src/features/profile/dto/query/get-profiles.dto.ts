import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsArray, IsInt } from 'class-validator';

// Helper to transform single value or array to array
const toArray = ({ value }: { value: any }) => {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
};

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
}
