import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { LogsModule } from 'src/logs/logs.module';
import { LogsService } from 'src/logs/logs.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { UploadService } from 'src/api/upload.service';

@Module({
  imports: [TerminusModule, HttpModule, LogsModule, PrismaModule],
  controllers: [ApiController],
  providers: [LogsService, UploadService],
})
export class ApiModule {}
