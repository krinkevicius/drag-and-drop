import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string
}
