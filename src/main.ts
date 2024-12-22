import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GenderSeeder } from './seeder/gender.seeder';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const genderSeeder = app.get(GenderSeeder);
  await genderSeeder.seed();
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  console.log('Seeder executed successfully.');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
