// Eklentileri sütunlara dağıtan ızgara (farklı kart yükseklikleri için masonry düzeni)
import { View } from 'react-native';
import { spacing } from '@core/theme/tokens';
import type { WidgetId } from '@domain/entities/WidgetId';
import { WidgetCard } from '@presentation/components/widgets/WidgetCard';
import { themedStyles } from '@core/theme/themed';

interface WidgetGridProps {
  readonly ids: readonly WidgetId[];
  readonly columns: number;
}

export function WidgetGrid({ ids, columns }: WidgetGridProps) {
  const columnCount = Math.max(1, columns);
  const columnIds = Array.from({ length: columnCount }, (_, column) =>
    ids.filter((_, index) => index % columnCount === column),
  );

  return (
    <View style={styles.row}>
      {columnIds.map((idsInColumn, column) => (
        <View key={column} style={styles.column}>
          {idsInColumn.map((id) => (
            <WidgetCard key={id} id={id} index={ids.indexOf(id)} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = themedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  column: { flex: 1, gap: spacing.lg },
}));
