import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';

export class GetAccessCodesDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  organizationId?: number;
}
