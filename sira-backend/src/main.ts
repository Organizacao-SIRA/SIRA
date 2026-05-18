import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração de Prefixo Global
  app.setGlobalPrefix('api/v1');

  // Servir arquivos estáticos (avatares, etc.) fora do prefixo /api/v1
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Habilitar Validação Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('SIRA+ API')
    .setDescription('API do Sistema Inteligente de Recomendações Acadêmicas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Habilitar CORS para o Frontend
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 SIRA+ Backend running on: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
