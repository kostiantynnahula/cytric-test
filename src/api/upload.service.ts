import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadPath = process.env.UPLOAD_FILE_PATH || './uploads';

  constructor(private httpService: HttpService) {}

  checkExistUploadFolder(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath);
    }
  }

  getResponseFileExtention(response: AxiosResponse<any, any>): string {
    const [, extention] = response.data?.headers?.['content-type']?.split(
      '/',
    ) || [, 'png'];

    return extention;
  }

  async fetchFileByUrl(url: string): Promise<AxiosResponse<any, any>> {
    return await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });
  }

  async saveFileByUrl(url: string): Promise<string> {
    const filename = new Date().getTime();

    this.checkExistUploadFolder();

    const response = await this.fetchFileByUrl(url);

    const extention = this.getResponseFileExtention(response);

    const filePath = `${this.uploadPath}/${filename}.${extention}`;

    const writer = createWriteStream(filePath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return this.modifySavedFile(filePath, extention);
  }

  modifySavedFile(filePath: string, extention: string): string {
    const outputFile = `${this.uploadPath}/output.${extention}`;

    sharp(filePath)
      .greyscale()
      .resize(200, 200)
      .toFile(outputFile)
      .catch((e) => console.log(e));

    return outputFile;
  }
}
