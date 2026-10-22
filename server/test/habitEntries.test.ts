// Gün içinde alışkanlık işaretleme uç noktaları
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, fixedClock, registerAndAuth } from './fakes.js';

// Sunucu saati: 14 Ekim 2026, 20:00 UTC
const NOW = '2026-10-14T20:00:00.000Z';

describe('/habit-entries', () => {
  let app: FastifyInstance;
  let headers: { authorization: string };

  beforeEach(async () => {
    ({ app } = await createTestApp({ clock: fixedClock(NOW) }));
    headers = await registerAndAuth(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const createHabit = async (kind: 'build' | 'quit', title: string, auth = headers) => {
    const response = await app.inject({
      method: 'POST',
      url: '/habits',
      headers: auth,
      payload: { kind, title },
    });
    return response.json<{ habit: { id: string } }>().habit.id;
  };

  const put = (date: string, habitId: string, status: string, auth = headers) =>
    app.inject({
      method: 'PUT',
      url: `/habit-entries/${date}/${habitId}`,
      headers: auth,
      payload: { status },
    });

  it('oturumsuz erişimi reddeder', async () => {
    const response = await app.inject({ url: '/habit-entries?from=2026-10-14&to=2026-10-14' });
    expect(response.statusCode).toBe(401);
  });

  it('işaretler, listeler, günceller ve geri alır', async () => {
    const id = await createHabit('build', 'Kitap oku');

    expect((await put('2026-10-14', id, 'done')).statusCode).toBe(200);
    expect((await put('2026-10-14', id, 'missed')).statusCode).toBe(200);

    const list = await app.inject({ url: '/habit-entries?from=2026-10-14&to=2026-10-14', headers });
    expect(list.json()).toEqual({
      entries: [{ habitId: id, date: '2026-10-14', status: 'missed' }],
    });

    const removed = await app.inject({
      method: 'DELETE',
      url: `/habit-entries/2026-10-14/${id}`,
      headers,
    });
    expect(removed.statusCode).toBe(204);
    const after = await app.inject({
      url: '/habit-entries?from=2026-10-14&to=2026-10-14',
      headers,
    });
    expect(after.json()).toEqual({ entries: [] });
  });

  it('tür ile uyumsuz cevabı reddeder', async () => {
    const id = await createHabit('quit', 'Gece telefon');
    expect((await put('2026-10-14', id, 'done')).statusCode).toBe(400);
  });

  it('bugün/dün penceresi dışını reddeder', async () => {
    const id = await createHabit('build', 'Spor');
    expect((await put('2026-10-10', id, 'done')).statusCode).toBe(400);
  });

  it('başka kullanıcının alışkanlığını işaretleyemez', async () => {
    const id = await createHabit('build', 'Spor');
    const other = await registerAndAuth(app, 'baska@ornek.com');
    expect((await put('2026-10-14', id, 'done', other)).statusCode).toBe(404);
    const removed = await app.inject({
      method: 'DELETE',
      url: `/habit-entries/2026-10-14/${id}`,
      headers: other,
    });
    expect(removed.statusCode).toBe(404);
  });
});
