// Derinlik gölgeyle verilmez (Obsidyen ve Şampanya): yüzey tonları base → elevated → raised kullanılır.
// Eski çağrılar bozulmasın diye API korunur; hepsi boş stil döndürür.
import type { ViewStyle } from 'react-native';

export const elevation = {
  none: {},
  raised: {},
} as const satisfies Record<string, ViewStyle>;

// Işıma kaldırıldı (gölge yok); imza korunur
export function glow(_color: string, _shadowRadius = 0, _shadowOpacity = 0): ViewStyle {
  return {};
}
