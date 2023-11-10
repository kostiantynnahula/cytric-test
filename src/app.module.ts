import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsModule } from 'src/logs/logs.module';
import { LogsService } from 'src/logs/logs.service';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule,
    TerminusModule,
    HttpModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    LogsModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, LogsService],
})
export class AppModule {}
