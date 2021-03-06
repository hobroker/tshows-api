import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { prismaConfig } from './prisma.config';

@Module({
  imports: [ConfigModule.forFeature(prismaConfig)],
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
