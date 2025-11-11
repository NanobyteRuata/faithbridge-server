import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupTypeService } from '../services/group-type.service';
import { CreateGroupTypeDto } from '../dto/request/group-type/create-group-type.dto';
import { UpdateGroupTypeDto } from '../dto/request/group-type/update-group-type.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetGroupTypesDto } from '../dto/query/get-group-types.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('group-type')
export class GroupTypeController {
  constructor(private readonly groupTypeService: GroupTypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createGroupTypeDto: CreateGroupTypeDto,
  ) {
    const organizationId = createGroupTypeDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.groupTypeService.create(
      createGroupTypeDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetGroupTypesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.groupTypeService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard)
  findAllDropdown(@Req() { user }: HybridAuthRequest, @Query() query: GetGroupTypesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.groupTypeService.findAllDropdown(query.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.groupTypeService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateGroupTypeDto: UpdateGroupTypeDto,
  ) {
    return this.groupTypeService.update(
      id,
      updateGroupTypeDto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.groupTypeService.remove(id, req.user.sub, req.user.organizationId);
  }
}
