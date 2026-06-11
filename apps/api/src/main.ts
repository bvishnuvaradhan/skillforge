import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file before other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable trust proxy for correct client IP resolution behind load balancers
  app.set('trust proxy', true);
  
  // Set global prefix as v1 per API spec conventions
  app.setGlobalPrefix('v1');
  
  // Configure CORS using FRONTEND_URL environment variable
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Enable cookie parsing middleware for httpOnly cookies
  app.use(cookieParser());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/v1`);
}
bootstrap();
