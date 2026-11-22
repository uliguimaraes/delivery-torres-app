import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RestaurantesService } from '../restaurantes/restaurantes.service';
import { CardapioService } from '../cardapio/cardapio.service';
import { PagamentosService } from '../pagamentos/pagamentos.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Pedido) private readonly pedidosRepo: Repository<Pedido>,
    private readonly usuariosService: UsuariosService,
    private readonly restaurantesService: RestaurantesService,
    private readonly cardapioService: CardapioService,
    private readonly pagamentosService: PagamentosService,
    private readonly notificacoesService: NotificacoesService,
    private readonly logger: LoggerService,
  ) {}

  async criar(dto: CriarPedidoDto): Promise<Pedido> {
    const requestId = `req-${Date.now()}`; // VANTAGEM 3: Debug Fácil (ID único rastreia todo o fluxo)

    // 1. Chamadas de função em memória entre os módulos (sem HTTP/rede)
    this.logger.log('PedidosService', '1. Validando cliente e restaurante...', requestId);
    await this.usuariosService.validarCliente(dto.usuarioId);
    await this.restaurantesService.verificarDisponibilidade(dto.restauranteId);

    this.logger.log('PedidosService', '2. Calculando itens no CardapioService...', requestId);
    const valorTotal = await this.cardapioService.validarItensECalcularTotal(dto.itensIds);

    // 2. VANTAGEM 1: Transação Única (ACID)
    // Pedido (módulo pedidos) e pagamento (módulo pagamentos) são gravados na mesma
    // transação do mesmo banco. Se a cobrança falhar, o pedido também é desfeito.
    this.logger.log('PedidosService', '3. Abrindo TRANSAÇÃO ÚNICA (pedido + pagamento)...', requestId);
    let pedidoSalvo: Pedido;
    try {
      pedidoSalvo = await this.dataSource.transaction(async (manager) => {
        const pedido = manager.create(Pedido, {
          usuarioId: dto.usuarioId,
          restauranteId: dto.restauranteId,
          valorTotal,
          status: 'CONFIRMADO',
        });
        await manager.save(pedido);
        this.logger.log('PedidosService', `Pedido ${pedido.id} gravado (ainda sem COMMIT)`, requestId);

        // Se lançar erro aqui, o pedido acima é desfeito pelo ROLLBACK automático.
        await this.pagamentosService.cobrar(pedido.id, valorTotal, manager);

        return pedido;
      });
    } catch (erro) {
      this.logger.log('PedidosService', `ROLLBACK: pedido desfeito (${erro.message})`, requestId);
      throw erro;
    }
    this.logger.log('PedidosService', `COMMIT: pedido ${pedidoSalvo.id} e pagamento salvos juntos`, requestId);

    // 3. Notifica o restaurante só depois de confirmar a transação
    await this.notificacoesService.avisarRestaurante(dto.restauranteId, pedidoSalvo.id);
    this.logger.log('PedidosService', '4. Pedido finalizado com sucesso!', requestId);

    return pedidoSalvo;
  }

  async listar(): Promise<Pedido[]> {
    return this.pedidosRepo.find();
  }
}
