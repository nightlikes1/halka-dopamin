// Karakter veri erişimi: arayüz + Prisma implementasyonu
import { Prisma, type PrismaClient } from '../../db/prisma.js';
import {
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  type AvatarDto,
  type CharacterDto,
  type DicebearDto,
  dicebearSchema,
  type LookDto,
  lookSchema,
  type SaveCharacterInput,
} from './character.schemas.js';

// Veritabanındaki serbest metni bilinen seçeneklere daraltır (bilinmeyen değer = otomatik)
function toAvatar(shape: string | null, palette: string | null): AvatarDto | null {
  const knownShape = AVATAR_SHAPES.find((value) => value === shape);
  const knownPalette = AVATAR_PALETTES.find((value) => value === palette);
  return knownShape && knownPalette ? { shape: knownShape, palette: knownPalette } : null;
}

// Saklanan JSON şemaya uymuyorsa (eski/bozuk) otomatik görünüme düşer
function toLook(value: unknown): LookDto | null {
  const parsed = lookSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function toDicebear(value: unknown): DicebearDto | null {
  const parsed = dicebearSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

// Prisma Json alanında null, SQL NULL olarak yazılmalı
const lookValue = (look: LookDto | null | undefined) => look ?? Prisma.DbNull;
const dicebearValue = (avatar: DicebearDto | null | undefined) => avatar ?? Prisma.DbNull;

export interface CharacterRepository {
  get(userId: string): Promise<CharacterDto | null>;
  // Kimliği ve özellik kümesini tamamen yeniler (gönderilmeyen özellikler silinir)
  save(userId: string, input: SaveCharacterInput): Promise<CharacterDto>;
  // Yalnızca karakter ve özellikleri silinir; alışkanlıklar ve check-in'ler korunur
  delete(userId: string): Promise<boolean>;
}

export class PrismaCharacterRepository implements CharacterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(userId: string): Promise<CharacterDto | null> {
    const row = await this.prisma.character.findUnique({
      where: { userId },
      include: {
        traits: {
          orderBy: { sortOrder: 'asc' },
          // Arşivlenmiş alışkanlık bağları gösterilmez (silinmiş alışkanlık)
          include: {
            habits: { where: { habit: { archivedAt: null } }, select: { habitId: true } },
          },
        },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      identity: row.identity,
      createdAt: row.createdAt.toISOString(),
      avatar: toAvatar(row.avatarShape, row.avatarPalette),
      look: toLook(row.avatarLook),
      dicebear: toDicebear(row.avatarDicebear),
      traits: row.traits.map((trait) => ({
        id: trait.id,
        name: trait.name,
        order: trait.sortOrder,
        habitIds: trait.habits.map((link) => link.habitId),
      })),
    };
  }

  async save(userId: string, input: SaveCharacterInput): Promise<CharacterDto> {
    await this.prisma.$transaction(async (tx) => {
      const character = await tx.character.upsert({
        where: { userId },
        create: {
          userId,
          identity: input.identity,
          avatarShape: input.avatar?.shape ?? null,
          avatarPalette: input.avatar?.palette ?? null,
          avatarLook: lookValue(input.look),
          avatarDicebear: dicebearValue(input.dicebear),
        },
        update: {
          identity: input.identity,
          // avatar gönderilmediyse dokunulmaz
          ...(input.avatar === undefined
            ? {}
            : {
                avatarShape: input.avatar?.shape ?? null,
                avatarPalette: input.avatar?.palette ?? null,
              }),
          ...(input.look === undefined ? {} : { avatarLook: lookValue(input.look) }),
          ...(input.dicebear === undefined
            ? {}
            : { avatarDicebear: dicebearValue(input.dicebear) }),
        },
        select: { id: true },
      });

      // Yalnızca bu karaktere ait özellik kimlikleri korunabilir
      const existing = await tx.trait.findMany({
        where: { characterId: character.id },
        select: { id: true },
      });
      const ownIds = new Set(existing.map((trait) => trait.id));
      const keptIds = input.traits
        .map((trait) => trait.id)
        .filter((id): id is string => id !== undefined && ownIds.has(id));
      await tx.trait.deleteMany({ where: { characterId: character.id, id: { notIn: keptIds } } });

      for (const [index, trait] of input.traits.entries()) {
        const data = { name: trait.name, sortOrder: index };
        const traitId =
          trait.id && ownIds.has(trait.id)
            ? (await tx.trait.update({ where: { id: trait.id }, data, select: { id: true } })).id
            : (
                await tx.trait.create({
                  data: { ...data, characterId: character.id },
                  select: { id: true },
                })
              ).id;
        await tx.habitTrait.deleteMany({ where: { traitId } });
        if (trait.habitIds.length > 0) {
          await tx.habitTrait.createMany({
            data: trait.habitIds.map((habitId) => ({ habitId, traitId })),
          });
        }
      }
    });

    const saved = await this.get(userId);
    if (!saved) throw new Error('Karakter kaydedildi ama okunamadı.');
    return saved;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.prisma.character.deleteMany({ where: { userId } });
    return result.count > 0;
  }
}
