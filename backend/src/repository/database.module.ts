import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (
        configService: ConfigService,
      ): Promise<mongoose.Connection> => {
        const url = configService.get<string>(
          'DATABASE_URL',
          'mongodb://localhost:27017/prac',
        );
        return mongoose.createConnection(url);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
