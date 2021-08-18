import { Field, ObjectType } from '@nestjs/graphql';
import { Habit } from 'src/components/habits/entities/habit';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Month } from '../../months/entities/Month';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  username: string;

  @Column()
  password: string;

  @OneToOne(() => Month, (month) => month.user)
  @JoinColumn()
  @Field(() => Month)
  month: Month;

  @OneToMany(() => Habit, (habit) => habit.user)
  habits: Habit[];
}
