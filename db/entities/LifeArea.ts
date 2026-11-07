import { Cascade, Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Todo } from './Todo';
import { Framework } from './Framework';

@Entity({ tableName: 'life_areas' })
export class LifeArea extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'active';

  @Property({ type: 'string' })
  title!: string;

  /**
   * TipTap rich text HTML for long-term vision & principles
   */
  @Property({ type: 'text' })
  vision!: string;

  @Property({ type: 'boolean', default: true })
  active: boolean = true;

  /**
   * Life time and energy cost rating (1-10)
   */
  @Property({ type: 'integer', nullable: true })
  difficulty?: number;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;

  @OneToMany(() => Todo, (todo) => todo.lifeArea, { cascade: [Cascade.PERSIST], orphanRemoval: false })
  todos = new Collection<Todo>(this);

  @OneToMany(() => Framework, (framework) => framework.lifeArea, { cascade: [Cascade.PERSIST], orphanRemoval: false })
  frameworks = new Collection<Framework>(this);
}
