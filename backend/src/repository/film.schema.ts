import mongoose from 'mongoose';

export interface ScheduleDocument {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export interface FilmDocument {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: ScheduleDocument[];
}

export const ScheduleSchema = new mongoose.Schema<ScheduleDocument>(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: Number, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  { _id: false },
);

export const FilmSchema = new mongoose.Schema<FilmDocument>({
  id: { type: String, required: true, unique: true },
  rating: { type: Number },
  director: { type: String },
  tags: { type: [String] },
  image: { type: String },
  cover: { type: String },
  title: { type: String },
  about: { type: String },
  description: { type: String },
  schedule: { type: [ScheduleSchema], default: [] },
});
