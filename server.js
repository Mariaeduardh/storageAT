// src/server.js
import { fastify } from 'fastify';
import { storageRoutes } from './src/routes/storage-routes.js';

const server = fastify();

// registra as rotas
server.register(storageRoutes);

server.listen({ port: process.env.PORT ?? 3333 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});
