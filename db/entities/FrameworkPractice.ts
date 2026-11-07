import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './BaseEntity';
import { Framework } from './Framework';

@Entity({ tableName: 'framework_practices' })
export class FrameworkPractice extends BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @Property({ type: 'string' })
  title!: string;

  @ManyToOne(() => Framework, { nullable: false, deleteRule: 'cascade' })
  framework!: Rel<Framework>;
}
