import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';

export class GetRelationshipsDto extends PaginationDto {
  @IsInt()
  @Type(() => Number)
  profileId: number;

  @IsInt()
  @Type(() => Number)
  relationshipTypeId: number;
}
