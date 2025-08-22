import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs', 302)
  root() {
    return { url: '/api/docs' };
  }

  @Get('api')
  @Redirect('/api/docs', 302)
  apiRoot() {
    return { url: '/api/docs' };
  }
}