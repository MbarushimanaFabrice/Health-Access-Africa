import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(env.PORT, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║       Health Access Africa API — Running        ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`\nServer:    http://localhost:${env.PORT}`);
      console.log(`Swagger:   http://localhost:${env.PORT}/api-docs`);
      console.log(`Health:    http://localhost:${env.PORT}/health`);
      console.log(`Env:       ${env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
