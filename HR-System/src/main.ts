// ============================================
// 🖥️ SERVER FILE - THIS IS WHERE YOUR APPLICATION STARTS!
// ============================================
// This file creates and starts the HTTP server
// When you run 'npm start' or 'npm run start:dev', this file is executed first

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Bootstrap function - initializes and starts the application
async function bootstrap() {
  // Create NestJS application instance using AppModule (the root module)
  // AppModule connects all features together (time-management, recruitment, etc.)
  const app = await NestFactory.create(AppModule);
  
  // Start the server and listen on port 3000 (or PORT from environment variables)
  // Your API will be available at: http://localhost:3000
  await app.listen(process.env.PORT ?? 3000);
}

// Execute the bootstrap function to start the server
bootstrap();
