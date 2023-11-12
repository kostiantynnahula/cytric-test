import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { createWriteStream, mkdirSync, existsSync, copyFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadPath = process.env.UPLOAD_FILE_PATH || './uploads';

  constructor(private httpService: HttpService) {}

  /**
   * Check if upload folder is exist and create it there is not such folder
   */
  checkExistUploadFolder(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath);
    }
  }

  /**
   * Get file extenstion
   * @param {AxiosResponse<any, any>} response the file by link
   * @returns {string} extenstion of file
   */
  getResponseFileExtention(response: AxiosResponse<any, any>): string {
    const responseContentType: string =
      response.data?.headers?.['content-type'];

    if (!responseContentType.includes('image')) {
      throw new BadRequestException('File by the link is not image');
    }

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

  /**
   * Save file by url and return a path to modified file
   * @param {string} url path to file
   * @returns {Promise<string>}
   */
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

    return await this.modifySavedFile(filePath, filename.toString(), extention);
  }

  /**
   *
   * @param filePath
   * @param filename
   * @param extention
   * @returns {Promise<string>}
   */
  async modifySavedFile(
    filePath: string,
    filename: string,
    extention: string,
  ): Promise<string> {
    const outputFile = `${this.uploadPath}/${filename}_output.${extention}`;

    copyFileSync(filePath, outputFile);

    try {
      await sharp(filePath)
        .greyscale()
        .resize(200, 200)
        .toFile(outputFile)
        .catch((e) => console.log(e));

      return outputFile;
    } catch (e) {
      throw new BadRequestException(
        e.getMessage() || 'Something when wrong with converting the file',
      );
    }
  }
}
