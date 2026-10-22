// Tüm uygulama verisini tek JSON anahtarında tutan yerel veri kaynağı.
// Bellek içi önbellek + sıralı yazma kuyruğu ile yarış durumları önlenir.
import { STORAGE_KEY } from '@core/constants/storage';
import type { KeyValueStorage } from '@data/datasources/KeyValueStorage';
import type { HalkaStorageDto } from '@data/dto/HalkaStorageDto';
import { parseStorageDto } from '@data/dto/parseStorageDto';

export class HalkaLocalDataSource {
  private cache: HalkaStorageDto | null = null;
  private loading: Promise<HalkaStorageDto> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly createDefault: () => HalkaStorageDto,
  ) {}

  // Depolama hatasında hata fırlatır (repository yakalar)
  async read(): Promise<HalkaStorageDto> {
    if (this.cache) return this.cache;
    if (!this.loading) {
      this.loading = this.load().finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  // Değişikliği önbelleğe uygular ve sıraya alıp diske yazar
  async update(mutate: (current: HalkaStorageDto) => HalkaStorageDto): Promise<void> {
    // İlk yüklemeyi bekle; mutasyon await sonrası EN GÜNCEL önbelleğe senkron uygulanır,
    // böylece eşzamanlı güncellemeler birbirinin değişikliğini ezmez
    const loaded = await this.read();
    const next = mutate(this.cache ?? loaded);
    this.cache = next;
    const serialized = JSON.stringify(next);
    // Önceki yazma hatası sonraki yazmaları engellemesin
    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(() => this.storage.setItem(STORAGE_KEY, serialized));
    await this.writeQueue;
  }

  private async load(): Promise<HalkaStorageDto> {
    const fallback = this.createDefault();
    const text = await this.storage.getItem(STORAGE_KEY);
    let dto = fallback;
    if (text !== null) {
      try {
        const raw: unknown = JSON.parse(text);
        dto = parseStorageDto(raw, fallback);
      } catch {
        // Bozuk JSON: varsayılanlarla devam edilir, ilk yazmada düzelir
        dto = fallback;
      }
    }
    this.cache = dto;
    return dto;
  }
}
