import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { FilmDocument, ScheduleDocument } from './film.types';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepo: Repository<FilmEntity>,
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepo: Repository<ScheduleEntity>,
  ) {}

  async findAll(): Promise<FilmDocument[]> {
    const films = await this.filmRepo.find({ relations: ['schedule'] });
    return films.map((film) => this.toFilmDocument(film));
  }

  async findById(id: string): Promise<FilmDocument | null> {
    const film = await this.filmRepo.findOne({
      where: { id },
      relations: ['schedule'],
    });
    return film ? this.toFilmDocument(film) : null;
  }

  async updateScheduleTaken(
    _filmId: string,
    sessionId: string,
    taken: string[],
  ): Promise<void> {
    await this.scheduleRepo.update(
      { id: sessionId },
      { taken: taken.join(',') },
    );
  }

  private toFilmDocument(film: FilmEntity): FilmDocument {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: this.splitCsv(film.tags),
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule: (film.schedule ?? []).map((s) => this.toScheduleDocument(s)),
    };
  }

  private toScheduleDocument(s: ScheduleEntity): ScheduleDocument {
    return {
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: this.splitCsv(s.taken),
    };
  }

  private splitCsv(value: string | null | undefined): string[] {
    if (!value) return [];
    return value.split(',').filter(Boolean);
  }
}
