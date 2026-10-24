// Temel tasarım değerleri — "Obsidyen ve Şampanya": sıcak koyu zemin, krem metin, az kullanılan şampanya
// altını (yalnızca ödül anları: seri, yakınlık, rozet, tamamlanma) ve mücevher tonu kategori renkleri.
// Derinlik gölgeyle değil yüzey tonlarıyla verilir: base → elevated → raised. Kenarlıklar en fazla 1 px.
// Tüm renk, boşluk, köşe ve yazı boyutları buradan okunur; bileşenlerde sabit değer yazılmaz.
// İki görsel stil var: "particles" (varsayılan, cam yüzeyler + parçacık efektleri) ve "classic" (opak kartlar);
// ikisi de aynı paleti kullanır. Stil açılışta bir kez seçilir (applyColorScheme).
// İki renk teması var: "dark" (varsayılan, Obsidyen) ve "light" (Fildişi). Tema da açılışta bir kez
// uygulanır (applyThemeMode); değişince uygulama yeniden yüklenir.

export type ColorScheme = 'particles' | 'classic';
export type ThemeMode = 'dark' | 'light';

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

// Fildişi (açık tema): sıcak krem zemin, koyu mürekkep metin. Altın koyulaştırıldı (metin olarak
// ≥ 4,7:1); mücevher tonları aynı (yalnızca dolgu). Zemin saf krem değil, hafif gri-bej (göz yormasın).
export const ivory = {
  base: '#D3CCC1',
  elevated: '#DDD7CD',
  raised: '#C8C0B3',
  borderSubtle: '#BBB2A3',
  borderStrong: '#A39888',
  textPrimary: '#1D1B18',
  textSecondary: '#4F493F',
  textDisabled: '#8E8679',
  gold: '#5F471C',
  goldLight: '#7D5F2C',
  goldDark: '#463410',
  goldMuted: 'rgba(95, 71, 28, 0.12)',
  error: '#B4544F',
  danger: '#7F322D',
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

// Temaya göre değişen, ana palette olmayan değerler (altın, saydam dolgular, durum renkleri)
interface ThemeExtras {
  readonly gold: string;
  readonly goldLight: string;
  readonly goldDark: string;
  readonly goldMuted: string;
  readonly fillSubtle: string;
  readonly fillMuted: string;
  readonly fillStrong: string;
  readonly glass: string;
  readonly glassBorder: string;
  readonly glassStrong: string;
  readonly glassBar: string;
  readonly glassControl: string;
  readonly textDisabled: string;
  readonly error: string;
  readonly danger: string;
  readonly dangerSoft: string;
}

const EXTRAS: ThemeExtras = {
  gold: obsidian.gold,
  goldLight: obsidian.goldLight,
  goldDark: obsidian.goldDark,
  goldMuted: obsidian.goldMuted,
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
  textDisabled: obsidian.textDisabled,
  // error dolgu/nokta/kenarlık için; danger hata metni (error #A5524F metin olarak 3,1-3,7:1
  // kalıyor, bu yüzden kremle karıştırılmış okunur tonu: ≥ 5,1:1)
  error: obsidian.error,
  danger: '#BB7F7A',
  dangerSoft: 'rgba(165, 82, 79, 0.2)',
};

const LIGHT_PALETTE: BasePalette = {
  background: ivory.base,
  surface: ivory.elevated,
  surfaceAlt: ivory.raised,
  track: ivory.borderSubtle,
  border: ivory.borderStrong,
  navBackground: ivory.elevated,
  navBorder: ivory.borderSubtle,
  textPrimary: ivory.textPrimary,
  textSecondary: ivory.textSecondary,
  textOnAccent: ivory.elevated,
  accent: ivory.gold,
  hairline: ivory.borderSubtle,
  overlay: 'rgba(211, 204, 193, 0.86)',
  scrim: 'rgba(211, 204, 193, 0.92)',
};

const LIGHT_EXTRAS: ThemeExtras = {
  gold: ivory.gold,
  goldLight: ivory.goldLight,
  goldDark: ivory.goldDark,
  goldMuted: ivory.goldMuted,
  // Saydam mürekkep dolgular (açık yüzey üstünde ince ayrım için)
  fillSubtle: 'rgba(29, 27, 24, 0.04)',
  fillMuted: 'rgba(29, 27, 24, 0.07)',
  fillStrong: 'rgba(29, 27, 24, 0.11)',
  glass: 'rgba(29, 27, 24, 0.03)',
  glassBorder: 'rgba(29, 27, 24, 0.09)',
  glassStrong: 'rgba(29, 27, 24, 0.12)',
  glassBar: 'rgba(221, 215, 205, 0.9)',
  glassControl: 'rgba(211, 204, 193, 0.7)',
  textDisabled: ivory.textDisabled,
  // danger açık zeminlerde ≥ 4,7:1
  error: ivory.error,
  danger: ivory.danger,
  dangerSoft: 'rgba(180, 84, 79, 0.14)',
};

function buildColors(p: BasePalette, x: ThemeExtras) {
  return {
    ...p,

    // Şampanya altını tonları
    gold: x.gold,
    goldLight: x.goldLight,
    goldDark: x.goldDark,
    goldMuted: x.goldMuted,

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

    // Saydam dolgular ve cam yüzeyler
    fillSubtle: x.fillSubtle,
    fillMuted: x.fillMuted,
    fillStrong: x.fillStrong,
    glass: x.glass,
    glassBorder: x.glassBorder,
    glassStrong: x.glassStrong,
    glassBar: x.glassBar,
    glassControl: x.glassControl,
    // Zemin tonu: tam ekran zemin ve altın/krem dolgu üstündeki ikon
    ink: p.background,

    // Kenarlıklar
    borderGlass: p.hairline,
    borderStrong: p.border,

    // Metin (zemin üzerinde hepsi WCAG AA ≥ 4.5:1; disabled hariç)
    textMain: p.textPrimary,
    textMuted: p.textSecondary,
    textDim: p.textSecondary,
    textDisabled: x.textDisabled,
    textOnLight: p.textOnAccent,

    // Durum
    success: obsidian.success,
    warning: obsidian.warning,
    error: x.error,
    danger: x.danger,
    dangerSoft: x.dangerSoft,

    shadow: p.background,
    black: p.background,
    white: p.textPrimary,
  };
}

type Colors = ReturnType<typeof buildColors>;

export const colors: Colors = buildColors(PALETTE, EXTRAS);

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

// Koyu: elevated üzerine %35 mücevher tonu (krem ikon bu zeminde ≥ 9:1)
const DARK_ACCENT_TINTS: Readonly<Record<AccentName, string>> = {
  amber: '#483623',
  sapphire: '#1D2739',
  amethyst: '#2D2339',
  ruby: '#431C23',
  emerald: '#182E28',
};

// Açık: elevated üzerine %20 mücevher tonu (koyu ikon bu zeminde ≥ 8,9:1)
const LIGHT_ACCENT_TINTS: Readonly<Record<AccentName, string>> = {
  amber: '#D2C3B0',
  sapphire: '#BABBBC',
  amethyst: '#C3B8BC',
  ruby: '#D0B5B0',
  emerald: '#B7BFB3',
};

// Aktif temanın ikon kutusu zeminleri (applyThemeMode günceller)
export const accentTints: Readonly<Record<AccentName, string>> = { ...DARK_ACCENT_TINTS };

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
export const dopamineColors: {
  readonly cheap: string;
  readonly quality: string;
  readonly neutral: string;
} = {
  cheap: obsidian.ruby,
  quality: obsidian.emerald,
  neutral: obsidian.textSecondary,
};

let activeTheme: ThemeMode = 'dark';

// Ekran modülleri yüklenmeden önce çağrılmalı (StyleSheet'ler renkleri yüklenirken okur). Nesneler
// yerinde güncellenir; onları import eden modüller aynı nesneyi görür.
export function applyThemeMode(mode: ThemeMode): void {
  activeTheme = mode;
  const light = mode === 'light';
  Object.assign(
    colors,
    light ? buildColors(LIGHT_PALETTE, LIGHT_EXTRAS) : buildColors(PALETTE, EXTRAS),
  );
  Object.assign(accentTints, light ? LIGHT_ACCENT_TINTS : DARK_ACCENT_TINTS);
  Object.assign(dopamineColors, {
    neutral: light ? ivory.textSecondary : obsidian.textSecondary,
  });
}

export function activeThemeMode(): ThemeMode {
  return activeTheme;
}

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
