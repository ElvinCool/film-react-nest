import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsRepository } from '../repository/films.repository';
import { FilmEntity } from '../repository/entities/film.entity';
import { ScheduleEntity } from '../repository/entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FilmEntity, ScheduleEntity])],
  controllers: [FilmsController],
  providers: [FilmsService, FilmsRepository],
  exports: [FilmsRepository],
})
export class FilmsModule {}
