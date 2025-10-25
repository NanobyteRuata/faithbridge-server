import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BulkCreatePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EachPermissionDto)
  permissions: EachPermissionDto[];

  @IsNumber()
  @IsNotEmpty()
  organizationId: number;
}

export class EachPermissionDto {
  @IsString()
  @IsNotEmpty()
  permission: string;

  @IsString()
  @IsOptional()
  description: string | null = null;
}
