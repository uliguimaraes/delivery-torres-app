import { Injectable } from '@nestjs/common';
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
    this.logger.log('PedidosService', '3. Iniciando TRANSAÇÃO ÚNICA (Pedido + Pagamento)...', requestId);
    const pedidoSalvo = await this.executarTransacaoUnica(async () => {
      const novoPedido = new Pedido();
      novoPedido.id = `ped-${Math.floor(Math.random() * 1000)}`;
      novoPedido.usuarioId = dto.usuarioId;
      novoPedido.restauranteId = dto.restauranteId;
      novoPedido.valorTotal = valorTotal;
      novoPedido.status = 'CONFIRMADO';

      // Se a cobrança falhar, o catch faz ROLLBACK e desfaz o pedido
      await this.pagamentosService.cobrar(novoPedido.id, valorTotal);

      return novoPedido;
    });

    // 3. Notifica o restaurante após confirmar transação
    await this.notificacoesService.avisarRestaurante(dto.restauranteId, pedidoSalvo.id);
    this.logger.log('PedidosService', '4. Pedido finalizado com sucesso!', requestId);

    return pedidoSalvo;
  }

  // Simula o gerenciador de transação única (BEGIN -> COMMIT / ROLLBACK)
  private async executarTransacaoUnica<T>(operacao: () => Promise<T>): Promise<T> {
    try {
      const resultado = await operacao();
      console.log('[Database Transaction] COMMIT executado com sucesso (Pedido + Pagamento salvos juntos)');
      return resultado;
    } catch (erro) {
      console.error('[Database Transaction] ROLLBACK executado! Pedido desfeito devido a falha no pagamento.');
      throw erro;
    }
  }
}