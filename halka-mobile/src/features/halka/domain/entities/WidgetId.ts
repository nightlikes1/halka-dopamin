// Halkanın etrafına eklenebilen eklenti kimlikleri
export const WIDGET_IDS = [
  'water',
  'pomodoro',
  'tasks',
  'streak',
  'notes',
  'breathing',
  'mood',
  'ambient',
  'bigOne',
  'budget',
] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

export function isWidgetId(value: string): value is WidgetId {
  return (WIDGET_IDS as readonly string[]).includes(value);
}
