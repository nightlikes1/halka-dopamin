// Parçacık tasarım dili ayar sabitleri (her iki çizim katmanı da kullanır)
import { activeThemeMode, colors } from '@core/theme/tokens';

// Parçacık ekranlarının zemini: aktif temanın zemini (modül tema uygulandıktan sonra yüklenir)
export const PARTICLE_BACKGROUND = colors.background;
// Açık temada toplamsal karışım krem zeminde kaybolur: normal karışım + koyulaştırılmış palet
export const PARTICLE_ON_LIGHT = activeThemeMode() === 'light';
// Ekran yoğunluğu sınırı (web canvas çözünürlüğü)
export const MAX_PIXEL_RATIO = 2;
// Ölçülen kare hızı bu değerin altındaysa parçacık sayısı düşürülür
export const MIN_TARGET_FPS = 50;
// Düşük güç modunda kalan parçacık oranı
export const LOW_POWER_FRACTION = 0.6;
// Kare hızı ilk kaç karede ölçülür
export const FPS_SAMPLE_FRAMES = 90;
// Bir kare en fazla bu kadar ilerler (sekme dönüşünde sıçramayı önler)
export const MAX_FRAME_DT = 0.05;
// Yumuşak nokta dokusunun piksel boyutu. Parçacık boyutu yarıçap kabul edilir; çizilen çap
// boyut × SPRITE_SPREAD (parlak çekirdek dokunun ortadaki ~%30'u)
export const SPRITE_SIZE = 32;
export const SPRITE_SPREAD = 4.5;
// Genel parlaklık (premium tema: sakin, göz yormayan parçacıklar); alfa bu oranla çarpılır
export const PARTICLE_INTENSITY = 0.75;
