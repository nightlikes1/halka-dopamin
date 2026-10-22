// Alışkanlık, akşam check-in ve gün notu uç noktaları
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, fixedClock, registerAndAuth } from './fakes.js';

// Sunucu saati: 14 Ekim 2026, 20:00 UTC
const NOW = '2026-10-14T20:00:00.000Z';

describe('Alışkanlıklar, check-in ve gün notları', () => {
  let app: FastifyInstance;
  let headers: { authorization: string };

  beforeEach(async () => {
    ({ app } = await createTestApp({ clock: fixedClock(NOW) }));
    headers = await registerAndAuth(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const createHabit = async (kind: 'build' | 'quit', title: string) => {
    const response = await app.inject({
      method: 'POST',
      url: '/habits',
      headers,
      payload: { kind, title },
    });
    return response.json<{ habit: { id: string } }>().habit.id;
  };

  const putCheckIn = (date: string, payload: Record<string, unknown>, auth = headers) =>
    app.inject({ method: 'PUT', url: `/checkins/${date}`, headers: auth, payload });

  describe('/habits', () => {
    it('oturumsuz erişimi reddeder', async () => {
      expect((await app.inject({ url: '/habits' })).statusCode).toBe(401);
    });

    it('ekler, listeler ve arşivleyince listeden çıkarır', async () => {
      const id = await createHabit('build', 'Günde 20 sayfa kitap');
      await createHabit('quit', 'Gece telefonda gezinmek');

      const list = await app.inject({ url: '/habits', headers });
      expect(list.json<{ habits: unknown[] }>().habits).toHaveLength(2);
      expect(list.json()).toMatchObject({
        habits: [{ kind: 'build', target: { type: 'daily' } }, { kind: 'quit' }],
      });

      const removed = await app.inject({ method: 'DELETE', url: `/habits/${id}`, headers });
      expect(removed.statusCode).toBe(204);
      const after = await app.inject({ url: '/habits', headers });
      expect(after.json<{ habits: unknown[] }>().habits).toHaveLength(1);
    });

    it('aynı adı (büyük/küçük harf farkıyla da) ikinci kez eklemez; arşivlenen ad yeniden eklenebilir', async () => {
      const id = await createHabit('build', 'Kitap oku');
      const post = (title: string) =>
        app.inject({ method: 'POST', url: '/habits', headers, payload: { kind: 'quit', title } });
      expect((await post('  KİTAP OKU ')).statusCode).toBe(409);
      // Başka kullanıcı aynı adı kullanabilir
      const other = await registerAndAuth(app, 'baska2@ornek.com');
      const otherPost = await app.inject({
        method: 'POST',
        url: '/habits',
        headers: other,
        payload: { kind: 'build', title: 'Kitap oku' },
      });
      expect(otherPost.statusCode).toBe(201);
      await app.inject({ method: 'DELETE', url: `/habits/${id}`, headers });
      expect((await post('Kitap oku')).statusCode).toBe(201);
    });

    it('boş başlığı reddeder', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/habits',
        headers,
        payload: { kind: 'build', title: '   ' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('başka kullanıcının alışkanlığını arşivleyemez', async () => {
      const id = await createHabit('build', 'Spor');
      const other = await registerAndAuth(app, 'baska@ornek.com');

      const response = await app.inject({
        method: 'DELETE',
        url: `/habits/${id}`,
        headers: other,
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('/checkins', () => {
    it('kaydeder; aynı gün tekrar gönderilince günceller (düzenleme modu)', async () => {
      const read = await createHabit('build', 'Kitap');
      const phone = await createHabit('quit', 'Gece telefon');

      const first = await putCheckIn('2026-10-14', {
        rating: 2,
        entries: [
          { habitId: read, status: 'missed' },
          { habitId: phone, status: 'slip' },
        ],
      });
      expect(first.statusCode).toBe(200);

      const second = await putCheckIn('2026-10-14', {
        rating: 4,
        entries: [{ habitId: read, status: 'done' }],
      });
      const body = second.json<{
        checkIn: { rating: number; completedAt: string; entries: unknown[] };
      }>();
      expect(body.checkIn.rating).toBe(4);
      expect(body.checkIn.entries).toEqual([{ habitId: read, status: 'done' }]);
      // İlk tamamlanma zamanı korunur
      expect(body.checkIn.completedAt).toBe(
        first.json<{ checkIn: { completedAt: string } }>().checkIn.completedAt,
      );

      const fetched = await app.inject({ url: '/checkins/2026-10-14', headers });
      expect(fetched.json()).toMatchObject({ checkIn: { rating: 4 } });
    });

    it('kaydı olmayan gün için null döner', async () => {
      const response = await app.inject({ url: '/checkins/2026-10-13', headers });
      expect(response.json()).toEqual({ checkIn: null });
    });

    it('türle uyumsuz cevabı reddeder (iyi alışkanlığa "slip")', async () => {
      const read = await createHabit('build', 'Kitap');

      const response = await putCheckIn('2026-10-14', {
        rating: 3,
        entries: [{ habitId: read, status: 'slip' }],
      });
      expect(response.statusCode).toBe(400);
    });

    it('başka kullanıcının alışkanlığıyla cevap kabul etmez', async () => {
      const read = await createHabit('build', 'Kitap');
      const other = await registerAndAuth(app, 'baska@ornek.com');

      const response = await putCheckIn(
        '2026-10-14',
        { rating: 3, entries: [{ habitId: read, status: 'done' }] },
        other,
      );
      expect(response.statusCode).toBe(400);
    });

    it('pencere dışındaki günleri reddeder, dünü kabul eder', async () => {
      expect((await putCheckIn('2026-10-13', { rating: 3, entries: [] })).statusCode).toBe(200);
      expect((await putCheckIn('2026-10-01', { rating: 3, entries: [] })).statusCode).toBe(400);
      expect((await putCheckIn('2026-10-20', { rating: 3, entries: [] })).statusCode).toBe(400);
    });

    it('puan 1-5 dışındaysa ve tarih geçersizse 400 döner', async () => {
      expect((await putCheckIn('2026-10-14', { rating: 6, entries: [] })).statusCode).toBe(400);
      expect((await putCheckIn('2026-02-30', { rating: 3, entries: [] })).statusCode).toBe(400);
    });

    it('aralığı listeler', async () => {
      await putCheckIn('2026-10-13', { rating: 3, entries: [] });
      await putCheckIn('2026-10-14', { rating: 5, entries: [] });

      const response = await app.inject({
        url: '/checkins?from=2026-10-01&to=2026-10-31',
        headers,
      });
      expect(response.json<{ checkIns: unknown[] }>().checkIns).toHaveLength(2);
    });
  });

  describe('/day-notes', () => {
    it('ekler, düzenler, listeler ve siler', async () => {
      const put = (text: string) =>
        app.inject({
          method: 'PUT',
          url: '/day-notes/2026-10-10',
          headers,
          payload: { text },
        });

      expect((await put('  Gece geç yattım.  ')).json()).toMatchObject({
        note: { date: '2026-10-10', text: 'Gece geç yattım.' },
      });
      await put('Gece geç yattım, sabah zor kalktım.');

      const list = await app.inject({ url: '/day-notes?from=2026-10-01&to=2026-10-31', headers });
      expect(list.json()).toMatchObject({
        notes: [{ text: 'Gece geç yattım, sabah zor kalktım.' }],
      });

      const removed = await app.inject({
        method: 'DELETE',
        url: '/day-notes/2026-10-10',
        headers,
      });
      expect(removed.statusCode).toBe(204);
      const again = await app.inject({
        method: 'DELETE',
        url: '/day-notes/2026-10-10',
        headers,
      });
      expect(again.statusCode).toBe(404);
    });

    it('280 karakteri aşan notu ve gelecek günü reddeder', async () => {
      const tooLong = await app.inject({
        method: 'PUT',
        url: '/day-notes/2026-10-14',
        headers,
        payload: { text: 'a'.repeat(281) },
      });
      const future = await app.inject({
        method: 'PUT',
        url: '/day-notes/2026-10-25',
        headers,
        payload: { text: 'Henüz olmadı' },
      });

      expect(tooLong.statusCode).toBe(400);
      expect(future.statusCode).toBe(400);
    });

    it('62 günden uzun aralığı reddeder', async () => {
      const response = await app.inject({
        url: '/day-notes?from=2026-01-01&to=2026-12-31',
        headers,
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
