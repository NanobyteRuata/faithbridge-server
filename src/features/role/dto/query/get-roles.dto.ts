import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class GetRolesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(['USER', 'ACCESS_CODE'])
  type?: 'USER' | 'ACCESS_CODE';
}
