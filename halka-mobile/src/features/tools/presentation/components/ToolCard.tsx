// Araç kartı: modül renginde ikon kutusu (beyaz ikon) · ad · kısa durum. Tüm araçlar aynı boyutta.
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { themedStyles } from '@core/theme/themed';
import { colors, iconBoxRadius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { Panel } from '@presentation/components/common/Panel';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

const ICON_BOX = 40;

interface ToolCardProps {
  readonly name: string;
  readonly summary: string;
  readonly icon: IconName;
  readonly color: string;
  readonly onPress: () => void;
}

export function ToolCard({ name, summary, icon, color, onPress }: ToolCardProps) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.tools.open(name, summary)}
      containerStyle={styles.cell}
      style={styles.fill}
    >
      <Panel style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Icon name={icon} size={20} color={colors.iconOnTint} />
        </View>
        <View>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="footnote" numberOfLines={1} style={styles.summary}>
            {summary}
          </AppText>
        </View>
      </Panel>
    </ScalePressable>
  );
}

const styles = themedStyles(() => ({
  cell: { flexBasis: '47%', flexGrow: 1 },
  fill: { flex: 1 },
  card: { flex: 1, minHeight: 116, justifyContent: 'space-between', gap: spacing.md },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: iconBoxRadius(ICON_BOX),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { color: colors.textSecondary },
}));
