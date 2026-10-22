// Yerleşim sabitleri: içerik genişlikleri, ekran kenar boşluğu, dokunma alanı
import { spacing } from '@core/theme/tokens';

export const layout = {
  // Tablet/web'de okunabilir satır uzunluğu için içerik sınırı
  contentMaxWidth: 640,
  // Form ve giriş kartları
  formMaxWidth: 460,
  // Diyaloglar
  dialogMaxWidth: 420,
  // Ekran kenar boşluğu
  screenPadding: spacing.xl,
  // Bölümler ve liste elemanları arası
  sectionGap: spacing.xl,
  listGap: spacing.smd,
  // Alt sekme çubuğu yüksekliği (güvenli alan hariç)
  tabBarHeight: 64,
  // Kaydırılan içeriğin altındaki boşluk (sekme çubuğu ve klavyeden taşmasın)
  screenBottomPadding: spacing.xxxl,
  // Erişilebilir en küçük dokunma alanı (WCAG / platform yönergeleri)
  touchTarget: 44,
} as const;

// Görünen boyutu küçük olan dokunmatik öğeyi 44 px'e tamamlayan hitSlop
export function hitSlopFor(visibleSize: number): number {
  return Math.max(0, Math.ceil((layout.touchTarget - visibleSize) / 2));
}
