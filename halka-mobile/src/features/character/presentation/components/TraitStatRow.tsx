// Özellik satırı (kompakt): ad · renkli çubuk · yüzde. Dokununca özellik ayrıntısı açılır.
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { fonts, fontSizes, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

const LABEL_WIDTH = 84;

interface TraitStatRowProps {
  readonly name: string;
  readonly percent: number | null;
  readonly color: string;
  readonly delay: number;
  readonly onPress: () => void;
}

export function TraitStatRow({ name, percent, color, delay, onPress }: TraitStatRowProps) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={`${strings.character.openTrait(name)}, ${
        percent === null ? strings.character.noDayValue : strings.character.proximityA11y(percent)
      }`}
      style={styles.row}
    >
      <AppText variant="label" numberOfLines={1} style={styles.label}>
        {name}
      </AppText>
      <View style={styles.bar}>
        <ProgressBar pct={percent ?? 0} color={color} height={8} delay={delay} duration={800} />
      </View>
      <AppText variant="label" style={[styles.value, { color }]}>
        {percent === null ? '—' : `%${percent}`}
      </AppText>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget,
  },
  label: { width: LABEL_WIDTH, fontFamily: fonts.semibold, fontSize: fontSizes.body },
  bar: { flex: 1 },
  value: { minWidth: 40, textAlign: 'right', fontFamily: fonts.semibold },
});
