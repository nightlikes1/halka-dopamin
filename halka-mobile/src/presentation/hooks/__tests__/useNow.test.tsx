// useNow: kapalıyken eskiyen zaman, etkinleştiği ilk çizimde tazelenmeli (Pomodoro 25:00 → 25:32 zıplaması)
import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import type { AppContainer } from '@core/di/container';
import { useNow } from '@presentation/hooks/useNow';
import { DIProvider } from '@presentation/providers/DIProvider';

function setup(enabled: boolean) {
  let current = 1_000_000;
  const container = { clock: { now: () => new Date(current) } } as unknown as AppContainer;
  const wrapper = ({ children }: { readonly children: ReactNode }) => (
    <DIProvider container={container}>{children}</DIProvider>
  );
  const seen: number[] = [];
  const hook = renderHook(
    ({ on }: { on: boolean }) => {
      const now = useNow(1000, on);
      seen.push(now.getTime());
      return now;
    },
    { initialProps: { on: enabled }, wrapper },
  );
  return { hook, seen, advance: (ms: number) => (current += ms) };
}

describe('useNow', () => {
  it('etkinleşince bayat zamanla çizilen son değer kalmaz', async () => {
    const { hook, seen, advance } = setup(false);
    const rendered = await hook;
    advance(32_000);
    seen.length = 0;

    await rendered.rerender({ on: true });

    // Render sırasında tazelenir: ekrana giden değer güncel saat
    expect(rendered.result.current.getTime()).toBe(1_032_000);
    expect(seen.at(-1)).toBe(1_032_000);
  });

  it('kapalıyken saat ilerlese de değer değişmez', async () => {
    const { hook, advance } = setup(false);
    const rendered = await hook;
    advance(5_000);

    await rendered.rerender({ on: false });

    expect(rendered.result.current.getTime()).toBe(1_000_000);
  });
});
