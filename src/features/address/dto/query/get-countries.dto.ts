import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';

export class GetCountriesDto extends PaginationDto {
  @IsOptional()
  organizationId?: number;
}
