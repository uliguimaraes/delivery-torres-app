import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// UMA conexão, UM banco para o sistema inteiro.
// Cada módulo registra as próprias entities com TypeOrmModule.forFeature(...),
// e o autoLoadEntities junta tudo aqui. O banco (sql.js) roda embutido no
// processo, então não precisa subir nada além do próprio app.
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
