import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RestaurantesModule } from './modules/restaurantes/restaurantes.module';
import { CardapioModule } from './modules/cardapio/cardapio.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module';

@Module({
  imports: [
    DatabaseModule,
    UsuariosModule,
    RestaurantesModule,
    CardapioModule,
    PedidosModule,
    PagamentosModule,
    NotificacoesModule,
  ],
})
export class AppModule {}