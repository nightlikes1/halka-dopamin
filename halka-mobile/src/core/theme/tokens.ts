// Temel tasarım değerleri. Tüm renk, boşluk, köşe ve yazı boyutları buradan okunur; bileşenlerde sabit
// değer yazılmaz. Üç eksen var:
// - Tema ailesi: "obsidian" (Obsidyen ve Şampanya: sıcak koyu zemin, krem metin, altın yalnız ödülde,
//   gradyan yok) ve "halka" (yeni tasarım: saf siyah / açık gri zemin, turuncu ödül, modül renkleri,
//   turuncu→pembe→mor gradyanlar). iPhone'da varsayılan "halka".
// - Mod: "dark" / "light" (tercih "system" ise telefonun ayarından çözülür).
// - Görsel stil: "particles" (cam yüzeyler; Obsidyen'de parçacıklar, Halka'da Liquid Glass renk lekeleri)
//   ve "classic" (opak kartlar). Stil açılışta bir kez seçilir (applyColorScheme).
// Aile ve mod uygulama yeniden yüklenmeden değişir (applyTheme): nesneler yerinde güncellenir.

export type ColorScheme = 'particles' | 'classic';
export type ThemeMode = 'dark' | 'light';
export type ThemeFamily = 'obsidian' | 'halka';

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

// Halka (yeni tasarım) koyu: saf siyah zemin, iOS sistem grisi yüzeyler, beyaz metin, turuncu ödül
export const halkaDark = {
  base: '#000000',
  elevated: '#1C1C1E',
  raised: '#2C2C2E',
  track: '#333336',
  borderSubtle: '#38383A',
  borderStrong: '#48484A',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textDisabled: '#48484A',
  reward: '#FF9F0A',
  rewardLight: '#FFB340',
  rewardDark: '#C93400',
  error: '#FF453A',
} as const;

// Halka aydınlık: açık gri zemin, beyaz kart, lacivert metin; tonlar okunurluk için koyulaşır (AA)
export const halkaLight = {
  base: '#F2F2F7',
  elevated: '#FFFFFF',
  raised: '#E5E5EA',
  track: '#E5E5EA',
  borderSubtle: '#D1D1D6',
  borderStrong: '#C7C7CC',
  textPrimary: '#1B1F3B',
  textSecondary: '#6C6C70',
  textDisabled: '#AEAEB2',
  reward: '#C93400',
  rewardLight: '#E0620A',
  rewardDark: '#A02B00',
  error: '#D70015',
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
  readonly iconOnTint: string; // renkli ikon kutusundaki ikon
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
  iconOnTint: obsidian.textPrimary,
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
  iconOnTint: ivory.textPrimary,
};

const HALKA_DARK_PALETTE: BasePalette = {
  background: halkaDark.base,
  surface: halkaDark.elevated,
  surfaceAlt: halkaDark.raised,
  track: halkaDark.track,
  border: halkaDark.borderStrong,
  navBackground: halkaDark.elevated,
  navBorder: halkaDark.borderSubtle,
  textPrimary: halkaDark.textPrimary,
  textSecondary: halkaDark.textSecondary,
  textOnAccent: '#FFFFFF',
  accent: halkaDark.reward,
  hairline: halkaDark.borderSubtle,
  overlay: 'rgba(0, 0, 0, 0.8)',
  scrim: 'rgba(0, 0, 0, 0.9)',
};

const HALKA_DARK_EXTRAS: ThemeExtras = {
  // Halka'da "altın" adları turuncu ödül rengine bağlıdır
  gold: halkaDark.reward,
  goldLight: halkaDark.rewardLight,
  goldDark: halkaDark.rewardDark,
  goldMuted: 'rgba(255, 159, 10, 0.16)',
  fillSubtle: 'rgba(255, 255, 255, 0.04)',
  fillMuted: 'rgba(255, 255, 255, 0.08)',
  fillStrong: 'rgba(255, 255, 255, 0.12)',
  glass: 'rgba(255, 255, 255, 0.07)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassStrong: 'rgba(255, 255, 255, 0.18)',
  glassBar: 'rgba(28, 28, 30, 0.82)',
  glassControl: 'rgba(0, 0, 0, 0.5)',
  textDisabled: halkaDark.textDisabled,
  error: halkaDark.error,
  danger: halkaDark.error,
  dangerSoft: 'rgba(255, 69, 58, 0.2)',
  iconOnTint: '#FFFFFF',
};

