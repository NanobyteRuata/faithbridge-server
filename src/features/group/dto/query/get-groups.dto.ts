import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetGroupsDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  groupTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  profileId?: number;
}
