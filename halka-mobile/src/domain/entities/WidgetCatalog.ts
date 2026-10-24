// Eklenti kataloğu (statik tanımlar)
import { WIDGET_IDS, type WidgetId } from '@domain/entities/WidgetId';

// Eklenti vurgusu anlam olarak tutulur; rengi sunum katmanı aktif temadan seçer (widgetAccentColor,
// domain tema katmanına bağlanamaz). Seri ödül (altın), diğerleri metin rengi.
export type WidgetAccent = 'reward' | 'neutral';
const ACCENT = { reward: 'reward', neutral: 'neutral' } as const satisfies Record<
  WidgetAccent,
  WidgetAccent
>;

export interface WidgetCatalogItem {
  readonly id: WidgetId;
  readonly name: string;
  readonly category: string;
  readonly icon: string;
  readonly description: string;
  readonly accent: WidgetAccent;
}

export const WIDGET_CATALOG_MAP: Readonly<Record<WidgetId, WidgetCatalogItem>> = {
  water: {
    id: 'water',
    name: 'Su Takibi',
    category: 'Sağlık',
    icon: '💧',
    description: 'Günlük su tüketim hedefini belirle ve tek dokunuşla bardak ekle.',
    accent: ACCENT.neutral,
  },
  pomodoro: {
    id: 'pomodoro',
    name: 'Pomodoro Odak',
    category: 'Üretkenlik',
    icon: '⏱️',
    description: '25 dakikalık derin odaklanma seansları ve mola zamanlayıcısı.',
    accent: ACCENT.neutral,
  },
  tasks: {
    id: 'tasks',
    name: 'Günlük Görevler',
    category: 'Üretkenlik',
    icon: '✅',
    description: 'Bugünün öncelikli yapılacaklar listesi ve ilerleme çubuğu.',
    accent: ACCENT.neutral,
  },
  streak: {
    id: 'streak',
    name: 'Zinciri Kırma',
    category: 'Alışkanlık',
    icon: '⛓️',
    description: 'Her gün tekrarlanan alışkanlıkların ardışık gün zinciri.',
    accent: ACCENT.neutral,
  },
  notes: {
    id: 'notes',
    name: 'Hızlı Not Defteri',
    category: 'Düşünce',
    icon: '📝',
    description: 'Aklına gelen fikirleri anında kaydet, otomatik saklanır.',
    accent: ACCENT.neutral,
  },
  breathing: {
    id: 'breathing',
    name: 'Kutu Nefesi (Zen)',
    category: 'Sağlık & Zihin',
    icon: '🧘',
    description: '4-4-4-4 nefes döngüsüyle kalp ritmini düzenle ve sakinleş.',
    accent: ACCENT.neutral,
  },
  mood: {
    id: 'mood',
    name: 'Ruh Hali & Enerji',
    category: 'Farkındalık',
    icon: '🌟',
    description: 'Günün duygu durumunu ve enerji seviyeni kaydet.',
    accent: ACCENT.neutral,
  },
  ambient: {
    id: 'ambient',
    name: 'Ortam Sesleri',
    category: 'Odak',
    icon: '🎧',
    description: 'Yağmur, pembe gürültü ve derin uzay sesleriyle odaklan.',
    accent: ACCENT.neutral,
  },
  bigOne: {
    id: 'bigOne',
    name: 'Günün Ana Hedefi',
    category: 'Odak',
    icon: '🎯',
    description: 'Bugün ne olursa olsun bitirilmesi gereken 1 numaralı görev.',
    accent: ACCENT.neutral,
  },
  budget: {
    id: 'budget',
    name: 'Günlük Harcama',
    category: 'Finans',
    icon: '💰',
    description: 'Günün harcama limitini ve anlık harcamalarını takip et.',
    accent: ACCENT.neutral,
  },
};

export const WIDGET_CATALOG: readonly WidgetCatalogItem[] = WIDGET_IDS.map(
  (id) => WIDGET_CATALOG_MAP[id],
);

export function getCatalogItem(id: WidgetId): WidgetCatalogItem {
  return WIDGET_CATALOG_MAP[id];
}
