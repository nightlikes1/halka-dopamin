// Avatar stüdyosu (Bitmoji benzeri): üstte canlı önizleme, altında parça sekmeleri ve seçenek ızgarası.
// Her seçenek kutucuğu avatarın o seçenekle hâlini gösterir; renk parçaları renk daireleriyle seçilir.
// "Rastgele" yeni bir görünüm üretir, "Otomatik" karakterden türetilen görünüme döner.
// Üstteki stil şeridinde "Halka" (kendi çizimimiz) ya da 31 DiceBear stilinden biri seçilir.
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { avatarColors, colors, radius, spacing } from '@core/theme/tokens';
import type { AvatarSource } from '@features/character/domain/avatar';
import { DICEBEAR_STYLES, type DiceBearAvatar } from '@features/character/domain/dicebear';
import {
  COLOR_COUNTS,
  deriveLook,
  LOOK_OPTIONS,
  MOODS,
  type AvatarLook,
  type ColorPart,
  type Mood,
  type OptionPart,
} from '@features/character/domain/look';
import {
  AvatarBadge,
  type AvatarFigure,
} from '@features/character/presentation/components/AvatarBadge';
import { diceBearSeedFor } from '@features/character/presentation/avatarFigure';
import { CartoonAvatar } from '@features/character/presentation/components/CartoonAvatar';
import { DiceBearImage } from '@features/character/presentation/dicebear/DiceBearImage';
import { DiceBearStudio } from '@features/character/presentation/dicebear/DiceBearStudio';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { Icon } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { hapticLight } from '@presentation/utils/haptics';

const s = strings.character.studio;
const PREVIEW_SIZE = 200;
const TILE_AVATAR = 128;
const SWATCH = 44;
const STYLE_TILE = 64;

// Sekme sırası: önce yüz ve saç, en sonda kıyafet
type Part = OptionPart | ColorPart;
const PARTS: readonly Part[] = [
  'skin',
  'face',
  'hair',
  'hairColor',
  'eyes',
  'brows',
  'mouth',
  'facialHair',
  'glasses',
  'accessory',
  'top',
  'topColor',
];

const COLOR_LISTS: Readonly<Record<ColorPart, readonly string[]>> = {
  skin: avatarColors.skin,
  hairColor: avatarColors.hair,
  topColor: avatarColors.top,
};

const isColorPart = (part: Part): part is ColorPart => part in COLOR_COUNTS;

// Açık renk dairede koyu, koyu dairede açık onay işareti
function checkColorOn(hex: string): string {
  const channel = (i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return luminance > 0.5 ? avatarColors.pupil : avatarColors.teeth;
}

interface AvatarStudioProps {
  // Gösterilen görünüm (seçilmiş ya da türetilmiş)
  readonly look: AvatarLook;
  // Kullanıcı düzenlemedi mi (otomatik)
  readonly isAuto: boolean;
  readonly onChange: (look: AvatarLook | null) => void;
  readonly figure: AvatarFigure;
  // Gerçek ruh hali (yakınlıktan); önizleme bununla başlar
  readonly mood: Mood;
  // DiceBear tohumu için karakter (kimlik + özellikler)
  readonly source: AvatarSource;
  // Seçili DiceBear avatarı; null = Halka (kendi çizimimiz)
  readonly dicebear: DiceBearAvatar | null;
  readonly onDiceBearChange: (avatar: DiceBearAvatar | null) => void;
}

export function AvatarStudio({
  look,
  isAuto,
  onChange,
  figure,
  mood,
  source,
  dicebear,
  onDiceBearChange,
}: AvatarStudioProps) {
  const [part, setPart] = useState<Part>('hair');
  const [previewMood, setPreviewMood] = useState<Mood>(mood);

  const seedOf = (style: DiceBearAvatar['style']) => diceBearSeedFor(source, style);
  const pickStyle = (style: DiceBearAvatar['style'] | null) => {
    hapticLight();
    if (style === null) onDiceBearChange(null);
    else if (dicebear?.style !== style) onDiceBearChange({ style, options: {} });
  };

  const choose = (next: AvatarLook) => {
    hapticLight();
    onChange(next);
  };

  return (
    <View style={styles.section}>
      <AppText variant="subtitle">{s.title}</AppText>
      <AppText variant="muted">{dicebear ? s.hintDicebear : s.hint}</AppText>

      <View style={styles.preview} accessibilityLabel={s.preview} accessibilityRole="image">
        <AvatarBadge
          figure={figure}
          look={look}
          mood={previewMood}
          size={PREVIEW_SIZE}
          energy={0.75}
          name="avatarPreview"
          dicebear={dicebear}
          dicebearSeed={dicebear ? seedOf(dicebear.style) : undefined}
        />
      </View>

      <AppText variant="caption">{s.styleTitle}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.styleStrip}
        accessibilityRole="radiogroup"
        accessibilityLabel={s.styleTitle}
      >
        <StyleTile
          label={s.halkaStyle}
          selected={dicebear === null}
          onPress={() => pickStyle(null)}
        >
          <CartoonAvatar look={look} mood="calm" size={STYLE_TILE} animated={false} />
        </StyleTile>
        {DICEBEAR_STYLES.map((style) => (
          <StyleTile
            key={style}
            label={s.styles[style]}
            selected={dicebear?.style === style}
            onPress={() => pickStyle(style)}
          >
            <DiceBearImage avatar={{ style, options: {} }} seed={seedOf(style)} size={STYLE_TILE} />
          </StyleTile>
        ))}
      </ScrollView>

      {dicebear ? (
        <DiceBearStudio
          avatar={dicebear}
          seed={seedOf(dicebear.style)}
          onChange={onDiceBearChange}
        />
      ) : (
        <HalkaParts
          look={look}
          isAuto={isAuto}
          previewMood={previewMood}
          setPreviewMood={setPreviewMood}
          part={part}
          setPart={setPart}
          choose={choose}
          onAuto={() => onChange(null)}
        />
      )}
    </View>
  );
}

