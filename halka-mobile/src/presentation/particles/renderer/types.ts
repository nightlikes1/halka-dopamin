// Çizim katmanı sözleşmesi: bir simülasyon (motor) + girdiler + palet (+ isteğe bağlı dokunma kanalı).
// Mobil (Skia) ve web (2D canvas) çizicileri aynı props'u alır.
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { ParticleOutput } from '@presentation/particles/engine/types';

export interface ParticleSim<S extends ParticleOutput> {
  // Koordinatların referans genişliği (varsayılan 390); çizici genişliğe orantılı ölçekler
  readonly referenceWidth?: number;
  // JS tarafında bir kez çağrılır
  readonly create: () => S;
  // Her karede; worklet olmalı (mobilde UI thread'de çalışır). pointer: interaction.ts tamponu
  readonly step: (
    state: S,
    dt: number,
    inputs: readonly number[],
    activeFraction: number,
    pointer: Float32Array,
  ) => void;
  // "Hareketi azalt" açıkken: animasyonsuz son duruma getirir (worklet)
  readonly settle: (state: S, inputs: readonly number[]) => void;
}

// Dokunma kanalı: useParticlePointer yazar, çizici her karede okur (interaction.ts CHANNEL_SIZE)
export type PointerChannel = SharedValue<readonly number[]>;

export interface ParticleCanvasProps<S extends ParticleOutput> {
  readonly sim: ParticleSim<S>;
  // Simülasyona özgü girdiler (ör. [hedef ilerleme, patlama no])
  readonly inputs: readonly number[];
  // Renk tablosu (buildLut çıktısı)
  readonly lut: Float32Array;
  // Kare hızı ölçümü için ad (web'de globalThis.__halkaParticleFps[name])
  readonly name: string;
  readonly pointer?: PointerChannel;
  readonly style?: StyleProp<ViewStyle>;
}
