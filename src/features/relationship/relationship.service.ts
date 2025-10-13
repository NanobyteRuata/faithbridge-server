import { Injectable } from '@nestjs/common';
import { CreateRelationshipDto } from './dto/request/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/request/update-relationship.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateRelationshipTypeDto } from './dto/request/create-relationship-type.dto';
import { UpdateRelationshipTypeDto } from './dto/request/update-relationship-type.dto';
import { GetRelationshipsDto } from './dto/query/get-relationships.dto';
import { Prisma } from '@prisma/client';
import { GetRelationshipTypesDto } from './dto/query/get-relationship-types.dto';

@Injectable()
export class RelationshipService {
  constructor(private readonly prisma: PrismaService) {}

  // Relationship
  createRelationship(
    createRelationshipDto: CreateRelationshipDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.relationship.create({
      data: {
        ...createRelationshipDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAllRelationships({
    skip,
    limit,
    profileId,
    relationshipTypeId,
  }: GetRelationshipsDto) {
    const args: Prisma.RelationshipFindManyArgs = {
      skip,
      take: limit,
      where: {
        profileId,
        relationshipTypeId,
      },
      include: {
        profile: true,
        relatedProfile: true,
        relationshipType: true,
      },
    };

    const [relationships, total] = await this.prisma.$transaction([
      this.prisma.relationship.findMany(args),
      this.prisma.relationship.count({ where: args.where }),
    ]);

    return {
      data: relationships,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findOneRelationship(id: number) {
    return this.prisma.relationship.findUnique({ where: { id } });
  }

  updateRelationship(
    id: number,
    updateRelationshipDto: UpdateRelationshipDto,
    userId: number,
  ) {
    return this.prisma.relationship.update({
      where: { id },
      data: { ...updateRelationshipDto, updatedById: userId },
    });
  }

  removeRelationship(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.relationship.delete({ where: { id } });
  }

  // Relationship Type
  createRelationshipType(
    createRelationshipTypeDto: CreateRelationshipTypeDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.relationshipType.create({
      data: {
        ...createRelationshipTypeDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAllRelationshipTypes({
    skip,
    limit,
    search,
  }: GetRelationshipTypesDto) {
    const args: Prisma.RelationshipTypeFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        inverseRelationshipType: true,
      },
    };

    const [relationshipTypes, total] = await this.prisma.$transaction([
      this.prisma.relationshipType.findMany(args),
      this.prisma.relationshipType.count({ where: args.where }),
    ]);

    return {
      data: relationshipTypes,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findOneRelationshipType(id: number) {
    return this.prisma.relationshipType.findUnique({ where: { id } });
  }

  updateRelationshipType(
    id: number,
    updateRelationshipDto: UpdateRelationshipTypeDto,
    userId: number,
  ) {
    return this.prisma.relationshipType.update({
      where: { id },
      data: { ...updateRelationshipDto, updatedById: userId },
    });
  }

  removeRelationshipType(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.relationshipType.delete({ where: { id } });
  }
}
