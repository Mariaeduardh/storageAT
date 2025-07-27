import fastify from 'fastify';
import { storageRoutes } from './src/routes/storage-routes.js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import cors from '@fastify/cors';

dotenv.config();

const server = fastify();

// ✅ Habilita CORS para Netlify, localhost e Live Server
await server.register(cors, {
  origin: [
    'https://storageat.netlify.app', 
    'http://localhost:3333',   
    'http://127.0.0.1:5500',        
    'http://127.0.0.1:5501'    
  ]      
});

const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false,
  }
});

server.decorate('sql', sql);

// Registra as rotas
server.register(storageRoutes);

// Inicia o servidor
const PORT = Number(process.env.PORT) || Number(process.env.LOCAL_PORT) || 3333;
const HOST = '0.0.0.0';

server.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});
