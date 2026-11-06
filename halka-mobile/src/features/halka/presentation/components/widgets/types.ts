// Eklenti gövdeleri için ortak tipler
// compact: kart içindeki görünüm, focused: odak ekranındaki geniş görünüm
export type WidgetVariant = 'compact' | 'focused';

export interface WidgetBodyProps {
  readonly variant: WidgetVariant;
}
