import { Cascade, Collection, OptionalProps } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { JournalTag } from './JournalTag';
import { Journal } from './Journal';

@Entity({ tableName: 'journal_categories' })
export class JournalCategory extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'sortNumber';

  @Property({ type: 'string', unique: true })
  slug!: string;

  @Property({ type: 'string' })
  nameEn!: string;

  @Property({ type: 'string' })
  nameFa!: string;

  @Property({ type: 'integer', default: 0 })
  sortNumber: number = 0;

  @OneToMany(() => JournalTag, (tag) => tag.category, { cascade: [Cascade.ALL], orphanRemoval: false })
  tags = new Collection<JournalTag>(this);

  @OneToMany(() => Journal, (journal) => journal.category, { cascade: [Cascade.PERSIST], orphanRemoval: false })
  journals = new Collection<Journal>(this);
}
