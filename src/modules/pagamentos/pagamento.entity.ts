import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Só o id do pedido, sem relação direta com a tabela de pedidos:
  // pagamentos não depende do módulo pedidos (facilita o corte depois).
  @Column()
  pedidoId: string;

  @Column({ type: 'float' })
  valor: number;

  @Column({ type: 'varchar' })
  status: 'APROVADO' | 'RECUSADO';
}
