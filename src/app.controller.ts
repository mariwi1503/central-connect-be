import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Api Health' })
  @Version(VERSION_NEUTRAL)
  getHello() {
    return 'Hello from Central Connect';
  }
}
