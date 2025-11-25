import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './modules/auth/decorators/public.decorator';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Public()
  @Redirect('/api/docs', 302)
  root() {
    return { url: '/api/docs' };
  }

  @Get('api')
  @Public()
  @Redirect('/api/docs', 302)
  apiRoot() {
    return { url: '/api/docs' };
  }
}
