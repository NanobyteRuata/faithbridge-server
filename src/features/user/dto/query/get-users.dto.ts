import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetUsersDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
