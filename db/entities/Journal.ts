import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { JournalCategory } from './JournalCategory';
import { JournalTag } from './JournalTag';

@Entity({ tableName: 'journals' })
export class Journal extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'sortNumber' | 'deletedAt' | 'type' | 'category' | 'tag';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  /**
   * Rich text TipTap content (HTML or markdown)
   */
  @Property({ type: 'text' })
  content!: string;

  @ManyToOne(() => JournalCategory, { nullable: true, deleteRule: 'set null' })
  category?: Rel<JournalCategory> | null;

  @ManyToOne(() => JournalTag, { nullable: true, deleteRule: 'set null' })
  tag?: Rel<JournalTag> | null;

  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, deleteRule: 'cascade' })
  user?: Rel<User>;

  get type(): string {
    return this.category?.nameEn ?? 'Logs';
  }
}
