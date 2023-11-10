import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LogsService],
})
export class LogsModule {}
