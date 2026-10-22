// Temel tasarım değerleri — "Obsidyen ve Şampanya": sıcak koyu zemin, krem metin, az kullanılan şampanya
// altını (yalnızca ödül anları: seri, yakınlık, rozet, tamamlanma) ve mücevher tonu kategori renkleri.
// Derinlik gölgeyle değil yüzey tonlarıyla verilir: base → elevated → raised. Kenarlıklar en fazla 1 px.
// Tüm renk, boşluk, köşe ve yazı boyutları buradan okunur; bileşenlerde sabit değer yazılmaz.
// İki görsel stil var: "particles" (varsayılan, cam yüzeyler + parçacık efektleri) ve "classic" (opak kartlar);
// ikisi de aynı paleti kullanır. Stil açılışta bir kez seçilir (applyColorScheme).

export type ColorScheme = 'particles' | 'classic';

// Obsidyen ve Şampanya paleti (tasarım spesifikasyonundaki token'lar)
export const obsidian = {
  // Zemin ve yüzeyler (saf siyah kullanılmaz)
  base: '#0B0B0D',
  elevated: '#141416',
  raised: '#1F1E1B',
  borderSubtle: '#2A2824',
  borderStrong: '#3A3732',
  // Metin (saf beyaz kullanılmaz)
  textPrimary: '#EDE8DF',
  textSecondary: '#8A857C',
  textDisabled: '#4A4740',
  // Şampanya altını: yalnızca ödül anları ve ana buton kenarı
  gold: '#C9A96E',
  goldLight: '#E3CB9A',
  goldDark: '#9C7F4C',
  goldMuted: 'rgba(201, 169, 110, 0.12)',
  // Mücevher tonları: kategori/istatistik dolguları (yazı rengi olarak kullanılmaz, kontrast yetersiz)
  ruby: '#9B2C3A',
  sapphire: '#2F4A7A',
  emerald: '#1F5E4A',
  amethyst: '#5B3E7A',
  amber: '#A8743A',
  // Durum
  success: '#5E8C6A',
  warning: '#B8955A',
  error: '#A5524F',
} as const;

// Ana palet (tasarım spesifikasyonundaki adlar)
interface BasePalette {
  readonly background: string; // ekran zemini
  readonly surface: string; // kartlar, modal
  readonly surfaceAlt: string; // pill, input, bar zemini, avatar zemini
  readonly track: string; // ilerleme çubuğu / halkanın boş kısmı
  readonly border: string; // boş daire butonlar, güçlü kenarlık
  readonly navBackground: string;
  readonly navBorder: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textOnAccent: string; // altın/açık dolgu üstündeki yazı ve ikon
  readonly accent: string; // ödül vurgusu (şampanya altını)
  readonly hairline: string; // kart kenarlığı
  readonly overlay: string; // diyalog arkası
  readonly scrim: string; // halka üstündeki panel / çekirdek
}

const PALETTE: BasePalette = {
  background: obsidian.base,
  surface: obsidian.elevated,
  surfaceAlt: obsidian.raised,
  track: obsidian.borderSubtle,
  border: obsidian.borderStrong,
  navBackground: obsidian.elevated,
  navBorder: obsidian.borderSubtle,
  textPrimary: obsidian.textPrimary,
  textSecondary: obsidian.textSecondary,
  textOnAccent: obsidian.base,
  accent: obsidian.gold,
  hairline: obsidian.borderSubtle,
  overlay: 'rgba(11, 11, 13, 0.86)',
  scrim: 'rgba(11, 11, 13, 0.92)',
};

function buildColors(p: BasePalette) {
  return {
    ...p,

    // Şampanya altını tonları
    gold: obsidian.gold,
    goldLight: obsidian.goldLight,
    goldDark: obsidian.goldDark,
    goldMuted: obsidian.goldMuted,

    // Mücevher tonları (dolgu, çubuk, nokta)
    ruby: obsidian.ruby,
    sapphire: obsidian.sapphire,
    emerald: obsidian.emerald,
    amethyst: obsidian.amethyst,
    amber: obsidian.amber,

    // Eski adlar (mevcut ekranlar bunları kullanır) aktif palete bağlı
    bgPrimary: p.background,
    bgSecondary: p.navBackground,
    bgCard: p.surface,
    bgCardPressed: p.surfaceAlt,
    bgInput: p.surfaceAlt,

    // Saydam krem dolgular (koyu yüzey üstünde ince ayrım için)
    fillSubtle: 'rgba(237, 232, 223, 0.04)',
    fillMuted: 'rgba(237, 232, 223, 0.07)',
    fillStrong: 'rgba(237, 232, 223, 0.11)',

    // Cam yüzeyler (parçacık ekranları): saydam sıcak zemin + ince kenarlık
    glass: 'rgba(237, 232, 223, 0.03)',
    glassBorder: 'rgba(237, 232, 223, 0.08)',
    glassStrong: 'rgba(237, 232, 223, 0.13)',
    glassBar: 'rgba(20, 20, 22, 0.86)',
    glassControl: 'rgba(11, 11, 13, 0.6)',
    ink: obsidian.base,

    // Kenarlıklar
    borderGlass: p.hairline,
    borderStrong: p.border,

    // Metin (zemin üzerinde hepsi WCAG AA ≥ 4.5:1; disabled hariç)
    textMain: p.textPrimary,
    textMuted: p.textSecondary,
    textDim: p.textSecondary,
    textDisabled: obsidian.textDisabled,
    textOnLight: p.textOnAccent,

    // Durum: error dolgu/nokta/kenarlık için; danger hata metni (error #A5524F metin olarak 3,1-3,7:1
    // kalıyor, bu yüzden kremle karıştırılmış okunur tonu: ≥ 5,1:1)
    success: obsidian.success,
    warning: obsidian.warning,
    error: obsidian.error,
    danger: '#BB7F7A',
    dangerSoft: 'rgba(165, 82, 79, 0.2)',

    shadow: obsidian.base,
    black: obsidian.base,
    white: obsidian.textPrimary,
  };
}

