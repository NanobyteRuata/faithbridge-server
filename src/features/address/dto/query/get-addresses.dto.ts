import { IsOptional, IsNumber, IsArray } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';

export class GetAddressesDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsArray()
  townshipIds?: number[];

  @IsOptional()
  @IsNumber()
  @IsArray()
  cityIds?: number[];

  @IsOptional()
  @IsNumber()
  @IsArray()
  stateIds?: number[];

  @IsOptional()
  @IsNumber()
  @IsArray()
  countryIds?: number[];
}
