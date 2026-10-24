// DiceBear düzenleyicisi: stilin şemasından üretilen parça sekmeleri, her seçeneği avatarın o hâliyle
// gösteren kutucuklar, renk daireleri ve "yok" seçeneği. Uzun listeler sayfa sayfa açılır.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, obsidian, radius, spacing } from '@core/theme/tokens';
import {
  chooseDiceBearPart,
  isDiceBearPartRemoved,
  removeDiceBearPart,
  selectedDiceBearValue,
  type DiceBearAvatar,
} from '@features/character/domain/dicebear';
import { DiceBearImage } from '@features/character/presentation/dicebear/DiceBearImage';
import {
  diceBearMeta,
  diceBearParts,
  partValues,
  randomDiceBear,
  TRANSPARENT,
  type DiceBearPart,
} from '@features/character/presentation/dicebear/registry';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { Icon } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { hapticLight } from '@presentation/utils/haptics';
import { themedStyles } from '@core/theme/themed';

const s = strings.character.studio;
const PAGE = 24;
const TILE_ART = 84;
const SWATCH = 44;

const partLabel = (key: string) => s.dicebearParts[key] ?? s.partFallback;

// Açık renk dairede koyu, koyu dairede açık onay işareti
function checkColorOn(hex: string): string {
  const channel = (i: number) => parseInt(hex.slice(i * 2, i * 2 + 2), 16) / 255;
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return luminance > 0.5 ? obsidian.base : obsidian.textPrimary;
}

interface DiceBearStudioProps {
  readonly avatar: DiceBearAvatar;
  readonly seed: string;
  readonly onChange: (avatar: DiceBearAvatar) => void;
}

export function DiceBearStudio({ avatar, seed, onChange }: DiceBearStudioProps) {
  const parts = diceBearParts(avatar.style);
  const [partKey, setPartKey] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const part = parts.find((item) => item.key === partKey) ?? parts[0];
  const meta = diceBearMeta(avatar.style);

  const change = (next: DiceBearAvatar) => {
    hapticLight();
    onChange(next);
  };
  const openPart = (key: string) => {
    setPartKey(key);
    setShown(PAGE);
  };

  return (
    <View style={styles.section}>
      <AppText variant="dim" style={styles.credit}>
        {s.credit(meta.creator, s.licenses[meta.license] ?? meta.license)}
      </AppText>

      <View style={styles.actions}>
        <Chip
          label={s.random}
          icon="shuffle"
          accent={colors.textMain}
          onPress={() => change(randomDiceBear(avatar.style))}
        />
        <Chip
          label={s.auto}
          icon="refresh-cw"
          variant={Object.keys(avatar.options).length === 0 ? 'active' : 'default'}
          accent={colors.textMain}
          onPress={() => change({ style: avatar.style, options: {} })}
        />
      </View>

      {parts.length > 0 && part ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {parts.map((item) => (
              <Chip
                key={item.key}
                label={partLabel(item.key)}
                variant={item.key === part.key ? 'active' : 'default'}
                onPress={() => openPart(item.key)}
              />
            ))}
          </ScrollView>
          {part.kind === 'color' ? (
            <ColorOptions part={part} avatar={avatar} onChange={change} />
          ) : (
            <PartOptions
              part={part}
              avatar={avatar}
              seed={seed}
              shown={shown}
              onMore={() => setShown((count) => count + PAGE)}
              onChange={change}
            />
          )}
        </>
      ) : null}
    </View>
  );
}

interface OptionsProps {
  readonly part: DiceBearPart;
  readonly avatar: DiceBearAvatar;
  readonly onChange: (avatar: DiceBearAvatar) => void;
}

function ColorOptions({ part, avatar, onChange }: OptionsProps) {
  const selected = selectedDiceBearValue(avatar, part.key);
  const label = partLabel(part.key);
  return (
    <View style={styles.swatches}>
      {partValues(part).map((hex, index) => {
        const active = selected === hex;
        const transparent = hex === TRANSPARENT;
        return (
          <ScalePressable
            key={hex}
            onPress={() => onChange(chooseDiceBearPart(avatar, part.key, hex))}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={transparent ? s.transparent : s.color(label, index)}
            style={[
              styles.swatch,
              transparent ? styles.swatchTransparent : { backgroundColor: `#${hex}` },
              active ? styles.swatchSelected : null,
            ]}
          >
            {transparent ? (
              <Icon name="slash" size={16} color={colors.textSecondary} />
            ) : active ? (
              <Icon name="check" size={18} color={checkColorOn(hex)} />
            ) : null}
          </ScalePressable>
        );
      })}
    </View>
  );
}

function PartOptions({
  part,
  avatar,
  seed,
  shown,
  onMore,
  onChange,
}: OptionsProps & { readonly seed: string; readonly shown: number; readonly onMore: () => void }) {
  const label = partLabel(part.key);
  const removed = part.probabilityKey ? isDiceBearPartRemoved(avatar, part.probabilityKey) : false;
  const selected = removed ? null : selectedDiceBearValue(avatar, part.key);
  const values = part.values.slice(0, shown);
  const left = part.values.length - values.length;
  const { probabilityKey } = part;

  return (
    <>
      <View style={styles.grid}>
        {probabilityKey ? (
          <ScalePressable
            onPress={() => onChange(removeDiceBearPart(avatar, probabilityKey))}
            accessibilityRole="radio"
            aria-checked={removed}
            accessibilityLabel={s.noneA11y(label)}
            containerStyle={styles.tileBox}
            style={[styles.tile, removed ? styles.tileSelected : null]}
          >
            <View style={styles.tileArt}>
              <DiceBearImage
                avatar={removeDiceBearPart(avatar, probabilityKey)}
                seed={seed}
                size={TILE_ART}
              />
            </View>
            <AppText variant="tag" style={styles.tileLabel}>
              {s.none}
            </AppText>
          </ScalePressable>
        ) : null}
        {values.map((value, index) => {
          const active = selected === value;
          const preview = chooseDiceBearPart(avatar, part.key, value, probabilityKey);
          return (
            <ScalePressable
              key={value}
              onPress={() => onChange(preview)}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={s.optionNumber(label, index + 1)}
              containerStyle={styles.tileBox}
              style={[styles.tile, active ? styles.tileSelected : null]}
            >
              <View style={styles.tileArt}>
                <DiceBearImage avatar={preview} seed={seed} size={TILE_ART} />
              </View>
              <AppText variant="tag" style={styles.tileLabel}>
                {index + 1}
              </AppText>
            </ScalePressable>
          );
        })}
      </View>
      {left > 0 ? (
        <Chip
          label={s.showMore(left)}
          icon="chevron-down"
          accent={colors.textMain}
          onPress={onMore}
          style={styles.more}
        />
      ) : null}
    </>
  );
}

const styles = themedStyles(() => ({
  section: { gap: spacing.md },
  credit: { textAlign: 'center' },
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
  swatchTransparent: { backgroundColor: colors.surfaceAlt },
  swatchSelected: { borderColor: colors.textPrimary, borderWidth: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.smd },
  tileBox: { width: '31%' },
  tile: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.surfaceAlt,
  },
  tileSelected: { borderColor: colors.textPrimary, backgroundColor: colors.goldMuted },
  tileArt: { width: TILE_ART, height: TILE_ART, borderRadius: radius.md, overflow: 'hidden' },
  tileLabel: { color: colors.textSecondary },
  more: { alignSelf: 'center' },
}));
