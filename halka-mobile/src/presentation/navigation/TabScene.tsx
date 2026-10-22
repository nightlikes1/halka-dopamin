// Sekme sahnesi sarmalayıcısı: arka plandaki (odakta olmayan) sekmeler ekran okuyucudan ve klavye
// odağından gizlenir. Web'de alt sekmeler DOM'da kalır; `inert` olmadan Tab tuşu görünmeyen butonlara gider.
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface InertCapable {
  inert: boolean;
}

const isInertCapable = (node: unknown): node is InertCapable =>
  typeof node === 'object' && node !== null && 'inert' in node;

export function TabScene({ children }: { readonly children: ReactNode }) {
  const focused = useIsFocused();
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // react-native-web'de View bir DOM öğesidir
    const node: unknown = ref.current;
    if (isInertCapable(node)) node.inert = !focused;
  }, [focused]);

  return (
    <View
      ref={ref}
      style={styles.fill}
      aria-hidden={!focused}
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
