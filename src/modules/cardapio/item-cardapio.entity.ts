import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('itens_cardapio')
export class ItemCardapio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Só o id do restaurante, sem relação direta com a tabela de outro módulo.
  @Column()
  restauranteId: string;

  @Column()
  nome: string;

  @Column({ type: 'float' })
  preco: number;
}
