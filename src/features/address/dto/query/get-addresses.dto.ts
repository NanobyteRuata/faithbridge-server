import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/query/pagination.dto';

export class GetAddressesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  township?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
