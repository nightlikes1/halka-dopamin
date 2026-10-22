// ✅ Günlük Görevler
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { withAlpha } from '@core/theme/palettes';
import { colors, fontSizes, radius, spacing } from '@core/theme/tokens';
import type { Task } from '@domain/entities/Task';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { IconButton } from '@presentation/components/common/IconButton';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { TaskAddForm } from '@presentation/components/widgets/tasks/TaskAddForm';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useTasks } from '@presentation/hooks/useTasks';
import { nativeOnly } from '@presentation/utils/nativeOnly';

const ACCENT = getCatalogItem('tasks').accent;

interface TaskRowProps {
  readonly task: Task;
  readonly onToggle: (done: boolean) => void;
  readonly onDelete: () => void;
}

function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  return (
    <Animated.View
      entering={nativeOnly(FadeIn.duration(200))}
      exiting={nativeOnly(FadeOut.duration(160))}
      layout={nativeOnly(LinearTransition)}
      style={[styles.item, task.done && styles.itemDone]}
    >
      <Pressable
        onPress={() => onToggle(!task.done)}
        style={styles.checkArea}
        accessibilityRole="checkbox"
        aria-checked={task.done}
        accessibilityLabel={task.text}
      >
        <View style={[styles.box, task.done && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
          {task.done ? <Icon name="check" size={14} color={colors.bgPrimary} /> : null}
        </View>
        <AppText style={[styles.text, task.done && styles.textDone]}>{task.text}</AppText>
      </Pressable>
      <IconButton
        icon="x"
        tone="danger"
        accessibilityLabel="Görevi sil"
        onPress={onDelete}
        size={28}
      />
    </Animated.View>
  );
}

export function TasksWidget({ variant }: WidgetBodyProps) {
  const { items, progress, add, toggle, remove } = useTasks();
  const focused = variant === 'focused';

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <ProgressBar pct={progress.pct} color={ACCENT} />
      <View style={widgetStyles.statsRow}>
        <AppText style={widgetStyles.statText}>İlerleme: %{progress.pct}</AppText>
        <AppText style={widgetStyles.statText}>
          {focused
            ? `${progress.done} / ${progress.total} Görev Yapıldı`
            : `${progress.done}/${progress.total} Tamamlandı`}
        </AppText>
      </View>

      <TaskAddForm accent={ACCENT} onAdd={add} />

      <View style={styles.list}>
        {items.length === 0 ? (
          <AppText style={widgetStyles.emptyText}>Tüm görevler bitti!</AppText>
        ) : (
          items.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={(done) => void toggle(task.id, done)}
              onDelete={() => void remove(task.id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  itemDone: { backgroundColor: withAlpha(ACCENT, '10') },
  checkArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, fontSize: fontSizes.sm },
  textDone: { color: colors.textDim, textDecorationLine: 'line-through' },
});
