import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiConflictResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { UnauthorizedResponseDto, ValidationErrorResponseDto, ConflictResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided information. Email must be unique within the tenant.' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: RegisterResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    type: ValidationErrorResponseDto 
  })
  @ApiConflictResponse({ 
    description: 'Email already exists',
    type: ConflictResponseDto 
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Optional tenant identifier for multi-tenant registration',
    required: false
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Authenticate user',
    description: 'Authenticates a user with email and password, returns JWT tokens for API access' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful, returns access and refresh tokens',
    type: LoginResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    type: UnauthorizedResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    type: ValidationErrorResponseDto 
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Optional tenant identifier for multi-tenant login',
    required: false
  })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token for new access and refresh tokens' 
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or expired refresh token',
    type: UnauthorizedResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    type: ValidationErrorResponseDto 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidates the current access token, preventing further API access' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Logout successful, token invalidated' 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or missing authentication token',
    type: UnauthorizedResponseDto 
  })
  async logout(@Request() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await this.authService.logout(token);
  }
}