// Stil şeridindeki kutucuk: küçük önizleme + ad
function StyleTile({
  label,
  selected,
  onPress,
  children,
}: {
  readonly label: string;
  readonly selected: boolean;
  readonly onPress: () => void;
  readonly children: ReactNode;
}) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={selected}
      accessibilityLabel={s.styleA11y(label)}
      style={[styles.styleTile, selected ? styles.tileSelected : null]}
    >
      <View style={styles.styleArt}>{children}</View>
      <AppText variant="tag" numberOfLines={1} style={styles.tileLabel}>
        {label}
      </AppText>
    </ScalePressable>
  );
}

interface HalkaPartsProps {
  readonly look: AvatarLook;
  readonly isAuto: boolean;
  readonly previewMood: Mood;
  readonly setPreviewMood: (mood: Mood) => void;
  readonly part: Part;
  readonly setPart: (part: Part) => void;
  readonly choose: (look: AvatarLook) => void;
  readonly onAuto: () => void;
}

// Kendi çizgi karakterimizin düzenleyicisi (ifade önizlemesi + parça sekmeleri)
function HalkaParts({
  look,
  isAuto,
  previewMood,
  setPreviewMood,
  part,
  setPart,
  choose,
  onAuto,
}: HalkaPartsProps) {
  return (
    <>
      <SegmentedControl<Mood>
        selected={previewMood}
        onChange={setPreviewMood}
        accessibilityLabel={s.moodPreview}
        options={MOODS.map((value) => ({
          value,
          label: s.moods[value],
          color: colors.textPrimary,
        }))}
      />

      <View style={styles.actions}>
        <Chip
          label={s.random}
          icon="shuffle"
          accent={colors.textMain}
          onPress={() => choose(deriveLook(Math.floor(Math.random() * 0xffffffff)))}
        />
        <Chip
          label={s.auto}
          icon="refresh-cw"
          variant={isAuto ? 'active' : 'default'}
          accent={colors.textMain}
          onPress={onAuto}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {PARTS.map((value) => (
          <Chip
            key={value}
            label={s.parts[value]}
            variant={part === value ? 'active' : 'default'}
            onPress={() => setPart(value)}
          />
        ))}
      </ScrollView>

      {isColorPart(part) ? (
        <View style={styles.swatches}>
          {COLOR_LISTS[part].map((hex, index) => {
            const selected = look[part] === index;
            return (
              <ScalePressable
                key={hex}
                onPress={() => choose({ ...look, [part]: index })}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityLabel={s.color(s.parts[part], index)}
                style={[
                  styles.swatch,
                  { backgroundColor: hex },
                  selected ? styles.swatchSelected : null,
                ]}
              >
                {selected ? <Icon name="check" size={18} color={checkColorOn(hex)} /> : null}
              </ScalePressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.grid}>
          {LOOK_OPTIONS[part].map((option) => {
            const selected = look[part] === option;
            const label = (s.options[part] as Readonly<Record<string, string>>)[option] ?? option;
            return (
              <ScalePressable
                key={option}
                onPress={() => choose({ ...look, [part]: option })}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityLabel={s.option(s.parts[part], label)}
                containerStyle={styles.tileBox}
                style={[styles.tile, selected ? styles.tileSelected : null]}
              >
                <View style={styles.tileArt}>
                  <CartoonAvatar
                    look={{ ...look, [part]: option }}
                    mood="calm"
                    size={TILE_AVATAR}
                    animated={false}
                    style={part === 'top' ? styles.tileAvatarBody : styles.tileAvatar}
                  />
                </View>
                <AppText variant="tag" numberOfLines={1} style={styles.tileLabel}>
                  {label}
                </AppText>
              </ScalePressable>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  preview: { alignSelf: 'center' },
  styleStrip: { gap: spacing.sm, paddingRight: spacing.lg },
  styleTile: {
    width: STYLE_TILE + spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.surfaceAlt,
  },
  styleArt: {
    width: STYLE_TILE,
    height: STYLE_TILE,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  swatchSelected: { borderColor: colors.textPrimary, borderWidth: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.smd },
  tileBox: { width: '31%' },
  tile: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  tileSelected: { borderColor: colors.textPrimary, backgroundColor: colors.goldMuted },
  // Kutucukta yalnızca baş ve omuz üstü görünür
  tileArt: { width: '100%', height: 92, alignItems: 'center', overflow: 'hidden' },
  tileAvatar: { marginTop: -14 },
  // Kıyafet seçeneklerinde gövde görünsün
  tileAvatarBody: { marginTop: -44 },
  tileLabel: { color: colors.textSecondary },
});
