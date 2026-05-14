import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FilmsRepository } from '../repository/films.repository';
import { FilmDocument } from '../repository/film.types';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderResultDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const filmCache = new Map<string, FilmDocument>();

    for (const ticket of dto.tickets) {
      if (!filmCache.has(ticket.film)) {
        const film = await this.filmsRepository.findById(ticket.film);
        if (!film) {
          throw new BadRequestException(`Film ${ticket.film} not found`);
        }
        filmCache.set(ticket.film, film);
      }
    }

    const pendingSeats = new Map<string, Set<string>>();

    for (const ticket of dto.tickets) {
      const film = filmCache.get(ticket.film);
      const session = film.schedule.find((s) => s.id === ticket.session);
      if (!session) {
        throw new BadRequestException(`Session ${ticket.session} not found`);
      }
      const seatKey = `${ticket.row}:${ticket.seat}`;
      if (session.taken.includes(seatKey)) {
        throw new BadRequestException(`Seat ${seatKey} is already taken`);
      }
      if (!pendingSeats.has(ticket.session)) {
        pendingSeats.set(ticket.session, new Set());
      }
      if (pendingSeats.get(ticket.session).has(seatKey)) {
        throw new BadRequestException(`Seat ${seatKey} is already taken`);
      }
      pendingSeats.get(ticket.session).add(seatKey);
    }

    const sessionTakenCache = new Map<string, string[]>();
    const items: OrderResultDto[] = [];

    for (const ticket of dto.tickets) {
      const film = filmCache.get(ticket.film);
      const session = film.schedule.find((s) => s.id === ticket.session);
      const seatKey = `${ticket.row}:${ticket.seat}`;

      if (!sessionTakenCache.has(ticket.session)) {
        sessionTakenCache.set(ticket.session, [...session.taken]);
      }
      const updatedTaken = sessionTakenCache.get(ticket.session);
      updatedTaken.push(seatKey);

      await this.filmsRepository.updateScheduleTaken(
        ticket.film,
        ticket.session,
        updatedTaken,
      );

      items.push({
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        daytime: session.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: session.price,
      });
    }

    return { total: items.length, items };
  }
}
