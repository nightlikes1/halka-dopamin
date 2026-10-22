// Potansiyel Karakterim uç noktaları
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, registerAndAuth, type InMemoryHabitRepository } from './fakes.js';

describe('/character', () => {
  let app: FastifyInstance;
  let habits: InMemoryHabitRepository;
  let headers: { authorization: string };

  beforeEach(async () => {
    ({ app, habits } = await createTestApp());
    headers = await registerAndAuth(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const createHabit = async (title: string, auth = headers) => {
    const response = await app.inject({
      method: 'POST',
      url: '/habits',
      headers: auth,
      payload: { kind: 'build', title },
    });
    return response.json<{ habit: { id: string } }>().habit.id;
  };

  const put = (payload: Record<string, unknown>, auth = headers) =>
    app.inject({ method: 'PUT', url: '/character', headers: auth, payload });

  it('oturumsuz erişimi reddeder', async () => {
    expect((await app.inject({ url: '/character' })).statusCode).toBe(401);
  });

  it('karakter yokken null döner', async () => {
    expect((await app.inject({ url: '/character', headers })).json()).toEqual({ character: null });
  });

  it('oluşturur; düzenlerken özellik kimliklerini korur ve sırayı günceller', async () => {
    const read = await createHabit('Kitap');
    const created = await put({
      identity: '  Meraklı ve sakin biri  ',
      traits: [
        { name: 'Meraklı', habitIds: [read, read] },
        { name: 'Sakin', habitIds: [] },
      ],
    });
    expect(created.statusCode).toBe(200);
    const body = created.json<{
      character: { identity: string; traits: { id: string; name: string; habitIds: string[] }[] };
    }>();
    expect(body.character.identity).toBe('Meraklı ve sakin biri');
    // Tekrarlanan bağ tekilleştirilir
    expect(body.character.traits[0]?.habitIds).toEqual([read]);

    const curiousId = body.character.traits[0]?.id;
    const edited = await put({
      identity: 'Meraklı biri',
      traits: [
        { name: 'Sağlıklı', habitIds: [] },
        { id: curiousId, name: 'Meraklı', habitIds: [read] },
      ],
    });
    const traits = edited.json<{ character: { traits: { id: string; order: number }[] } }>()
      .character.traits;
    expect(traits).toHaveLength(2);
    expect(traits[1]).toMatchObject({ id: curiousId, order: 1 });
  });

  it('bağsız özelliklere izin verir (alışkanlık yoksa)', async () => {
    const response = await put({
      identity: 'Sakin biri',
      traits: [{ name: 'Sakin', habitIds: [] }],
    });
    expect(response.statusCode).toBe(200);
  });

  it.each([
    ['boş kimlik', { identity: '  ', traits: [{ name: 'A', habitIds: [] }] }],
    [
      '60 karakteri aşan kimlik',
      { identity: 'a'.repeat(61), traits: [{ name: 'A', habitIds: [] }] },
    ],
    ['özelliksiz', { identity: 'Biri', traits: [] }],
    [
      '5ten fazla özellik',
      {
        identity: 'Biri',
        traits: ['A', 'B', 'C', 'D', 'E', 'F'].map((name) => ({ name, habitIds: [] })),
      },
    ],
    [
      'büyük/küçük harf farkıyla tekrar eden özellik',
      {
        identity: 'Biri',
        traits: [
          { name: 'İyi', habitIds: [] },
          { name: 'iyi', habitIds: [] },
        ],
      },
    ],
  ])('%s reddedilir', async (_label, payload) => {
    expect((await put(payload)).statusCode).toBe(400);
  });

  it('başka kullanıcının veya arşivlenmiş alışkanlığını bağlamaz', async () => {
    const other = await registerAndAuth(app, 'baska@ornek.com');
    const foreign = await createHabit('Başkasının', other);
    const mine = await createHabit('Benim');
    await app.inject({ method: 'DELETE', url: `/habits/${mine}`, headers });

    expect(
      (await put({ identity: 'Biri', traits: [{ name: 'A', habitIds: [foreign] }] })).statusCode,
    ).toBe(400);
    expect(
      (await put({ identity: 'Biri', traits: [{ name: 'A', habitIds: [mine] }] })).statusCode,
    ).toBe(400);
  });

  it('silince yalnızca karakter gider, alışkanlıklar kalır', async () => {
    await createHabit('Kitap');
    await put({ identity: 'Biri', traits: [{ name: 'A', habitIds: [] }] });

    const removed = await app.inject({ method: 'DELETE', url: '/character', headers });
    expect(removed.statusCode).toBe(204);
    expect((await app.inject({ url: '/character', headers })).json()).toEqual({ character: null });
    expect(habits.habits).toHaveLength(1);

    const again = await app.inject({ method: 'DELETE', url: '/character', headers });
    expect(again.statusCode).toBe(404);
  });

  it('avatar ayarını saklar; gönderilmezse korur, null ile otomatiğe döner', async () => {
    const base = { identity: 'Meraklı biri', traits: [{ name: 'Meraklı', habitIds: [] }] };
    const avatarOf = async () =>
      (await app.inject({ url: '/character', headers })).json<{
        character: { avatar: { shape: string; palette: string } | null };
      }>().character.avatar;

    expect((await put(base)).statusCode).toBe(200);
    expect(await avatarOf()).toBeNull();

    expect((await put({ ...base, avatar: { shape: 'flower', palette: 'mor' } })).statusCode).toBe(
      200,
    );
    expect(await avatarOf()).toEqual({ shape: 'flower', palette: 'mor' });

    // Eski istemci avatar göndermeden kaydeder: ayar korunur
    await put(base);
    expect(await avatarOf()).toEqual({ shape: 'flower', palette: 'mor' });

    await put({ ...base, avatar: null });
    expect(await avatarOf()).toBeNull();
  });

  it('bilinmeyen avatar biçimini reddeder', async () => {
    const response = await put({
      identity: 'Meraklı biri',
      traits: [{ name: 'Meraklı', habitIds: [] }],
      avatar: { shape: 'kare', palette: 'mor' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('çizgi karakter görünümünü saklar; gönderilmezse korur, null ile otomatiğe döner', async () => {
    const base = { identity: 'Meraklı biri', traits: [{ name: 'Meraklı', habitIds: [] }] };
    const look = {
      skin: 2,
      face: 'round',
      hair: 'curly',
      hairColor: 5,
      eyes: 'almond',
      brows: 'arched',
      mouth: 'teeth',
      facialHair: 'none',
      glasses: 'round',
      accessory: 'beanie',
      top: 'hoodie',
      topColor: 3,
    };
    const lookOf = async () =>
      (await app.inject({ url: '/character', headers })).json<{
        character: { look: typeof look | null };
      }>().character.look;

    await put(base);
    expect(await lookOf()).toBeNull();
    expect((await put({ ...base, look })).statusCode).toBe(200);
    expect(await lookOf()).toEqual(look);
    await put(base);
    expect(await lookOf()).toEqual(look);
    await put({ ...base, look: null });
    expect(await lookOf()).toBeNull();
  });

  it('DiceBear avatarını saklar; gönderilmezse korur, null ile kendi karakterimize döner', async () => {
    const base = { identity: 'Meraklı biri', traits: [{ name: 'Meraklı', habitIds: [] }] };
    const dicebear = {
      style: 'avataaars',
      options: { top: ['shortFlat'], hairColor: ['2c1b18'], accessoriesProbability: 0 },
    };
    const dicebearOf = async () =>
      (await app.inject({ url: '/character', headers })).json<{
        character: { dicebear: typeof dicebear | null };
      }>().character.dicebear;

    await put(base);
    expect(await dicebearOf()).toBeNull();
    expect((await put({ ...base, dicebear })).statusCode).toBe(200);
    expect(await dicebearOf()).toEqual(dicebear);
    await put(base);
    expect(await dicebearOf()).toEqual(dicebear);
    await put({ ...base, dicebear: null });
    expect(await dicebearOf()).toBeNull();
  });

  it('geçersiz DiceBear avatarını reddeder (bilinmeyen stil, kötü değer, aralık dışı olasılık)', async () => {
    const base = { identity: 'Meraklı biri', traits: [{ name: 'Meraklı', habitIds: [] }] };
    const bad = [
      { style: 'yok-boyle-stil', options: {} },
      { style: 'avataaars', options: { top: ['<script>'] } },
      { style: 'avataaars', options: { topProbability: 150 } },
      { style: 'avataaars', options: { 'kötü anahtar': ['a'] } },
    ];
    for (const dicebear of bad) {
      expect((await put({ ...base, dicebear })).statusCode).toBe(400);
    }
  });

  it('geçersiz görünümü reddeder (bilinmeyen saç, aralık dışı renk)', async () => {
    const base = { identity: 'Meraklı biri', traits: [{ name: 'Meraklı', habitIds: [] }] };
    const look = {
      skin: 0,
      face: 'oval',
      hair: 'short',
      hairColor: 0,
      eyes: 'round',
      brows: 'soft',
      mouth: 'smile',
      facialHair: 'none',
      glasses: 'none',
      accessory: 'none',
      top: 'tee',
      topColor: 0,
    };
    expect((await put({ ...base, look: { ...look, hair: 'dreadlock' } })).statusCode).toBe(400);
    expect((await put({ ...base, look: { ...look, skin: 6 } })).statusCode).toBe(400);
  });
});
