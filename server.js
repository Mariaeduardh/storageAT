import fastify from 'fastify';
import postgres from 'postgres';
import dotenv from 'dotenv';
import cors from '@fastify/cors';

import { setupDatabase } from './src/database/setupDatabase.js';
import { storageRoutes } from './src/routes/storage-routes.js';

dotenv.config();

async function startServer() {
  const server = fastify();

  await server.register(cors, {
    origin: [
      'https://storageat.netlify.app',
      'http://localhost:3333',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:5501',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    preflight: true,
  });

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
  });

  await setupDatabase(sql);

  server.decorate('sql', sql);

  server.register(storageRoutes);

  const PORT = Number(process.env.PORT) || Number(process.env.LOCAL_PORT) || 3333;
  const HOST = '0.0.0.0';

  server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      console.error('Erro ao iniciar servidor:', err);
      process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
  });
}

startServer().catch((error) => {
  console.error('Erro na inicialização do servidor:', error);
  process.exit(1);
});
