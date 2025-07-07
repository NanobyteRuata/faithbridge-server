import { IsNumber } from 'class-validator';

export class CreateRelationshipDto {
  @IsNumber()
  profileId: number;

  @IsNumber()
  relatedProfileId: number;

  @IsNumber()
  relationshipTypeId: number;
}
