import { Inject, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { FilmDocument, FilmSchema } from './film.schema';

@Injectable()
export class FilmsRepository {
  private readonly filmModel: mongoose.Model<FilmDocument>;

  constructor(@Inject('DATABASE_CONNECTION') connection: mongoose.Connection) {
    this.filmModel = connection.model<FilmDocument>(
      'Film',
      FilmSchema,
      'films',
    );
  }

  async findAll(): Promise<FilmDocument[]> {
    return this.filmModel.find({}).lean();
  }

  async findById(id: string): Promise<FilmDocument | null> {
    return this.filmModel.findOne({ id }).lean();
  }

  async updateScheduleTaken(
    filmId: string,
    sessionId: string,
    taken: string[],
  ): Promise<void> {
    await this.filmModel.updateOne(
      { id: filmId, 'schedule.id': sessionId },
      { $set: { 'schedule.$.taken': taken } },
    );
  }
}
