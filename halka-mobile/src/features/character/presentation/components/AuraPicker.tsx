// Aura (parçacık avatar) seçimi: biçim, palet ve "Otomatik". Seçim yoksa karakterden türetilen gösterilir.
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, spacing } from '@core/theme/tokens';
import {
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  type AvatarShape,
  type CharacterAvatar,
} from '@features/character/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { buildLut, LUT_SIZE, lutHex } from '@presentation/particles/engine/palette';

const t = strings.character.setup;
const s = strings.character.studio;
// Palet seçiminde gösterilen renk: paletin sıcak ucu
const PALETTE_SWATCH = Object.fromEntries(
  AVATAR_PALETTES.map((name) => [name, lutHex(buildLut(name), LUT_SIZE - 8)]),
);

interface AuraPickerProps {
  // Gösterilen (seçilmiş ya da türetilmiş) aura
  readonly shown: CharacterAvatar;
  // Kullanıcı seçimi; null = otomatik
  readonly chosen: CharacterAvatar | null;
  readonly onChange: (avatar: CharacterAvatar | null) => void;
}

export function AuraPicker({ shown, chosen, onChange }: AuraPickerProps) {
  return (
    <View style={styles.section}>
      <AppText variant="subtitle">{s.aura}</AppText>
      <AppText variant="muted">{s.auraHint}</AppText>
      <AppText variant="caption">{t.avatarShape}</AppText>
      <SegmentedControl<AvatarShape>
        selected={shown.shape}
        onChange={(shape) => onChange({ shape, palette: shown.palette })}
        accessibilityLabel={t.avatarShape}
        options={AVATAR_SHAPES.map((shape) => ({
          value: shape,
          label: t.shapes[shape],
          color: colors.textPrimary,
        }))}
      />
      <AppText variant="caption">{t.avatarPalette}</AppText>
      <View style={styles.wrap}>
        {AVATAR_PALETTES.map((palette) => (
          <Chip
            key={palette}
            label={t.palettes[palette]}
            icon="circle"
            variant={shown.palette === palette ? 'active' : 'default'}
            accent={PALETTE_SWATCH[palette]}
            onPress={() => onChange({ shape: shown.shape, palette })}
          />
        ))}
        <Chip
          label={t.avatarAuto}
          icon="refresh-cw"
          variant={chosen === null ? 'active' : 'default'}
          accent={colors.textMain}
          onPress={() => onChange(null)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
