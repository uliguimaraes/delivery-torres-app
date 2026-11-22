import { Controller, Get } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get()
  async listar() {
    return this.pagamentosService.listar();
  }
}
