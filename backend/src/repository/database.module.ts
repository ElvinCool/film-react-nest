import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const url = new URL(databaseUrl);
        return {
          type: 'postgres' as const,
          host: url.hostname,
          port: url.port ? Number(url.port) : 5432,
          database: url.pathname.replace(/^\//, ''),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          entities: [FilmEntity, ScheduleEntity],
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
