import { Transform, Type } from 'class-transformer';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { toArray } from 'src/shared/util/to-array';

export class GetAddressesDto extends PaginationDto {
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
