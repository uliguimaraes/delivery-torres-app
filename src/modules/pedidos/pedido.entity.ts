import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @Column()
  restauranteId: string;

  @Column({ type: 'float' })
  valorTotal: number;

  @Column({ type: 'varchar' })
  status: string;
}
