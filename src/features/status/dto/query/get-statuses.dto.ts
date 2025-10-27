import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class GetStatusesDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  organizationId?: number;
}
