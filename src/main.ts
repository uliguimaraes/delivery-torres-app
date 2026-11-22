import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseModule } from './database/database.module';

async function bootstrap() {
  DatabaseModule.connect();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Monolito Delivery Torres rodando na porta 3000');
}
bootstrap();