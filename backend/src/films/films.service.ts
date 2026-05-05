import { Injectable } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import {
  FilmDto,
  FilmListResponseDto,
  ScheduleDto,
  ScheduleListResponseDto,
} from './dto/film.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async getFilms(): Promise<FilmListResponseDto> {
    const films = await this.filmsRepository.findAll();
    const items: FilmDto[] = films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
    }));
    return { total: items.length, items };
  }

  async getFilmSchedule(id: string): Promise<ScheduleListResponseDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      return { total: 0, items: [] };
    }
    const items: ScheduleDto[] = film.schedule.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken,
    }));
    return { total: items.length, items };
  }
}