type Colors = ReturnType<typeof buildColors>;

export const colors: Colors = buildColors(PALETTE);

let activeScheme: ColorScheme = 'particles';

// Ekran modülleri yüklenmeden önce çağrılmalı. İki stil aynı paleti kullanır; fark cam yüzeyler ve
// parçacık efektlerindedir (activeColorScheme ile okunur).
export function applyColorScheme(scheme: ColorScheme): void {
  activeScheme = scheme;
}

export function activeColorScheme(): ColorScheme {
  return activeScheme;
}

// Kategori renkleri ve ikon kutusu zeminleri (ikon kutusu: koyu mücevher zemini + krem ikon)
export type AccentName = 'amber' | 'sapphire' | 'amethyst' | 'ruby' | 'emerald';

export const accentColors: Readonly<Record<AccentName, string>> = {
  amber: obsidian.amber,
  sapphire: obsidian.sapphire,
  amethyst: obsidian.amethyst,
  ruby: obsidian.ruby,
  emerald: obsidian.emerald,
};

// elevated üzerine %35 mücevher tonu (krem ikon bu zeminde ≥ 9:1)
export const accentTints: Readonly<Record<AccentName, string>> = {
  amber: '#483623',
  sapphire: '#1D2739',
  amethyst: '#2D2339',
  ruby: '#431C23',
  emerald: '#182E28',
};

// Sırayla renk dağıtmak için (alışkanlık kartı, özellik çubukları)
export const ACCENT_CYCLE: readonly AccentName[] = [
  'amber',
  'sapphire',
  'amethyst',
  'ruby',
  'emerald',
];
export const accentAt = (index: number): AccentName =>
  ACCENT_CYCLE[index % ACCENT_CYCLE.length] ?? 'amber';

// Dopamin kategorileri: renk tek başına anlam taşımaz, yanında her zaman ikon + etiket olur
export const dopamineColors = {
  cheap: obsidian.ruby,
  quality: obsidian.emerald,
  neutral: obsidian.textSecondary,
} as const;

// Çizgi karakter renkleri (sıra sunucuda saklanır; sona ekle, araya ekleme). Ten ve saç doğal kalır;
// kıyafet ve aksesuar: mücevher tonları + krem, antrasit ve şampanya.
export const avatarColors = {
  skin: ['#FBE3D3', '#F2C9A8', '#E0A97F', '#C28457', '#935E3A', '#5E3B26'],
  hair: ['#1E1B1F', '#4A3426', '#7A5232', '#C08A4F', '#E8C27A', '#B8452F', '#D9D6DF', '#8E7BE8'],
  top: ['#A8743A', '#2F4A7A', '#5B3E7A', '#9B2C3A', '#1F5E4A', '#EDE8DF', '#3A3732', '#C9A96E'],
  outline: '#2A1E1A',
  mouth: '#8E3B3B',
  tongue: '#E07A7A',
  teeth: '#FFFFFF',
  eyeWhite: '#FFFFFF',
  pupil: '#1E1B1F',
  blush: '#FF8A7A',
  lens: '#1A1A22',
} as const;

// Köşe ölçeği: ikon kutusu 14 · küçük kart 18 · liste kartı 20 · büyük kart 28 · pill 999
export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  glass: 16,
  tile: 18,
  lg: 20,
  bar: 22,
  xl: 28,
  full: 9999,
} as const;

// Boşluk ölçeği (4/8 ritmi). Ara değer gerekiyorsa ölçeğe ekle, `spacing.x + 2` yazma.
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  smd: 10, // liste elemanları arası
  md: 12,
  mdl: 14,
  lg: 16,
  lgx: 20,
  xl: 24,
  xxl: 32,
  xxl2: 40,
  xxxl: 48,
} as const;

// Fontlar: ekran başlıkları serif (Cormorant Garamond 500), geri kalan her şey Inter.
// Eski ağırlık adları korunur; ince ağırlıklar (parçacık ekranları) Inter'in hafif kesimlerine bağlı.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  thin: 'Inter_200ExtraLight',
  light: 'Inter_300Light',
  // Rakamlar Inter + tabular-nums (ayrı eş aralıklı font yok)
  mono: 'Inter_500Medium',
  serif: 'CormorantGaramond_500Medium',
} as const;

// Yazı boyutları (en küçük okunabilir boyut 11). Hazır stiller için typography.ts'i kullan.
export const fontSizes = {
  xs: 11,
  tag: 12,
  sm: 13,
  body: 14,
  md: 15,
  cardTitle: 16,
  lg: 18,
  stat: 20,
  xl: 24,
  ringValue: 26,
  greeting: 28,
  xxl: 34,
  display: 44,
  hero: 52,
  timer: 64,
  jumbo: 68,
  // Parçacık ekranları
  particleTitle: 40,
  ringValue58: 58,
  timerXL: 92,
} as const;

// Web'de 1180px altında tek sütun düzene geçiliyordu
export const breakpoints = { tablet: 640, wide: 1180 } as const;
