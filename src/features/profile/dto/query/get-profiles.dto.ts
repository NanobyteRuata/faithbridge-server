import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class GetProfilesDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  membershipIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  statusIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  townshipIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stateIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  countryIds?: number[];
}
