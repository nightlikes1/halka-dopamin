// Rehber sağlayıcı sözleşmesi: şimdilik yerel JSON içerik, ileride AI üretimi aynı arayüzü uygular
import type { Guide, GuideCategory, GuideMatch } from '@features/guides/domain/entities';

export interface GuideProvider {
  findGuides(query: string): Promise<readonly GuideMatch[]>;
  getGuide(id: string): Promise<Guide | null>;
  listByCategory(category: GuideCategory): Promise<readonly Guide[]>;
}
