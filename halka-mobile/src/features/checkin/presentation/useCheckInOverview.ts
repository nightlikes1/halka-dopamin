// Bugün sekmesi için check-in durumu (bugün + dün); ekran her odaklandığında tazelenir
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { CheckInOverview } from '@features/checkin/domain/usecases/CheckInUseCases';
import { useDI } from '@presentation/providers/DIProvider';

type OverviewState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'ready'; readonly overview: CheckInOverview };

export function useCheckInOverview() {
  const { checkIn } = useDI();
  const [state, setState] = useState<OverviewState>({ kind: 'loading' });

  const reload = useCallback(async () => {
    const result = await checkIn.overview.execute();
    setState(
      result.ok
        ? { kind: 'ready', overview: result.value }
        : { kind: 'error', message: result.error.message },
    );
  }, [checkIn]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { state, reload };
}
