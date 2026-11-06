// Anahtar başına deneme sayacı (bellekte). @fastify/rate-limit her isteği sayar; başarısız giriş gibi
// sonucu sonradan belli olan denemeler ve e-posta başına sınır için bu kullanılır.
import { tooManyRequests } from '../../core/errors.js';
import type { Clock } from '../../core/dates.js';

interface AttemptWindow {
  count: number;
  readonly resetsAt: number;
}

// Rastgele anahtar yağmuru belleği doldurmasın
const MAX_TRACKED_KEYS = 10_000;

export class AttemptLimiter {
  private readonly windows = new Map<string, AttemptWindow>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly clock: Clock,
  ) {}

  // Anahtarlardan biri bile sınırdaysa 429 fırlatır
  assertAllowed(keys: readonly string[]): void {
    const now = this.clock.now().getTime();
    for (const key of keys) {
      const current = this.windows.get(key);
      if (current && current.resetsAt > now && current.count >= this.max) {
        throw tooManyRequests(Math.ceil((current.resetsAt - now) / 1000));
      }
    }
  }

  hit(keys: readonly string[]): void {
    const now = this.clock.now().getTime();
    for (const key of keys) {
      const current = this.windows.get(key);
      if (current && current.resetsAt > now) current.count += 1;
      else this.start(key, now);
    }
  }

  // Sayılmaması gereken bir denemeyi geri alır
  undo(key: string): void {
    const current = this.windows.get(key);
    if (current) current.count = Math.max(0, current.count - 1);
  }

  clear(key: string): void {
    this.windows.delete(key);
  }

  private start(key: string, now: number): void {
    // Süresi dolan kayıt silinir: Map en eski eklenenden başlar, yeniden eklenen sona geçer
    this.windows.delete(key);
    if (this.windows.size >= MAX_TRACKED_KEYS) this.evict(now);
    this.windows.set(key, { count: 1, resetsAt: now + this.windowMs });
  }

  private evict(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetsAt <= now) this.windows.delete(key);
    }
    const oldest = this.windows.keys().next();
    if (this.windows.size >= MAX_TRACKED_KEYS && !oldest.done) this.windows.delete(oldest.value);
  }
}
