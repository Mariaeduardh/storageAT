// server.js (na raiz)
import fastify from 'fastify';
import { storageRoutes } from './src/routes/storage-routes.js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Carrega variáveis do .env (em dev local)
dotenv.config();

const server = fastify();

// Configura conexão com o banco usando DATABASE_URL
const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false, // importante para Neon e outros servidores gerenciados
  }
});

server.decorate('sql', sql); // disponibiliza o sql dentro das rotas

// registra as rotas
server.register(storageRoutes);

// Usa porta do Render (process.env.PORT) ou LOCAL_PORT para dev, ou 3333 padrão
const PORT = Number(process.env.PORT) || Number(process.env.LOCAL_PORT) || 3333;
const HOST = '0.0.0.0';

server.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});
