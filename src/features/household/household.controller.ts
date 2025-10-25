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
import { HouseholdService } from './household.service';
import { CreateHouseholdDto } from './dto/request/create-household.dto';
import { UpdateHouseholdDto } from './dto/request/update-household.dto';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetHouseholdsDto } from './dto/query/get-households.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';

@Controller('household')
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createHouseholdDto: CreateHouseholdDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.householdService.create(
      createHouseholdDto,
      user.sub,
      user.organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  findAll(@Query() query: GetHouseholdsDto) {
    return this.householdService.findAll(query);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.householdService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  update(
    @Req() req: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
  ) {
    return this.householdService.update(+id, updateHouseholdDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  remove(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.householdService.remove(+id, req.user.sub);
  }
}
