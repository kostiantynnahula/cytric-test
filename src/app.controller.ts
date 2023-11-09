import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { createWriteStream, mkdirSync, existsSync, createReadStream } from 'fs';
import { isURL } from 'class-validator';
import * as sharp from 'sharp';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api')
export class AppController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private httpService: HttpService,
  ) {}

  @Get('health')
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('process-image')
  @UseGuards(ThrottlerGuard)
  async process(@Query('url') url: string, @Res() res) {
    if (!isURL(url)) {
      throw new BadRequestException('Url is wrong');
    }
    const filename = new Date().getTime();
    const uploadPath = process.env.UPLOAD_FILE_PATH || './uploads';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath);
    }

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const [, extention] = response.data?.headers?.['content-type']?.split(
      '/',
    ) || [, 'png'];
    const filePath = `${uploadPath}/${filename}.${extention}`;
    const writer = createWriteStream(`${uploadPath}/${filename}.${extention}`);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const outputFile = `${uploadPath}/output.${extention}`;

    sharp(filePath)
      .greyscale()
      .resize(200, 200)
      .toFile(outputFile)
      .catch((e) => console.log(e));

    const file = createReadStream(outputFile);
    return file.pipe(res);
  }
}