const HALKA_LIGHT_PALETTE: BasePalette = {
  background: halkaLight.base,
  surface: halkaLight.elevated,
  surfaceAlt: halkaLight.raised,
  track: halkaLight.track,
  border: halkaLight.borderStrong,
  navBackground: halkaLight.elevated,
  navBorder: halkaLight.borderSubtle,
  textPrimary: halkaLight.textPrimary,
  textSecondary: halkaLight.textSecondary,
  textOnAccent: '#FFFFFF',
  accent: halkaLight.reward,
  hairline: halkaLight.borderSubtle,
  overlay: 'rgba(242, 242, 247, 0.86)',
  scrim: 'rgba(242, 242, 247, 0.92)',
};

const HALKA_LIGHT_EXTRAS: ThemeExtras = {
  gold: halkaLight.reward,
  goldLight: halkaLight.rewardLight,
  goldDark: halkaLight.rewardDark,
  goldMuted: 'rgba(201, 52, 0, 0.1)',
  fillSubtle: 'rgba(27, 31, 59, 0.04)',
  fillMuted: 'rgba(27, 31, 59, 0.07)',
  fillStrong: 'rgba(27, 31, 59, 0.11)',
  glass: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.9)',
  glassStrong: 'rgba(255, 255, 255, 0.78)',
  glassBar: 'rgba(255, 255, 255, 0.86)',
  glassControl: 'rgba(242, 242, 247, 0.7)',
  textDisabled: halkaLight.textDisabled,
  error: halkaLight.error,
  danger: halkaLight.error,
  dangerSoft: 'rgba(215, 0, 21, 0.1)',
  iconOnTint: '#FFFFFF',
};

// Kategori dolguları (mücevher adları korunur; Halka'da canlı karşılıkları)
interface JewelSet {
  readonly ruby: string;
  readonly sapphire: string;
  readonly emerald: string;
  readonly amethyst: string;
  readonly amber: string;
  readonly success: string;
  readonly warning: string;
}

const OBSIDIAN_JEWELS: JewelSet = {
  ruby: obsidian.ruby,
  sapphire: obsidian.sapphire,
  emerald: obsidian.emerald,
  amethyst: obsidian.amethyst,
  amber: obsidian.amber,
  success: obsidian.success,
  warning: obsidian.warning,
};

const HALKA_DARK_JEWELS: JewelSet = {
  ruby: '#FF375F',
  sapphire: '#5E5CE6',
  emerald: '#30D158',
  amethyst: '#BF5AF2',
  amber: '#FF9F0A',
  success: '#30D158',
  warning: '#FFB340',
};

const HALKA_LIGHT_JEWELS: JewelSet = {
  ruby: '#D6336C',
  sapphire: '#3A4FD6',
  emerald: '#248A3D',
  amethyst: '#8944AB',
  amber: '#C93400',
  success: '#248A3D',
  warning: '#A05A00',
};

function buildColors(p: BasePalette, x: ThemeExtras, j: JewelSet = OBSIDIAN_JEWELS) {
  return {
    ...p,

    // Şampanya altını tonları
    gold: x.gold,
    goldLight: x.goldLight,
    goldDark: x.goldDark,
    goldMuted: x.goldMuted,

    // Mücevher tonları (dolgu, çubuk, nokta)
    ruby: j.ruby,
    sapphire: j.sapphire,
    emerald: j.emerald,
    amethyst: j.amethyst,
    amber: j.amber,

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
    success: j.success,
    warning: j.warning,
    error: x.error,
    danger: x.danger,
    dangerSoft: x.dangerSoft,
    iconOnTint: x.iconOnTint,

    shadow: p.background,
    black: p.background,
    white: p.textPrimary,
  };
}

