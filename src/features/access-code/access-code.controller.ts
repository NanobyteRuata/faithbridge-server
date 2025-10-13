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
  BadRequestException,
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
import { AccessCodeLoginDto } from './dto/request/access-code-login.dto';

@Controller('access-code')
export class AccessCodeController {
  constructor(private readonly accessCodeService: AccessCodeService) {}

  @Post('login')
  login(@Body() { accessCode, organizationCode }: AccessCodeLoginDto) {
    return this.accessCodeService.login(accessCode, organizationCode);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__CREATE)
  create(
    @Body() createAccessCodeDto: CreateAccessCodeDto,
    @Req() { user }: JwtAuthRequest,
  ) {
    if (createAccessCodeDto.organizationId !== user.organizationId) {
      return new BadRequestException('Please provide the correct organizationId')
    }

    return this.accessCodeService.create(createAccessCodeDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__READ)
  findAll(
    @Query() query: GetAccessCodesDto,
    @Req() { user }: JwtAuthRequest
  ) {
    if (!user.isSuperAdmin && user.organizationId !== query.organizationId) {
      return new BadRequestException('Please provide the correct organizationId')
    }

    return this.accessCodeService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__READ)
  findOne(@Param('id') id: string,
    @Req() { user }: JwtAuthRequest) {
    return this.accessCodeService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__UPDATE)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateAccessCodeDto: UpdateAccessCodeDto,
  ) {
    return this.accessCodeService.update(
      +id,
      updateAccessCodeDto,
      user.sub,
      user.organizationId
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__DELETE)
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.accessCodeService.remove(+id, user.sub, user.organizationId);
  }
}
