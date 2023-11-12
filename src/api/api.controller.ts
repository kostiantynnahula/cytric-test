import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { isURL } from 'class-validator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LogsService } from 'src/logs/logs.service';
import { UploadService } from 'src/api/upload.service';
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LogEntity } from 'src/logs/log.entity';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@ApiTags('API')
@Controller('api')
@UseGuards(ThrottlerGuard)
export class ApiController {
  constructor(
    private logService: LogsService,
    private uploadService: UploadService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('process-image')
  @ApiQuery({
    name: 'url',
    type: 'string',
    required: true,
    description: 'The link to image what we want to download',
  })
  async process(@Query('url') url: string, @Res() res) {
    if (!isURL(url)) {
      throw new BadRequestException('Url is wrong');
    }

    await this.logService.create(url);

    const outputFile = await this.uploadService.saveFileByUrl(url);

    const file = createReadStream(outputFile);

    return file.pipe(res);
  }

  @Get('logs')
  @ApiResponse({
    status: 200,
    type: LogEntity,
    isArray: true,
    description: 'List of logs',
  })
  async logs() {
    return await this.logService.list();
  }

  @Get('status')
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
