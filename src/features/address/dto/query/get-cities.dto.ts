import { IsOptional, IsNumber } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Type } from 'class-transformer';

export class GetCitiesDto extends PaginationDto {
  @IsOptional()
  organizationId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stateId?: number;
}
