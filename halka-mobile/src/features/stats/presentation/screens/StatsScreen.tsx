// İstatistik sekmesi (Faz 4: istatistikler ve içgörüler)
import { strings } from '@core/i18n/tr';
import { PlaceholderScreen } from '@presentation/components/common/PlaceholderScreen';

export function StatsScreen() {
  return (
    <PlaceholderScreen
      icon="bar-chart-2"
      title={strings.screens.stats.title}
      subtitle={strings.screens.stats.subtitle}
    />
  );
}
