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
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/request/create-status.dto';
import { UpdateStatusDto } from './dto/request/update-status.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetStatusesDto } from './dto/query/get-statuses.dto';

@Controller('status')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @Permissions('SUPER_ADMIN')
  create(
    @Body() createStatusDto: CreateStatusDto,
    @Req() { user }: JwtAuthRequest,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.statusService.create(
      createStatusDto,
      user.sub,
      user.organizationId,
    );
  }

  @Get()
  @Permissions('SUPER_ADMIN')
  findAll(@Query() query: GetStatusesDto) {
    return this.statusService.findAll(query);
  }

  @Get(':id')
  @Permissions('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: JwtAuthRequest,
  ) {
    return this.statusService.update(+id, updateStatusDto, req.user.sub);
  }

  @Delete(':id')
  @Permissions('SUPER_ADMIN')
  remove(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.statusService.remove(+id, req.user.sub);
  }
}
