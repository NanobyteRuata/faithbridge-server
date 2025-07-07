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
} from '@nestjs/common';
import { AccessCodeService } from './access-code.service';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { GetAccessCodesDto } from './dto/query/get-access-codes.dto';

@Controller('access-code')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccessCodeController {
  constructor(private readonly accessCodeService: AccessCodeService) {}

  @Post()
  @Permissions(PERMISSIONS.ACCESS_CODE__CREATE)
  create(
    @Body() createAccessCodeDto: CreateAccessCodeDto,
    @Req() req: JwtAuthRequest,
  ) {
    return this.accessCodeService.create(createAccessCodeDto, req.user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.ACCESS_CODE__READ)
  findAll(@Query() query: GetAccessCodesDto) {
    return this.accessCodeService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ACCESS_CODE__READ)
  findOne(@Param('id') id: string) {
    return this.accessCodeService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ACCESS_CODE__UPDATE)
  update(
    @Req() req: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateAccessCodeDto: UpdateAccessCodeDto,
  ) {
    return this.accessCodeService.update(
      +id,
      updateAccessCodeDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ACCESS_CODE__DELETE)
  remove(@Req() req: JwtAuthRequest, @Param('id') id: string) {
    return this.accessCodeService.remove(+id, req.user.sub);
  }
}
