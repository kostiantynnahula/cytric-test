import { ApiProperty } from '@nestjs/swagger';
import { Log } from '@prisma/client';

export class LogEntity implements Log {
  constructor(partial: Partial<LogEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  createdAt: Date;
}
