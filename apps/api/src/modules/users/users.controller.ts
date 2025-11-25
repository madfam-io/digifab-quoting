import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserPreferencesDto } from './dto/update-preferences.dto';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @Request() req: any,
    @Body() updatePreferencesDto: UpdateUserPreferencesDto,
  ) {
    return this.usersService.updatePreferences(req.user.id, updatePreferencesDto);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved' })
  async getPreferences(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return {
      preferredLocale: user.preferredLocale || 'es',
      emailNotifications: (user as any).emailNotifications ?? true,
      currency: (user as any).currency || 'MXN',
      timezone: (user as any).timezone || 'America/Mexico_City',
    };
  }
}
