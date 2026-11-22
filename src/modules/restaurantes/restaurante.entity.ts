import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('restaurantes')
export class Restaurante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ default: true })
  abertoNoVerao: boolean;
}
