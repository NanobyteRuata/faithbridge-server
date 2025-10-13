import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RelationshipService } from './relationship.service';
import { CreateRelationshipDto } from './dto/request/create-relationship.dto';
import { CreateRelationshipTypeDto } from './dto/request/create-relationship-type.dto';
import { UpdateRelationshipDto } from './dto/request/update-relationship.dto';
import { UpdateRelationshipTypeDto } from './dto/request/update-relationship-type.dto';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetRelationshipsDto } from './dto/query/get-relationships.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';
import { GetRelationshipTypesDto } from './dto/query/get-relationship-types.dto';

@Controller('relationship')
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP__CREATE)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createRelationshipDto: CreateRelationshipDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException("Organization ID not found");
    }

    return this.relationshipService.createRelationship(
      createRelationshipDto,
      user.sub,
      user.organizationId
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP__READ)
  findAll(@Query() query: GetRelationshipsDto) {
    return this.relationshipService.findAllRelationships(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP__READ)
  findOne(@Param('id') id: string) {
    return this.relationshipService.findOneRelationship(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP__UPDATE)
  update(
    @Req() req: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipDto,
  ) {
    return this.relationshipService.updateRelationship(
      +id,
      updateRelationshipDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP__DELETE)
  remove(@Req() req: JwtAuthRequest, @Param('id') id: string) {
    return this.relationshipService.removeRelationship(+id, req.user.sub);
  }

  // Relationship Type
  @Post('type')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP_TYPE__CREATE)
  createRelationshipType(
    @Req() { user }: JwtAuthRequest,
    @Body() createRelationshipDto: CreateRelationshipTypeDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException("Organization ID not found");
    }
    
    return this.relationshipService.createRelationshipType(
      createRelationshipDto,
      user.sub,
      user.organizationId
    );
  }

  @Get('type')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP_TYPE__READ)
  findAllRelationshipTypes(@Query() query: GetRelationshipTypesDto) {
    return this.relationshipService.findAllRelationshipTypes(query);
  }

  @Get('type/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP_TYPE__READ)
  findOneRelationshipType(@Param('id') id: string) {
    return this.relationshipService.findOneRelationshipType(+id);
  }

  @Patch('type/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP_TYPE__UPDATE)
  updateRelationshipType(
    @Req() req: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipTypeDto,
  ) {
    return this.relationshipService.updateRelationshipType(
      +id,
      updateRelationshipDto,
      req.user.sub,
    );
  }

  @Delete('type/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.RELATIONSHIP_TYPE__DELETE)
  removeRelationshipType(@Req() req: JwtAuthRequest, @Param('id') id: string) {
    return this.relationshipService.removeRelationshipType(+id, req.user.sub);
  }
}
