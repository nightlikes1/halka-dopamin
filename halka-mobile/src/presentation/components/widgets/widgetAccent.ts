// Eklenti vurgusunun aktif temadaki rengi (vurgu metin olarak da kullanılır: yalnızca okunur tonlar)
import { colors } from '@core/theme/tokens';
import type { WidgetAccent } from '@domain/entities/WidgetCatalog';

export function widgetAccentColor(accent: WidgetAccent): string {
  return accent === 'reward' ? colors.gold : colors.textPrimary;
}
