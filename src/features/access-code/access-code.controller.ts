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
  ForbiddenException,
} from '@nestjs/common';
import { AccessCodeService } from './access-code.service';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { HybridAuthRequest, JwtAuthRequest } from '../user/interface/requests.interface';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetAccessCodesDto } from './dto/query/get-access-codes.dto';
import { AccessCodeLoginDto } from './dto/request/access-code-login.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('access-code')
export class AccessCodeController {
  constructor(private readonly accessCodeService: AccessCodeService) {}

  @Post('login')
  login(@Body() { accessCode, organizationCode }: AccessCodeLoginDto) {
    return this.accessCodeService.login(accessCode, organizationCode);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__EDIT)
  create(
    @Body() createAccessCodeDto: CreateAccessCodeDto,
    @Req() { user }: JwtAuthRequest,
  ) {
    if (!user.organizationId) {
      throw new ForbiddenException('User is not associated with any organization');
    }

    return this.accessCodeService.create(createAccessCodeDto, user.sub, user.organizationId);
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__VIEW)
  findAll(@Query() query: GetAccessCodesDto, @Req() { user }: HybridAuthRequest) {
    return this.accessCodeService.findAll(query, user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__VIEW)
  findOne(@Param('id') id: string, @Req() { user }: HybridAuthRequest) {
    return this.accessCodeService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateAccessCodeDto: UpdateAccessCodeDto,
  ) {
    return this.accessCodeService.update(
      +id,
      updateAccessCodeDto,
      user.sub,
      user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ACCESS_CODE__EDIT)
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.accessCodeService.remove(+id, user.sub, user.organizationId);
  }
}
