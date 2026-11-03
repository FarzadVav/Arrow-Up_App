import { Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { JournalCategory } from './JournalCategory';
import { Journal } from './Journal';

@Entity({ tableName: 'journal_tags' })
export class JournalTag extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'sortNumber' | 'title' | 'category';

  @Property({ type: 'string' })
  slug!: string;

  @Property({ type: 'string' })
  nameEn!: string;

  @Property({ type: 'string' })
  nameFa!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  @ManyToOne(() => JournalCategory, { nullable: true, deleteRule: 'set null' })
  category?: Rel<JournalCategory> | null;

  @OneToMany(() => Journal, (journal) => journal.tag)
  journals = new Collection<Journal>(this);

  get title(): string {
    return this.nameEn;
  }
}
