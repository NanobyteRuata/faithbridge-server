import { PaginationDto } from 'src/shared/dto/query/pagination.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetGroupProfilesDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  groupId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  profileId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  groupRoleId?: number;
}
