// 🎯 Günün Ana Hedefi (hedef metni artık düzenlenebilir)
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { BIG_ONE_GOAL_MAX_LENGTH } from '@domain/entities/BigOne';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { TextInputDialog } from '@presentation/components/common/TextInputDialog';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useBigOne } from '@presentation/hooks/useBigOne';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const ACCENT = widgetAccentColor(getCatalogItem('bigOne').accent);

export function BigOneWidget({ variant }: WidgetBodyProps) {
  const { bigOne, toggle, updateGoal } = useBigOne();
  const focused = variant === 'focused';
  const [editing, setEditing] = useState(false);
  const tint = bigOne.isCompleted ? colors.textMain : ACCENT;

  const buttonLabel = bigOne.isCompleted
    ? focused
      ? 'Tamamlandı!'
      : 'Tamamlandı'
    : focused
      ? 'Bu Hedefi Tamamla'
      : 'Hedefi Tamamla';

  return (
    <View
      style={[
        focused ? widgetStyles.containerFocused : widgetStyles.container,
        styles.card,
        { borderColor: withAlpha(tint, '55'), backgroundColor: withAlpha(tint, '0f') },
      ]}
    >
      <View style={widgetStyles.statsRow}>
        <View style={[widgetStyles.badge, { borderColor: tint }]}>
          <AppText style={[widgetStyles.badgeText, { color: tint }]}>
            {focused ? '#1 GÜNÜN KRİTİK ODAĞI' : '#1 GÜNÜN ANA ODAĞI'}
          </AppText>
        </View>
        <IconButton
          icon="edit-2"
          accessibilityLabel="Hedefi düzenle"
          onPress={() => setEditing(true)}
          size={30}
        />
      </View>

      <AppText
        style={[styles.goal, focused && styles.goalFocused, bigOne.isCompleted && styles.goalDone]}
      >
        {bigOne.goal}
      </AppText>

      <ActionButton
        label={buttonLabel}
        color={tint}
        variant={bigOne.isCompleted ? 'solid' : 'soft'}
        onPress={() => void toggle()}
      />

      <TextInputDialog
        visible={editing}
        title="Günün ana hedefi ne?"
        initialValue={bigOne.goal}
        maxLength={BIG_ONE_GOAL_MAX_LENGTH}
        emptyMessage="Hedef boş olamaz."
        placeholder="Bugün mutlaka bitireceğin iş"
        onSubmit={updateGoal}
        onClose={() => setEditing(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  goal: { fontFamily: fonts.bold, fontSize: fontSizes.lg, lineHeight: 24 },
  goalFocused: { fontSize: fontSizes.xl, lineHeight: 32, textAlign: 'center' },
  goalDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
