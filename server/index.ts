// server/index.ts
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { promptsRoutes } from './routes/prompts.route';
import path from 'node:path';
import fs from 'node:fs';

const server = Fastify({
  logger: true,
});

async function main() {
  await server.register(cors, {
    origin: true,
  });

  // Register SQLite prompt CRUD & AI routes
  await server.register(promptsRoutes);

  // Serve generated image outputs from disk (data/outputs/YYYY-MM-DD/img_xxx.png)
  server.get('/outputs/*', async (request, reply) => {
    try {
      const relativePath = (request.params as any)['*'];
      const filePath = path.join(process.cwd(), 'data', 'outputs', relativePath);
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: 'Image not found' });
      }
      const stream = fs.createReadStream(filePath);
      reply.type('image/png');
      return reply.send(stream);
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // Health check endpoint
  server.get('/api/health', async () => {
    return {
      status: 'ok',
      engine: 'Fastify + SQLite (Local)',
      timestamp: Date.now(),
      env: process.env.NODE_ENV || 'development',
    };
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`[Fastify SQLite Server] Listening on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
