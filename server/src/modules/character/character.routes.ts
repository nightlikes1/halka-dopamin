// /character uç noktaları (oturum gerekli)
import type { FastifyInstance } from 'fastify';
import { badRequest, notFound } from '../../core/errors.js';
import type { HabitRepository } from '../habits/habit.repository.js';
import type { CharacterRepository } from './character.repository.js';
import { saveCharacterBodySchema } from './character.schemas.js';

interface CharacterRoutesOptions {
  readonly characters: CharacterRepository;
  readonly habits: HabitRepository;
}

export async function characterRoutes(
  app: FastifyInstance,
  { characters, habits }: CharacterRoutesOptions,
): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/character', async (request) => ({
    character: await characters.get(request.user.sub),
  }));

  // Oluşturur veya düzenler (tek işlem)
  app.put('/character', async (request) => {
    const input = saveCharacterBodySchema.parse(request.body);
    // Yalnızca kullanıcının aktif alışkanlıkları bağlanabilir
    const activeIds = new Set((await habits.listActive(request.user.sub)).map((h) => h.id));
    const unknown = input.traits.some((trait) => trait.habitIds.some((id) => !activeIds.has(id)));
    if (unknown) throw badRequest('Bağlanan alışkanlıklardan biri bulunamadı.');
    return { character: await characters.save(request.user.sub, input) };
  });

  app.delete('/character', async (request, reply) => {
    if (!(await characters.delete(request.user.sub))) throw notFound('Karakter bulunamadı.');
    return reply.status(204).send();
  });
}
