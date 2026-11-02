import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { JournalCategory } from './enums';

export { JournalCategory };

@Entity({ tableName: 'journals' })
export class Journal extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'type' | 'tag' | 'sortNumber' | 'deletedAt';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  /**
   * Rich text TipTap content (HTML or markdown)
   */
  @Property({ type: 'text' })
  content!: string;

  @Enum({ items: () => JournalCategory, default: JournalCategory.LOGS })
  type: JournalCategory = JournalCategory.LOGS;

  @Property({ type: 'string', nullable: true })
  tag?: string | null;

  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;
}
