import { Body, Controller, Post } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CriarPedidoDto } from './dto/criar-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  async criar(@Body() dto: CriarPedidoDto) {
    return this.pedidosService.criar(dto);
  }
}