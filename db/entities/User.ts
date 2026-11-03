import { Cascade, Collection, OptionalProps } from '@mikro-orm/core';
import { Entity, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { Todo } from './Todo';
import { Journal } from './Journal';
import { LifeArea } from './LifeArea';
import { Habit } from './Habit';

@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'locale' | 'colorScheme';

  @Property({ type: 'string' })
  @Unique()
  username!: string;

  @Property({ type: 'string', hidden: true })
  password!: string;


  @Property({ type: 'string', nullable: true })
  email?: string;

  @Property({ type: 'string', default: 'fa' })
  locale: string = 'fa';

  @Property({ type: 'string', default: 'system' })
  colorScheme: string = 'system';

  @OneToMany(() => Todo, (todo) => todo.user, { cascade: [Cascade.ALL], orphanRemoval: true })
  todos = new Collection<Todo>(this);

  @OneToMany(() => Journal, (journal) => journal.user, { cascade: [Cascade.ALL], orphanRemoval: true })
  journals = new Collection<Journal>(this);

  @OneToMany(() => LifeArea, (lifeArea) => lifeArea.user, { cascade: [Cascade.ALL], orphanRemoval: true })
  lifeAreas = new Collection<LifeArea>(this);

  @OneToMany(() => Habit, (habit) => habit.user, { cascade: [Cascade.ALL], orphanRemoval: true })
  habits = new Collection<Habit>(this);
}
