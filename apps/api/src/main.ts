import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe signature verification
  });

  // CORS configuration
  app.enableCors({
    origin: [
      'https://pretalk.me',
      'https://app.pretalk.me',
      'https://preprod.pretalk.me',
      'https://app.preprod.pretalk.me',
      /^http:\/\/localhost:\d+$/,
      process.env.CORS_ORIGIN || '',
    ],
    credentials: true,
  });

  // Enable real-time WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Pretalk Hub API running on: http://localhost:${port}`);
}
bootstrap();
