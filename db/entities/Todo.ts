import { Cascade, Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { TodoAction } from './TodoAction';
import { TodoDiscipline } from './TodoDiscipline';
import { LifeArea } from './LifeArea';
import { TodoType } from './enums';

export { TodoType };

@Entity({ tableName: 'todos' })
export class Todo extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'isDone' | 'type' | 'description' | 'deadline' | 'sortNumber' | 'deletedAt' | 'lifeArea';

  @Property({ type: 'string' })
  title!: string;

  /**
   * Rich text (TipTap HTML) notes about the todo or mission
   */
  @Property({ type: 'text', default: '' })
  description: string = '';

  @Enum({ items: () => TodoType, default: TodoType.DAILY })
  type: TodoType = TodoType.DAILY;

  /**
   * For Daily: "HH:mm" (e.g. "10:30")
   * For Upcoming/Mission: "YYYY-MM-DD" (e.g. "2026-10-30")
   */
  @Property({ type: 'string', nullable: true })
  deadline?: string | null;

  @Property({ type: 'boolean', default: false })
  isDone: boolean = false;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  /**
   * Time and Energy Cost rating (1-5), used predominantly by Missions
   */
  @Property({ type: 'integer', nullable: true })
  difficulty?: number;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;

  @ManyToOne(() => LifeArea, { nullable: true, deleteRule: 'set null' })
  lifeArea?: Rel<LifeArea>;

  @OneToMany(() => TodoAction, (action) => action.mission, { cascade: [Cascade.ALL], orphanRemoval: true })
  actions = new Collection<TodoAction>(this);

  @OneToMany(() => TodoDiscipline, (discipline) => discipline.mission, { cascade: [Cascade.ALL], orphanRemoval: true })
  disciplines = new Collection<TodoDiscipline>(this);
}
