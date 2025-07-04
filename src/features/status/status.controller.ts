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
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/request/create-status.dto';
import { UpdateStatusDto } from './dto/request/update-status.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetStatusesDto } from './dto/query/get-statuses.dto';

@Controller('status')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @Permissions(PERMISSIONS.STATUS__CREATE)
  create(@Body() createStatusDto: CreateStatusDto, @Req() req: JwtAuthRequest) {
    return this.statusService.create(createStatusDto, req.user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.STATUS__READ)
  findAll(@Query() query: GetStatusesDto) {
    return this.statusService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.STATUS__READ)
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.STATUS__UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: JwtAuthRequest,
  ) {
    return this.statusService.update(+id, updateStatusDto, req.user.sub);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.STATUS__DELETE)
  remove(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.statusService.remove(+id, req.user.sub);
  }
}
