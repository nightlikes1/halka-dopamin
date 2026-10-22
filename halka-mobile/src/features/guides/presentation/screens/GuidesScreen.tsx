// Rehberler sekmesi (Faz 3: eğitim rehberleri)
import { strings } from '@core/i18n/tr';
import { PlaceholderScreen } from '@presentation/components/common/PlaceholderScreen';

export function GuidesScreen() {
  return (
    <PlaceholderScreen
      icon="book-open"
      title={strings.screens.guides.title}
      subtitle={strings.screens.guides.subtitle}
    />
  );
}
