import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { RestaurantesModule } from '../restaurantes/restaurantes.module';
import { CardapioModule } from '../cardapio/cardapio.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { LoggerService } from '../../shared/logger.service';

@Module({
  imports: [
    UsuariosModule,
    RestaurantesModule,
    CardapioModule,
    PagamentosModule,
    NotificacoesModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService, LoggerService],
})
export class PedidosModule {}