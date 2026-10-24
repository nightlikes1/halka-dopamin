// 💰 Günlük Harcama (harcamalar artık tek tek kaydediliyor)
import { View } from 'react-native';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { formatCurrency } from '@core/utils/format';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ExpenseForm } from '@presentation/components/widgets/budget/ExpenseForm';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { themedStyles } from '@core/theme/themed';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useBudget } from '@presentation/hooks/useBudget';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('budget').accent);

export function BudgetWidget({ variant }: WidgetBodyProps) {
  const { budget, summary, addExpense, deleteExpense } = useBudget();
  const focused = variant === 'focused';
  const barColor = summary.isWarning ? colors.error : colors.sapphire;

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      {focused ? (
        <View style={widgetStyles.centered}>
          <AppText style={[styles.hero, { color: accent() }]}>
            {formatCurrency(summary.remaining)}
          </AppText>
          <AppText variant="muted">Kalan Günlük Bütçe</AppText>
        </View>
      ) : (
        <View style={widgetStyles.statsRow}>
          <AppText variant="muted">Kalan Limit</AppText>
          <AppText style={[styles.amount, { color: accent() }]}>
            {formatCurrency(summary.remaining)}
          </AppText>
        </View>
      )}

      <ProgressBar pct={summary.pct} color={barColor} />
      <View style={widgetStyles.statsRow}>
        <AppText style={widgetStyles.statText}>Harcanan: {formatCurrency(summary.spent)}</AppText>
        <AppText style={widgetStyles.statText}>
          {focused ? 'Limit' : 'Hedef'}: {formatCurrency(budget.limit)}
        </AppText>
      </View>

      <ExpenseForm accent={accent()} withLabel={focused} onAdd={addExpense} />

      {focused ? (
        <View style={styles.list}>
          {budget.expenses.length === 0 ? (
            <AppText style={widgetStyles.emptyText}>Bugün henüz harcama yok.</AppText>
          ) : (
            budget.expenses.map((expense) => (
              <View key={expense.id} style={styles.item}>
                <AppText style={styles.itemLabel} numberOfLines={1}>
                  {expense.label}
                </AppText>
                <AppText style={styles.itemAmount}>{formatCurrency(expense.amount)}</AppText>
                <IconButton
                  icon="x"
                  tone="danger"
                  accessibilityLabel={`${expense.label} harcamasını sil`}
                  onPress={() => void deleteExpense(expense.id)}
                  size={28}
                />
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  hero: { fontFamily: fonts.bold, fontSize: fontSizes.display },
  amount: { fontFamily: fonts.bold, fontSize: fontSizes.xl },
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  itemLabel: { flex: 1, fontSize: fontSizes.sm },
  itemAmount: { fontFamily: fonts.mono, fontSize: fontSizes.sm, color: colors.textMuted },
}));
