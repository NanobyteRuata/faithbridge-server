import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';

export class SelfUpdateOrganizationDto extends PartialType(OmitType(CreateOrganizationDto, ['code'])) {}
