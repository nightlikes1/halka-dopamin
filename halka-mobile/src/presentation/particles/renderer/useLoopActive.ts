// Kare döngüsü yalnızca ekran odaktayken ve uygulama ön plandayken çalışır.
// Web'de AppState sekme görünürlüğünü de yansıtır (gizli sekme = arka plan).
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useLoopActive(): boolean {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return focused && foreground;
}
