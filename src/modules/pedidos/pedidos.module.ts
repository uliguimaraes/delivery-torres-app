import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { Pedido } from './pedido.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { RestaurantesModule } from '../restaurantes/restaurantes.module';
import { CardapioModule } from '../cardapio/cardapio.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido]),
    UsuariosModule,
    RestaurantesModule,
    CardapioModule,
    PagamentosModule,
    NotificacoesModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
