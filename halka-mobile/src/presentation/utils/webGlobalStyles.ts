// Yalnızca web: React Native stilleriyle verilemeyen birkaç global CSS kuralı.
// Tarayıcı otomatik doldurması alanları açık renge boyamasın, sayfa zemini temayla aynı olsun.
import { Platform } from 'react-native';
import { colors } from '@core/theme/tokens';

const STYLE_ID = 'halka-web-global';
// Kaydırılabilir satır (SwipeToComplete): fareyle sürüklerken metin seçilmesin; seçili metin
// sonraki sürüklemeyi tarayıcının sürükle-bırakına kaptırır
export const SWIPE_ROW_TEST_ID = 'swipe-to-complete';

interface StyleDocument {
  getElementById(id: string): unknown;
  createElement(tag: 'style'): { id: string; textContent: string | null };
  head: { appendChild(node: unknown): unknown };
}

// Renkler çağrı anında okunur (açılışta seçilen görsel stil uygulanmış olur)
const buildCss = () => `
html, body { background-color: ${colors.background}; }
[data-testid="${SWIPE_ROW_TEST_ID}"], [data-testid="${SWIPE_ROW_TEST_ID}"] * { user-select: none; }
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: ${colors.textPrimary};
  -webkit-box-shadow: 0 0 0 1000px ${colors.bgInput} inset;
  caret-color: ${colors.textPrimary};
  transition: background-color 9999s ease-out;
}
`;

// Tema değişince yeniden çağrılır: mevcut etiket güncellenir
export function injectWebGlobalStyles(): void {
  if (Platform.OS !== 'web') return;
  const doc = (globalThis as { document?: StyleDocument }).document;
  if (!doc) return;
  const existing = doc.getElementById(STYLE_ID) as { textContent: string | null } | null;
  if (existing) {
    existing.textContent = buildCss();
    return;
  }
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildCss();
  doc.head.appendChild(style);
}
