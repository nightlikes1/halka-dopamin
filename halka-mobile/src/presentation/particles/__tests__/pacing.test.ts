import { createPace, paceFrame } from '@presentation/particles/renderer/pacing';

// Verilen tazeleme hızında 1 saniyede kaç kare çizildiğini sayar
function renderedPerSecond(hz: number): number {
  const pace = createPace();
  let rendered = 0;
  let total = 0;
  for (let i = 0; i < hz; i++) {
    const dt = paceFrame(pace, 1 / hz);
    if (dt > 0) {
      rendered += 1;
      total += dt;
    }
  }
  // Çizilen karelerin süreleri toplamı gerçek süreyi aşmaz
  expect(total).toBeLessThanOrEqual(1 + 1e-9);
  return rendered;
}

describe('paceFrame', () => {
  it('60 Hz ekranda her kare çizilir', () => {
    expect(renderedPerSecond(60)).toBe(60);
  });

  it('90, 120 ve 144 Hz ekranlarda ~60 fps çizilir', () => {
    expect(renderedPerSecond(90)).toBeGreaterThanOrEqual(58);
    expect(renderedPerSecond(90)).toBeLessThanOrEqual(62);
    expect(renderedPerSecond(120)).toBe(60);
    expect(renderedPerSecond(144)).toBeLessThanOrEqual(73);
  });

  it('yavaş cihazda kare atlamaz', () => {
    expect(renderedPerSecond(40)).toBe(40);
  });

  it('atlanan karelerin süresi çizilen kareye eklenir', () => {
    const pace = createPace();
    expect(paceFrame(pace, 1 / 120)).toBe(0);
    expect(paceFrame(pace, 1 / 120)).toBeCloseTo(1 / 60, 6);
  });
});
