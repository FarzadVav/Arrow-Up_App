import { Cascade, Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { LifeArea } from './LifeArea';
import { FrameworkTag } from './FrameworkTag';
import { FrameworkHistory } from './FrameworkHistory';
import { FrameworkPractice } from './FrameworkPractice';

@Entity({ tableName: 'frameworks' })
export class Framework extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'tag' | 'sortNumber' | 'deletedAt' | 'lifeArea';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  @Property({ type: 'text' })
  content!: string;

  @ManyToOne(() => FrameworkTag, { nullable: true, deleteRule: 'set null' })
  tag?: Rel<FrameworkTag> | null;

  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => LifeArea, { nullable: true, deleteRule: 'set null' })
  lifeArea?: Rel<LifeArea>;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;

  @OneToMany(() => FrameworkHistory, (history) => history.framework, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  history = new Collection<FrameworkHistory>(this);

  @OneToMany(() => FrameworkPractice, (practice) => practice.framework, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  practices = new Collection<FrameworkPractice>(this);
}
