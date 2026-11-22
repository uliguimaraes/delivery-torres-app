import { Controller } from '@nestjs/common';
import { CardapioService } from './cardapio.service';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}
}