import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Pagamento } from './pagamento.entity';

@Injectable()
export class PagamentosService {
  async cobrar(pedidoId: string, valor: number, manager?: EntityManager): Promise<Pagamento> {
    const pagamento = new Pagamento();
    pagamento.pedidoId = pedidoId;
    pagamento.valor = valor;
    pagamento.status = 'APROVADO';

    if (manager) {
      await manager.save(Pagamento, pagamento);
    }

    return pagamento;
  }
}