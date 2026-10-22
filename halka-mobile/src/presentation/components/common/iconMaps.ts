// Domain'deki emoji ikonların arayüzdeki tek renk Feather karşılıkları.
// Domain değişmez; görsel dil yalnızca sunum katmanında belirlenir.
import type { AmbientType } from '@domain/entities/Audio';
import type { WidgetId } from '@domain/entities/WidgetId';
import type { IconName } from '@presentation/components/common/Icon';

export const WIDGET_ICONS: Readonly<Record<WidgetId, IconName>> = {
  water: 'droplet',
  pomodoro: 'clock',
  tasks: 'check-square',
  streak: 'link',
  notes: 'edit-3',
  breathing: 'wind',
  mood: 'smile',
  ambient: 'headphones',
  bigOne: 'target',
  budget: 'credit-card',
};

// Günlük özet metrikleri etiketle eşleşir; bilinmeyen etiket nötr ikon alır
const METRIC_ICONS: Readonly<Record<string, IconName>> = {
  Su: 'droplet',
  Odak: 'clock',
  Görevler: 'check-square',
  Zincir: 'zap',
};

export function metricIcon(label: string): IconName {
  return METRIC_ICONS[label] ?? 'activity';
}

export const AMBIENT_ICONS: Readonly<Record<AmbientType, IconName>> = {
  rain: 'cloud-rain',
  focus: 'radio',
  drone: 'moon',
};