export type Colors = ReturnType<typeof buildColors>;

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

const jewelAccents = (j: JewelSet): Record<AccentName, string> => ({
  amber: j.amber,
  sapphire: j.sapphire,
  amethyst: j.amethyst,
  ruby: j.ruby,
  emerald: j.emerald,
});

// Aktif temanın kategori renkleri (applyTheme günceller)
export const accentColors: Readonly<Record<AccentName, string>> = jewelAccents(OBSIDIAN_JEWELS);

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

// Aktif temanın ikon kutusu zeminleri (applyTheme günceller; Halka'da düz mücevher rengi + beyaz ikon)
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

// Yeni tasarımın modül anlamları. `moduleColors` dolgu/halka/ikon kutusu, `moduleInk` metin olarak
// okunur ton. Halka'da tasarımın renk psikolojisi; Obsidyen'de altın + mücevher karşılıkları.
export type ModuleName =
  | 'reward'
  | 'focus'
  | 'shortBreak'
  | 'rest'
  | 'water'
  | 'breath'
  | 'mood'
  | 'energy'
  | 'success'
  | 'creativity'
  | 'character'
  | 'warning';

type ModuleSet = Record<ModuleName, string>;

const HALKA_DARK_MODULES: ModuleSet = {
  reward: '#FF9F0A',
  focus: '#7D7AFF',
  shortBreak: '#30D158',
  rest: '#C7A6FF',
  water: '#64D2FF',
  breath: '#63E6E2',
  mood: '#FF6B8A',
  energy: '#FFB340',
  success: '#30D158',
  creativity: '#FFD60A',
  character: '#DA8FFF',
  warning: '#FF453A',
};

const HALKA_LIGHT_MODULES: ModuleSet = {
  reward: '#C93400',
  focus: '#3A4FD6',
  shortBreak: '#1E8A5A',
  rest: '#7A4FD6',
  water: '#0071A4',
  breath: '#0C817B',
  mood: '#D6336C',
  energy: '#A05A00',
  success: '#248A3D',
  creativity: '#B25000',
  character: '#8944AB',
  warning: '#D70015',
};

const obsidianModules = (gold: string, error: string): ModuleSet => ({
  reward: gold,
  focus: obsidian.sapphire,
  shortBreak: obsidian.emerald,
  rest: obsidian.amethyst,
  water: obsidian.sapphire,
  breath: obsidian.emerald,
  mood: obsidian.ruby,
  energy: obsidian.amber,
  success: obsidian.emerald,
  creativity: obsidian.amber,
  character: obsidian.amethyst,
  warning: error,
});

// Obsidyen'de mücevher tonları metin olamaz (kontrast < 3): metin krem, ödül/uyarı kendi okunur tonunda
const obsidianInk = (text: string, gold: string, danger: string): ModuleSet => ({
  reward: gold,
  focus: text,
  shortBreak: text,
  rest: text,
  water: text,
  breath: text,
  mood: text,
  energy: text,
  success: gold,
  creativity: text,
  character: text,
  warning: danger,
});

export const moduleColors: Readonly<ModuleSet> = obsidianModules(obsidian.gold, EXTRAS.error);
export const moduleInk: Readonly<ModuleSet> = obsidianInk(
  obsidian.textPrimary,
  obsidian.gold,
  EXTRAS.danger,
);

// Gradyanlar (soldan sağa / yukarıdan aşağıya renk durakları). Obsidyen gradyan kullanmaz: düz çift.
export type GradientName = 'reward' | 'ring' | 'focus' | 'character' | 'breath';
type GradientSet = Record<GradientName, readonly string[]>;

const HALKA_DARK_GRADIENTS: GradientSet = {
  reward: ['#FF9F0A', '#FF375F'],
  ring: ['#FF9F0A', '#FF375F', '#DA5AF2'],
  focus: ['#2E8BFF', '#7D7AFF'],
  character: ['#DA8FFF', '#7D7AFF'],
  breath: ['#63E6E2', '#30D158'],
};

