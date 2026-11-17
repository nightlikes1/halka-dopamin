// Araç ekranı: Araçlar'dan açılan eklentinin geniş görünümü (veriler cihazda, Halka deposunda)
import { useEffect } from 'react';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { WidgetBody } from '@features/halka/presentation/components/widgets/WidgetBody';
import { useSoundEffect } from '@features/halka/presentation/hooks/useSoundEffect';
import { Panel } from '@presentation/components/common/Panel';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import type { RootStackScreenProps } from '@presentation/navigation/types';

export function WidgetFocusScreen({ route, navigation }: RootStackScreenProps<'WidgetFocus'>) {
  const { widgetId } = route.params;
  const play = useSoundEffect();

  // Girişte yükselen, çıkışta alçalan ses
  useEffect(() => {
    play('focusZoom');
    return () => play('focusExit');
  }, [play]);

  return (
    <Screen
      modal
      keyboard
      backdrop
      contentStyle={styles.content}
      header={
        <ScreenHeader title={strings.tools.items[widgetId]} onClose={() => navigation.goBack()} />
      }
    >
      <Panel>
        <WidgetBody id={widgetId} variant="focused" />
      </Panel>
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
}));
