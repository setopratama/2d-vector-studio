// server/routes/prompts.route.ts
import { FastifyInstance } from 'fastify';
import { db } from '../db/client';
import { prompts } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

// Helper to ensure NO base64 or image dataUrl is ever saved to SQLite
function sanitizeImagesForSqlite(images: any[] | undefined): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const stripped = images.map((img) => ({
    version: img.version,
    imagePath: img.imagePath,
    timestamp: img.timestamp,
    costUsd: img.costUsd,
  }));
  return JSON.stringify(stripped);
}

export async function promptsRoutes(fastify: FastifyInstance) {
  // GET /api/prompts - Fetch history
  fastify.get('/api/prompts', async (request, reply) => {
    try {
      const rows = db.select().from(prompts).orderBy(desc(prompts.createdAt)).all();
      // Parse JSON fields
      const formatted = rows.map((r) => ({
        id: r.id,
        batchId: r.batchId,
        variationIndex: r.variationIndex,
        title: r.title,
        rawIdea: r.rawIdea,
        optimizedPrompt: r.optimizedPrompt,
        negativePrompt: r.negativePrompt,
        targetEngine: r.targetEngine,
        aspectRatio: r.aspectRatio,
        stylePreset: r.stylePreset,
        vectorStyle: r.vectorStyle,
        isBlackAndWhite: Boolean(r.isBlackAndWhite),
        activePromptVersionIndex: r.activePromptVersionIndex || 0,
        promptVersions: r.promptVersionsData ? JSON.parse(r.promptVersionsData) : undefined,
        imagePath: r.imagePath,
        allImagePaths: r.allImagePaths ? JSON.parse(r.allImagePaths) : [],
        images: r.imagesData ? JSON.parse(r.imagesData) : [],
        generationCount: r.generationCount,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        totalTokens: (r.inputTokens || 0) + (r.outputTokens || 0),
        promptCostUsd: r.promptCostUsd,
        promptCostIdr: `Rp ${(parseFloat(r.promptCostUsd || '0') * 16000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        imageCostUsd: r.imageCostUsd,
        totalCostUsd: r.totalCostUsd,
        totalCostIdr: `Rp ${(parseFloat(r.totalCostUsd || '0') * 16000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        isFavorite: Boolean(r.isFavorite),
        createdAt: r.createdAt,
      }));
      return formatted;
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/prompts - Upsert single card (Only text metadata, NO image binaries)
  fastify.post('/api/prompts', async (request, reply) => {
    try {
      const body: any = request.body;
      const values = {
        id: body.id,
        batchId: body.batchId || null,
        variationIndex: body.variationIndex || 1,
        title: body.title,
        rawIdea: body.rawIdea,
        optimizedPrompt: body.optimizedPrompt,
        negativePrompt: body.negativePrompt || null,
        targetEngine: body.targetEngine || 'gpt-image',
        aspectRatio: body.aspectRatio || '1:1',
        stylePreset: body.stylePreset || null,
        vectorStyle: body.vectorStyle || null,
        isBlackAndWhite: body.isBlackAndWhite ? true : false,
        activePromptVersionIndex: body.activePromptVersionIndex || 0,
        promptVersionsData: body.promptVersions ? JSON.stringify(body.promptVersions) : null,
        imagePath: body.imagePath || null,
        allImagePaths: body.allImagePaths ? JSON.stringify(body.allImagePaths) : null,
        imagesData: sanitizeImagesForSqlite(body.images),
        generationCount: body.generationCount || 0,
        inputTokens: body.inputTokens || 0,
        outputTokens: body.outputTokens || 0,
        promptCostUsd: body.promptCostUsd || '0.000000',
        imageCostUsd: body.imageCostUsd || '0.000000',
        totalCostUsd: body.totalCostUsd || '0.000000',
        isFavorite: body.isFavorite ? true : false,
        createdAt: body.createdAt || Date.now(),
      };

      db.insert(prompts)
        .values(values)
        .onConflictDoUpdate({
          target: prompts.id,
          set: values,
        })
        .run();

      return { success: true, id: body.id };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/prompts/batch - Bulk upsert cards (Only text metadata, NO image binaries)
  fastify.post('/api/prompts/batch', async (request, reply) => {
    try {
      const items: any[] = (request.body as any)?.items || [];
      for (const body of items) {
        const values = {
          id: body.id,
          batchId: body.batchId || null,
          variationIndex: body.variationIndex || 1,
          title: body.title,
          rawIdea: body.rawIdea,
          optimizedPrompt: body.optimizedPrompt,
          negativePrompt: body.negativePrompt || null,
          targetEngine: body.targetEngine || 'gpt-image',
          aspectRatio: body.aspectRatio || '1:1',
          stylePreset: body.stylePreset || null,
          vectorStyle: body.vectorStyle || null,
          isBlackAndWhite: body.isBlackAndWhite ? true : false,
          activePromptVersionIndex: body.activePromptVersionIndex || 0,
          promptVersionsData: body.promptVersions ? JSON.stringify(body.promptVersions) : null,
          imagePath: body.imagePath || null,
          allImagePaths: body.allImagePaths ? JSON.stringify(body.allImagePaths) : null,
          imagesData: sanitizeImagesForSqlite(body.images),
          generationCount: body.generationCount || 0,
          inputTokens: body.inputTokens || 0,
          outputTokens: body.outputTokens || 0,
          promptCostUsd: body.promptCostUsd || '0.000000',
          imageCostUsd: body.imageCostUsd || '0.000000',
          totalCostUsd: body.totalCostUsd || '0.000000',
          isFavorite: body.isFavorite ? true : false,
          createdAt: body.createdAt || Date.now(),
        };

        db.insert(prompts)
          .values(values)
          .onConflictDoUpdate({
            target: prompts.id,
            set: values,
          })
          .run();
      }

      return { success: true, count: items.length };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/generate-prompt - AI Prompt Expansion via OpenRouter / Custom Endpoint
  fastify.post('/api/generate-prompt', async (request, reply) => {
    try {
      const { generateOptimizedPrompt } = await import('../services/prompt-engine.service');
      const body: any = request.body || {};
      const result = await generateOptimizedPrompt(body, body.model);
      return result;
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/generate-image - AI Image Generation via OpenRouter / Custom Endpoint
  fastify.post('/api/generate-image', async (request, reply) => {
    try {
      const { generateOpenRouterImage, saveGeneratedImagesByDate } = await import('../services/image-generator.service');
      const body: any = request.body || {};
      const prompt = body.prompt;
      if (!prompt) {
        return reply.status(400).send({ error: 'Prompt is required' });
      }
      const rawRes = await generateOpenRouterImage(prompt, body.model);
      const saved = await saveGeneratedImagesByDate(rawRes.data || []);
      return { success: true, images: saved };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/currency/exchange-rate - Daily cached rate from api.co.id with SQLite history
  fastify.get('/api/currency/exchange-rate', async (request, reply) => {
    try {
      const { fetchDailyExchangeRate } = await import('../services/currency.service');
      const rateData = await fetchDailyExchangeRate();
      return rateData;
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/currency/history - List of historical daily rates from SQLite
  fastify.get('/api/currency/history', async (request, reply) => {
    try {
      const { getExchangeRateHistory } = await import('../services/currency.service');
      const history = await getExchangeRateHistory();
      return history;
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // DELETE /api/prompts/:id - Delete prompt
  fastify.delete('/api/prompts/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      db.delete(prompts).where(eq(prompts.id, id)).run();
      return { success: true, deletedId: id };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // DELETE /api/prompts - Clear all
  fastify.delete('/api/prompts', async (request, reply) => {
    try {
      db.delete(prompts).run();
      return { success: true, message: 'All prompts cleared' };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });
}
