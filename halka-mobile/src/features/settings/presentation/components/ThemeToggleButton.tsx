// Koyu/açık tema arasında tek dokunuşla geçiş (Bugün üst barı). Koyu temada güneş, açıkta ay gösterir.
import { strings } from '@core/i18n/tr';
import { useThemeModeSetting } from '@features/settings/presentation/useThemeModeSetting';
import { IconButton, type IconButtonVariant } from '@presentation/components/common/IconButton';

const t = strings.today;

interface ThemeToggleButtonProps {
  readonly variant: IconButtonVariant;
}

export function ThemeToggleButton({ variant }: ThemeToggleButtonProps) {
  const theme = useThemeModeSetting();
  const dark = theme.selected === 'dark';
  return (
    <IconButton
      icon={dark ? 'sun' : 'moon'}
      variant={variant}
      size={44}
      accessibilityLabel={dark ? t.toLightTheme : t.toDarkTheme}
      onPress={() => void theme.toggle()}
    />
  );
}
