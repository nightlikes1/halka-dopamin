// Tarih yardımcıları (yerel saat dilimine göre)

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TURKISH_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const TURKISH_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export const padTwo = (value: number): string => value.toString().padStart(2, '0');

// Date -> "YYYY-MM-DD" (yerel gün)
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
}

// "YYYY-MM-DD" -> yerel gece yarısı Date
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

// İki gün arasındaki tam gün farkı (to - from)
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / MS_PER_DAY);
}

// Güne n gün ekler
export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

// "14 Ekim 2026, Çarşamba"
export function formatTurkishDate(date: Date): string {
  const dayName = TURKISH_DAYS[date.getDay()] ?? '';
  const monthName = TURKISH_MONTHS[date.getMonth()] ?? '';
  return `${date.getDate()} ${monthName} ${date.getFullYear()}, ${dayName}`;
}

// "Pzt" gibi kısa gün adı
export function formatShortDayName(iso: string): string {
  return TURKISH_DAYS_SHORT[parseIsoDate(iso).getDay()] ?? '';
}

// Pazartesiden başlayan kısa gün adları (takvim başlığı için)
export const WEEKDAY_SHORT_MONDAY_FIRST = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// "Ekim 2026" (month: 1-12)
export function formatMonthYear(year: number, month: number): string {
  return `${TURKISH_MONTHS[month - 1] ?? ''} ${year}`;
}

// "14 Ekim, Çarşamba"
export function formatDayMonth(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} ${TURKISH_MONTHS[date.getMonth()] ?? ''}, ${TURKISH_DAYS[date.getDay()] ?? ''}`;
}

// "Cuma, 16 Ekim"
export function formatWeekdayDayMonth(date: Date): string {
  return `${TURKISH_DAYS[date.getDay()] ?? ''}, ${date.getDate()} ${TURKISH_MONTHS[date.getMonth()] ?? ''}`;
}
