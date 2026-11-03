import { Cascade, Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { LifeArea } from './LifeArea';
import { HabitTag } from './HabitTag';
import { HabitHistory } from './HabitHistory';

@Entity({ tableName: 'habits' })
export class Habit extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'tag' | 'sortNumber' | 'deletedAt' | 'lifeArea';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  @Property({ type: 'text', default: '' })
  description: string = '';

  @ManyToOne(() => HabitTag, { nullable: true, deleteRule: 'set null' })
  tag?: Rel<HabitTag> | null;

  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => LifeArea, { nullable: true, deleteRule: 'set null' })
  lifeArea?: Rel<LifeArea>;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;

  @OneToMany(() => HabitHistory, (history) => history.habit, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  history = new Collection<HabitHistory>(this);
}
