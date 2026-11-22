import { Injectable } from '@nestjs/common';

@Injectable()
export class CardapioService {
  async validarItensECalcularTotal(itensIds: string[]): Promise<number> {
    return itensIds.length * 45.0;
  }
}