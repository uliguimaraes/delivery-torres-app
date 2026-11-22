import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardapioController } from './cardapio.controller';
import { CardapioService } from './cardapio.service';
import { ItemCardapio } from './item-cardapio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCardapio])],
  controllers: [CardapioController],
  providers: [CardapioService],
  exports: [CardapioService],
})
export class CardapioModule {}
