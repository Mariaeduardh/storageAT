// server.js (na raiz)
import fastify from 'fastify';
import { storageRoutes } from './src/routes/storage-routes.js';

const server = fastify();

// registra as rotas
server.register(storageRoutes);

const PORT = process.env.PORT ?? 3333;
const HOST = '0.0.0.0';

server.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});
