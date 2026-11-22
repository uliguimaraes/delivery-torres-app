import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantesController } from './restaurantes.controller';
import { RestaurantesService } from './restaurantes.service';
import { Restaurante } from './restaurante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante])],
  controllers: [RestaurantesController],
  providers: [RestaurantesService],
  exports: [RestaurantesService],
})
export class RestaurantesModule {}
