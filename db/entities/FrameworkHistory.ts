import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { Framework } from './Framework';

@Entity({ tableName: 'framework_history' })
export class FrameworkHistory extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'isDone';

  /**
   * Date identifier, e.g. "2026-10-20"
   */
  @Property({ type: 'string' })
  date!: string;

  @Property({ type: 'boolean', default: true })
  isDone: boolean = true;

  @ManyToOne(() => Framework, { nullable: false, deleteRule: 'cascade' })
  framework!: Rel<Framework>;
}
