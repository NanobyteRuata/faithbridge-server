import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGroupProfileDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsNumber()
  @IsNotEmpty()
  profileId: number;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @IsNumber()
  @IsOptional()
  groupRoleId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joinedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  leftAt?: Date;
}
