import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Pagamento } from './pagamento.entity';

// Gateway simulado: recusa cobranças acima desse valor (serve para demonstrar o rollback).
const LIMITE_GATEWAY = 300;

@Injectable()
export class PagamentosService {
  constructor(
    @InjectRepository(Pagamento)
    private readonly pagamentosRepo: Repository<Pagamento>,
  ) {}

  // Recebe o manager da transação aberta pelo PedidosService:
  // o pagamento é gravado na MESMA transação do pedido.
  async cobrar(pedidoId: string, valor: number, manager: EntityManager): Promise<Pagamento> {
    if (valor > LIMITE_GATEWAY) {
      throw new UnprocessableEntityException(
        `Pagamento recusado pelo gateway (R$ ${valor} acima do limite de R$ ${LIMITE_GATEWAY})`,
      );
    }

    const pagamento = manager.create(Pagamento, { pedidoId, valor, status: 'APROVADO' });
    return manager.save(pagamento);
  }

  async listar(): Promise<Pagamento[]> {
    return this.pagamentosRepo.find();
  }
}
