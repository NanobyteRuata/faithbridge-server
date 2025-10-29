import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class GetGroupTypesDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  organizationId?: number;
}
