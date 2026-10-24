// 📝 Hızlı Not Defteri
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { spacing } from '@core/theme/tokens';
import { NOTE_MAX_LENGTH } from '@domain/entities/Note';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Chip } from '@presentation/components/common/Chip';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { themedStyles } from '@core/theme/themed';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useNotes } from '@presentation/hooks/useNotes';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('notes').accent);
const COPIED_FEEDBACK_MS = 1500;

export function NotesWidget({ variant }: WidgetBodyProps) {
  const { content, setContent, copy, clear } = useNotes();
  const focused = variant === 'focused';
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const onCopy = async () => {
    if (!(await copy())) return;
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const copyLabel = copied ? 'Kopyalandı!' : focused ? 'Panoya Kopyala' : 'Kopyala';

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <AppTextInput
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        maxLength={NOTE_MAX_LENGTH}
        placeholder={
          focused
            ? 'Düşüncelerini, hedeflerini veya notlarını buraya dök...'
            : 'Hızlı bir düşünce karala...'
        }
        style={[styles.input, focused ? styles.inputFocused : styles.inputCompact]}
        accessibilityLabel="Not"
      />
      <View style={widgetStyles.statsRow}>
        <AppText style={widgetStyles.statText}>{content.length} karakter</AppText>
        <View style={widgetStyles.row}>
          <Chip
            label={copyLabel}
            variant={copied ? 'active' : 'default'}
            accent={accent()}
            onPress={() => void onCopy()}
          />
          {focused ? <Chip label="Temizle" onPress={clear} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  input: { paddingTop: spacing.md, lineHeight: 21 },
  inputCompact: { height: 130 },
  inputFocused: { minHeight: 280 },
}));
