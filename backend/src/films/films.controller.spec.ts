import { Test } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmListResponseDto, ScheduleListResponseDto } from './dto/film.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: jest.Mocked<FilmsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            getFilms: jest.fn(),
            getFilmSchedule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(FilmsController);
    service = module.get(FilmsService);
  });

  describe('GET /films', () => {
    it('возвращает результат FilmsService.getFilms без модификаций', async () => {
      const expected: FilmListResponseDto = {
        total: 1,
        items: [
          {
            id: 'film-id',
            rating: 9,
            director: 'Director',
            tags: ['Drama'],
            image: '/img.jpg',
            cover: '/cover.jpg',
            title: 'Movie',
            about: 'about',
            description: 'desc',
            schedule: [],
          },
        ],
      };
      service.getFilms.mockResolvedValue(expected);

      const result = await controller.getFilms();

      expect(service.getFilms).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });
  });

  describe('GET /films/:id/schedule', () => {
    it('передаёт id из параметра в FilmsService.getFilmSchedule', async () => {
      const expected: ScheduleListResponseDto = {
        total: 1,
        items: [
          {
            id: 'session-id',
            daytime: '2024-06-28T10:00:00Z',
            hall: 1,
            rows: 5,
            seats: 10,
            price: 350,
            taken: [],
          },
        ],
      };
      service.getFilmSchedule.mockResolvedValue(expected);

      const result = await controller.getFilmSchedule('film-id');

      expect(service.getFilmSchedule).toHaveBeenCalledWith('film-id');
      expect(service.getFilmSchedule).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });

    it('пробрасывает ошибку, если сервис её бросает', async () => {
      const err = new Error('db down');
      service.getFilmSchedule.mockRejectedValue(err);

      await expect(controller.getFilmSchedule('id')).rejects.toThrow('db down');
    });
  });
});
