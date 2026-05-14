import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity({ name: 'schedules' })
export class ScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  daytime: string;

  @Column({ type: 'int' })
  hall: number;

  @Column({ type: 'int' })
  rows: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'text', default: '' })
  taken: string;

  @ManyToOne(() => FilmEntity, (film) => film.schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filmId' })
  film: FilmEntity;
}
