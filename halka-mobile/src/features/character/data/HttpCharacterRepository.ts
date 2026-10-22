// Karakter API istemcisi: DTO doğrulama + try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { toFailure } from '@core/api/httpClient';
import { ServerFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import {
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  type Character,
  type CharacterDraft,
} from '@features/character/domain/entities';
import { isValidDiceBear } from '@features/character/domain/dicebear';
import { isValidLook } from '@features/character/domain/look';
import type { CharacterRepository } from '@features/character/domain/ports';

const characterDtoSchema = z.object({
  id: z.string(),
  identity: z.string(),
  createdAt: z.string(),
  // Eski sunucu alanı göndermez; bilinmeyen değer otomatik sayılır
  avatar: z
    .object({ shape: z.enum(AVATAR_SHAPES), palette: z.enum(AVATAR_PALETTES) })
    .nullable()
    .optional()
    .catch(null),
  // Görünüm alan alan domain kuralıyla doğrulanır; uymuyorsa otomatik
  look: z.unknown().optional(),
  dicebear: z.unknown().optional(),
  traits: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      order: z.number(),
      habitIds: z.array(z.string()),
    }),
  ),
});

const toCharacter = (dto: z.infer<typeof characterDtoSchema>): Character => ({
  ...dto,
  avatar: dto.avatar ?? null,
  look: isValidLook(dto.look) ? dto.look : null,
  dicebear: isValidDiceBear(dto.dicebear) ? dto.dicebear : null,
  traits: [...dto.traits].sort((a, b) => a.order - b.order),
});

const INVALID_RESPONSE = 'Sunucudan beklenmeyen bir yanıt geldi.';

export class HttpCharacterRepository implements CharacterRepository {
  constructor(private readonly http: AxiosInstance) {}

  async get(): AsyncResult<Character | null> {
    try {
      const response = await this.http.get<unknown>('/character');
      const parsed = z
        .object({ character: characterDtoSchema.nullable() })
        .safeParse(response.data);
      if (!parsed.success) return err(new ServerFailure(INVALID_RESPONSE));
      return ok(parsed.data.character ? toCharacter(parsed.data.character) : null);
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async save(draft: CharacterDraft): AsyncResult<Character> {
    try {
      const response = await this.http.put<unknown>('/character', draft);
      const parsed = z.object({ character: characterDtoSchema }).safeParse(response.data);
      return parsed.success
        ? ok(toCharacter(parsed.data.character))
        : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async delete(): AsyncResult<void> {
    try {
      await this.http.delete('/character');
      return okVoid();
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
