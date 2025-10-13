import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
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
  resource: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}