const HALKA_LIGHT_GRADIENTS: GradientSet = {
  reward: ['#E8590C', '#D6336C'],
  ring: ['#F07A00', '#E8335F', '#B145D6'],
  focus: ['#1F6FE0', '#3A4FD6'],
  character: ['#8944AB', '#5E5CE6'],
  breath: ['#0C817B', '#1E8A5A'],
};

const flatGradients = (m: ModuleSet): GradientSet => ({
  reward: [m.reward, m.reward],
  ring: [m.reward, m.reward],
  focus: [m.focus, m.focus],
  character: [m.character, m.character],
  breath: [m.breath, m.breath],
});

export const gradients: Readonly<GradientSet> = flatGradients(moduleColors);

// Liquid Glass arka plan lekeleri (yalnız Halka + particles stili): renk + konum (0–1) + yarıçap (genişliğe oran)
export interface BackdropBlob {
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

const HALKA_DARK_BLOBS: readonly BackdropBlob[] = [
  { color: 'rgba(255, 159, 10, 0.34)', x: 0.1, y: 0.08, r: 0.7 },
  { color: 'rgba(191, 90, 242, 0.3)', x: 0.95, y: 0.3, r: 0.65 },
  { color: 'rgba(46, 60, 160, 0.4)', x: 0.15, y: 0.68, r: 0.75 },
  { color: 'rgba(48, 209, 88, 0.18)', x: 0.9, y: 0.95, r: 0.6 },
];

const HALKA_LIGHT_BLOBS: readonly BackdropBlob[] = [
  { color: 'rgba(255, 159, 10, 0.28)', x: 0.1, y: 0.08, r: 0.7 },
  { color: 'rgba(191, 90, 242, 0.22)', x: 0.95, y: 0.3, r: 0.65 },
  { color: 'rgba(94, 92, 230, 0.2)', x: 0.15, y: 0.68, r: 0.75 },
  { color: 'rgba(48, 209, 88, 0.16)', x: 0.9, y: 0.95, r: 0.6 },
];

// Aktif temanın lekeleri; Obsidyen'de boş (orada parçacıklar var)
export const backdropBlobs: BackdropBlob[] = [];

// Bileşenlerin aileye göre davranışı (renk dışı farklar)
export interface ThemeTraits {
  readonly buttonStyle: 'gradient' | 'outline'; // ana buton: dolu gradyan kapsül / çizgi
  readonly titleFont: string; // büyük başlıklar
  readonly gradients: boolean; // halka ve vurgu yüzeylerinde gradyan
}

const OBSIDIAN_TRAITS: ThemeTraits = {
  buttonStyle: 'outline',
  titleFont: 'CormorantGaramond_500Medium',
  gradients: false,
};

const HALKA_TRAITS: ThemeTraits = {
  buttonStyle: 'gradient',
  titleFont: 'Inter_700Bold',
  gradients: true,
};

export const themeTraits: ThemeTraits = { ...OBSIDIAN_TRAITS };

let activeFamily: ThemeFamily = 'obsidian';
let activeMode: ThemeMode = 'dark';

// Aile + modu uygular. Ekran modülleri yüklenmeden önce çağrılmalı; sonradan değişirse nesneler
// yerinde güncellenir (onları import eden modüller aynı nesneyi görür) ve AppShell ağacı yeniden kurar.
export function applyTheme(family: ThemeFamily, mode: ThemeMode): void {
  activeFamily = family;
  activeMode = mode;
  const light = mode === 'light';

  if (family === 'halka') {
    const jewels = light ? HALKA_LIGHT_JEWELS : HALKA_DARK_JEWELS;
    const modules = light ? HALKA_LIGHT_MODULES : HALKA_DARK_MODULES;
    Object.assign(
      colors,
      light
        ? buildColors(HALKA_LIGHT_PALETTE, HALKA_LIGHT_EXTRAS, jewels)
        : buildColors(HALKA_DARK_PALETTE, HALKA_DARK_EXTRAS, jewels),
    );
    Object.assign(accentColors, jewelAccents(jewels));
    Object.assign(accentTints, jewelAccents(jewels));
    Object.assign(moduleColors, modules);
    Object.assign(moduleInk, modules);
    Object.assign(gradients, light ? HALKA_LIGHT_GRADIENTS : HALKA_DARK_GRADIENTS);
    backdropBlobs.splice(
      0,
      backdropBlobs.length,
      ...(light ? HALKA_LIGHT_BLOBS : HALKA_DARK_BLOBS),
    );
    Object.assign(themeTraits, HALKA_TRAITS);
    Object.assign(dopamineColors, {
      cheap: modules.mood,
      quality: modules.success,
      neutral: light ? halkaLight.textSecondary : halkaDark.textSecondary,
    });
    return;
  }

  const extras = light ? LIGHT_EXTRAS : EXTRAS;
  const built = light ? buildColors(LIGHT_PALETTE, LIGHT_EXTRAS) : buildColors(PALETTE, EXTRAS);
  Object.assign(colors, built);
  Object.assign(accentColors, jewelAccents(OBSIDIAN_JEWELS));
  Object.assign(accentTints, light ? LIGHT_ACCENT_TINTS : DARK_ACCENT_TINTS);
  const modules = obsidianModules(extras.gold, extras.error);
  Object.assign(moduleColors, modules);
  Object.assign(moduleInk, obsidianInk(built.textPrimary, extras.gold, extras.danger));
  Object.assign(gradients, flatGradients(modules));
  backdropBlobs.splice(0, backdropBlobs.length);
  Object.assign(themeTraits, OBSIDIAN_TRAITS);
  Object.assign(dopamineColors, {
    cheap: obsidian.ruby,
    quality: obsidian.emerald,
    neutral: light ? ivory.textSecondary : obsidian.textSecondary,
  });
}

// Yalnız modu değiştirir (aile aynı kalır)
export function applyThemeMode(mode: ThemeMode): void {
  applyTheme(activeFamily, mode);
}

// Yalnız aileyi değiştirir (mod aynı kalır)
export function applyThemeFamily(family: ThemeFamily): void {
  applyTheme(family, activeMode);
}

export function activeThemeMode(): ThemeMode {
  return activeMode;
}

export function activeThemeFamily(): ThemeFamily {
  return activeFamily;
}

// Mod tercihini (sistem / koyu / açık) uygulanacak moda çevirir; sistem bilgisi yoksa koyu
export function resolveThemeMode(
  preference: ThemeMode | 'system',
  systemScheme: string | null | undefined,
): ThemeMode {
  if (preference !== 'system') return preference;
  return systemScheme === 'light' ? 'light' : 'dark';
}

// Temaya bağlı önbelleklerin anahtarı (themed.ts)
export function activeThemeKey(): string {
  return `${activeFamily}-${activeMode}`;
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

// Köşe ölçeği: ikon kutusu 14 · küçük kart 18 · liste kartı 20 · büyük kart 28 · pill 999.
// Yeni düzen: kart/panel 24 (`card`), alan/küçük kutu 14 (`field`), ikon kutusu boyutun %30'u (iconBoxRadius).
export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  field: 14,
  card: 24,
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
  // Yeni düzen ölçeği (34 büyük başlık · 28 akış · 22 bölüm · 20 kart · 17 gövde · 15 ikincil · 13 not ·
  // 12 küçük · 10 sekme; büyük rakam yalnız 54 ve 40)
  tabLabel: 10,
  bodyL: 17,
  panelTitle: 20,
  sectionTitle: 22,
  numeralL: 40,
  numeralXL: 54,
  // Parçacık ekranları
  particleTitle: 40,
  ringValue58: 58,
  timerXL: 92,
} as const;

// İkon kutusu köşesi: kenarın %30'u
export const iconBoxRadius = (size: number): number => Math.round(size * 0.3);

// Web'de 1180px altında tek sütun düzene geçiliyordu
export const breakpoints = { tablet: 640, wide: 1180 } as const;
