import { Injectable } from '@nestjs/common';
import { Log } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async create(url: string): Promise<Log> {
    return this.prisma.log.create({ data: { url } });
  }

  async list(): Promise<Log[]> {
    return this.prisma.log.findMany();
  }
}
