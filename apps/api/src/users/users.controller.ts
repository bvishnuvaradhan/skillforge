import { Controller, Get, Patch, Delete, Post, Body, Req, Param, UseGuards, UsePipes, HttpStatus, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { updateProfileSchema, linkCodingProfileSchema, UpdateProfileDto, LinkCodingProfileDto } from './users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const result = await this.usersService.getMe(req.user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.usersService.updateMe(req.user.id, dto);
    return {
      success: true,
      data: result,
    };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req: AuthenticatedRequest) {
    const result = await this.usersService.deleteMe(req.user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() req: AuthenticatedRequest,
    @Param('id') profileId: string,
  ) {
    const result = await this.usersService.getProfile(req.user.id, profileId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('me/coding-profiles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(linkCodingProfileSchema))
  async linkCodingProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: LinkCodingProfileDto,
  ) {
    const result = await this.usersService.linkCodingProfile(req.user.id, dto);
    return {
      success: true,
      data: result,
    };
  }

  @Delete('me/coding-profiles/:platform')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async unlinkCodingProfile(
    @Req() req: AuthenticatedRequest,
    @Param('platform') platform: string,
  ) {
    const result = await this.usersService.unlinkCodingProfile(req.user.id, platform);
    return {
      success: true,
      data: result,
    };
  }
}
