// Çizgi karakter (Bitmoji benzeri büst): ten, yüz, saç, göz, kaş, ağız, sakal, gözlük, aksesuar, kıyafet.
// viewBox 200×200; baş merkezi (100, HEAD_Y). Ruh hali ifadeyi (ağız eğrisi, göz kapağı, kaş, yanak)
// ve duruşu (nefes alır gibi hafif salınım) değiştirir. Göz kırpma ve salınım "hareketi azalt"ta kapalı.
import { useEffect, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { mixHex, withAlpha } from '@core/theme/palettes';
import { avatarColors } from '@core/theme/tokens';
import type { AvatarLook, Mood } from '@features/character/domain/look';
import { themedStyles } from '@core/theme/themed';

const HEAD_Y = 84;
const EYE_DX = 15;
const BLINK_EVERY = 4200;
const BLINK_MS = 140;

// Ruh haline göre ifade: ağız eğrisi (−1…1), göz kapağı (0 açık…1 kapalı), kaş kalkışı, yanak
const EXPRESSION: Readonly<
  Record<
    Mood,
    { smile: number; lid: number; brow: number; blush: number; bob: number; period: number }
  >
> = {
  resting: { smile: 0.1, lid: 0.45, brow: -2, blush: 0, bob: 1.5, period: 3600 },
  calm: { smile: 0.45, lid: 0.12, brow: 0, blush: 0.12, bob: 2, period: 3000 },
  good: { smile: 0.8, lid: 0, brow: 1.5, blush: 0.25, bob: 2.5, period: 2400 },
  energetic: { smile: 1, lid: 0, brow: 3, blush: 0.4, bob: 3.5, period: 1600 },
};

interface FaceGeometry {
  readonly rx: number;
  readonly ry: number;
}

const FACE: Readonly<Record<AvatarLook['face'], FaceGeometry>> = {
  oval: { rx: 37, ry: 45 },
  round: { rx: 41, ry: 42 },
  square: { rx: 39, ry: 44 },
  long: { rx: 35, ry: 49 },
};

// Uçları y0'da olan kübik kubbenin tepesi "peak"e ulaşsın diye kontrol noktası yüksekliği
// (iki kontrol noktası aynı yükseklikteyse tepe = 0,25·y0 + 0,75·kontrol)
const dome = (y0: number, peak: number) => (peak - 0.25 * y0) / 0.75;

// Kıyafet paletinin canlı renkleri (nötr beyaz ve koyu gri hariç)
const VIVID: readonly string[] = avatarColors.top.filter((_, index) => index !== 5 && index !== 6);

const pick = (list: readonly string[], index: number) => list[index] ?? list[0] ?? '#000000';

interface Palette {
  readonly skin: string;
  readonly skinShade: string;
  readonly skinDeep: string;
  readonly hair: string;
  readonly hairShade: string;
  readonly top: string;
  readonly topShade: string;
  readonly topLight: string;
  readonly accessory: string;
}

function paletteFor(look: AvatarLook): Palette {
  const skin = pick(avatarColors.skin, look.skin);
  const hair = pick(avatarColors.hair, look.hairColor);
  const top = pick(avatarColors.top, look.topColor);
  return {
    skin,
    skinShade: mixHex(skin, avatarColors.outline, 0.18),
    skinDeep: mixHex(skin, avatarColors.outline, 0.42),
    hair,
    hairShade: mixHex(hair, avatarColors.pupil, 0.35),
    top,
    topShade: mixHex(top, avatarColors.pupil, 0.28),
    topLight: mixHex(top, avatarColors.teeth, 0.45),
    // Aksesuar kıyafetle uyumlu ama farklı ton; yalnızca canlı renkler (koyu zeminde kaybolmasın)
    accessory: pick(VIVID, (VIVID.indexOf(top) + 2 + VIVID.length) % VIVID.length),
  };
}

// ---------- Parçalar (hepsi saf çizim fonksiyonu) ----------

function Face({ look, p, g }: { look: AvatarLook; p: Palette; g: FaceGeometry }) {
  const ears = (
    <>
      {[-1, 1].map((side) => (
        <G key={side}>
          <Circle cx={100 + side * (g.rx - 1)} cy={HEAD_Y + 6} r={9} fill={p.skin} />
          <Circle cx={100 + side * (g.rx + 1)} cy={HEAD_Y + 6} r={4.5} fill={p.skinShade} />
        </G>
      ))}
    </>
  );
  const head =
    look.face === 'square' ? (
      <Rect
        x={100 - g.rx}
        y={HEAD_Y - g.ry}
        width={g.rx * 2}
        height={g.ry * 2}
        rx={22}
        fill={p.skin}
      />
    ) : (
      <Ellipse cx={100} cy={HEAD_Y} rx={g.rx} ry={g.ry} fill={p.skin} />
    );
  return (
    <>
      {ears}
      {head}
    </>
  );
}

function Body({ look, p }: { look: AvatarLook; p: Palette }) {
  const neck = (
    <>
      <Rect x={88} y={HEAD_Y + 20} width={24} height={52} rx={10} fill={p.skin} />
      {/* Çene gölgesi */}
      <Ellipse cx={100} cy={HEAD_Y + 38} rx={14} ry={7} fill={p.skinShade} />
    </>
  );
  const shoulders = 'M22 200 C26 170 50 155 82 151 L118 151 C150 155 174 170 178 200 Z';

  if (look.top === 'tank') {
    return (
      <>
        {neck}
        <Path d={shoulders} fill={p.skin} />
        <Path d="M62 200 L68 156 Q100 176 132 156 L138 200 Z" fill={p.top} />
        <Path d="M68 156 Q100 176 132 156" stroke={p.topShade} strokeWidth={3} fill="none" />
      </>
    );
  }
  return (
    <>
      {neck}
      {look.top === 'hoodie' ? (
        // Kapüşon boynun arkasında
        <Path d="M64 160 Q100 128 136 160 Q100 150 64 160 Z" fill={p.topShade} />
      ) : null}
      <Path d={shoulders} fill={p.top} />
      {look.top === 'tee' ? <Path d="M84 151 Q100 170 116 151 Z" fill={p.skin} /> : null}
      {look.top === 'tee' ? (
        <Path d="M84 151 Q100 170 116 151" stroke={p.topShade} strokeWidth={3} fill="none" />
      ) : null}
      {look.top === 'hoodie' ? (
        <>
          <Path d="M82 151 Q100 172 118 151 Z" fill={p.skin} />
          <Path d="M78 151 Q100 178 122 151" stroke={p.topShade} strokeWidth={5} fill="none" />
          <Line x1={92} y1={168} x2={90} y2={190} stroke={p.topLight} strokeWidth={2.5} />
          <Line x1={108} y1={168} x2={110} y2={190} stroke={p.topLight} strokeWidth={2.5} />
        </>
      ) : null}
      {look.top === 'shirt' ? (
        <>
          <Path d="M86 151 L100 172 L114 151 Z" fill={p.skin} />
          <Path d="M84 148 L100 172 L90 176 L78 156 Z" fill={p.topLight} />
          <Path d="M116 148 L100 172 L110 176 L122 156 Z" fill={p.topLight} />
          <Line x1={100} y1={174} x2={100} y2={200} stroke={p.topShade} strokeWidth={2} />
          <Circle cx={100} cy={184} r={1.8} fill={p.topShade} />
          <Circle cx={100} cy={194} r={1.8} fill={p.topShade} />
        </>
      ) : null}
      {look.top === 'sweater' ? (
        <>
          <Path d="M84 151 Q100 166 116 151 Z" fill={p.skin} />
          <Path d="M82 150 Q100 170 118 150" stroke={p.topShade} strokeWidth={6} fill="none" />
          <Line x1={60} y1={186} x2={140} y2={186} stroke={p.topShade} strokeWidth={1.5} />
        </>
      ) : null}
    </>
  );
}

// Arka saç (başın arkasında kalan kısım)
function HairBack({ look, p, g }: { look: AvatarLook; p: Palette; g: FaceGeometry }) {
  const top = HEAD_Y - g.ry;
  const L = 100 - g.rx;
  const R = 100 + g.rx;
  switch (look.hair) {
    case 'long':
      return (
        <Path
          d={`M${L - 8} ${HEAD_Y} C${L - 14} ${dome(HEAD_Y, top - 8)} ${R + 14} ${dome(HEAD_Y, top - 8)} ${R + 8} ${HEAD_Y} L${R + 12} ${HEAD_Y + 66} Q100 ${HEAD_Y + 76} ${L - 12} ${HEAD_Y + 66} Z`}
          fill={p.hairShade}
        />
      );
    case 'bob':
      return (
        <Path
          d={`M${L - 9} ${HEAD_Y + 30} C${L - 16} ${dome(HEAD_Y + 30, top - 5)} ${R + 16} ${dome(HEAD_Y + 30, top - 5)} ${R + 9} ${HEAD_Y + 30} Q100 ${HEAD_Y + 36} ${L - 9} ${HEAD_Y + 30} Z`}
          fill={p.hairShade}
        />
      );
    case 'afro':
      return <Circle cx={100} cy={HEAD_Y - 12} r={g.rx + 24} fill={p.hair} />;
    case 'bun':
      return <Circle cx={100} cy={top - 8} r={15} fill={p.hair} />;
    default:
      return null;
  }
}

// Ön saç (alın ve tepe)
function HairFront({ look, p, g }: { look: AvatarLook; p: Palette; g: FaceGeometry }) {
  const top = HEAD_Y - g.ry;
  const L = 100 - g.rx;
  const R = 100 + g.rx;
  const cap = `M${L - 2} ${HEAD_Y - 4} C${L - 4} ${dome(HEAD_Y - 4, top - 4)} ${R + 4} ${dome(HEAD_Y - 4, top - 4)} ${R + 2} ${HEAD_Y - 4} C${R - 4} ${top + 18} 122 ${top + 14} 100 ${top + 17} C78 ${top + 14} ${L + 4} ${top + 20} ${L - 2} ${HEAD_Y - 4} Z`;
  switch (look.hair) {
    case 'short':
    case 'bun':
      return <Path d={cap} fill={p.hair} />;
    case 'buzz':
      return (
        <Path
          d={`M${L + 1} ${HEAD_Y - 12} C${L} ${dome(HEAD_Y - 12, top - 1)} ${R} ${dome(HEAD_Y - 12, top - 1)} ${R - 1} ${HEAD_Y - 12} C${R - 6} ${top + 10} ${L + 6} ${top + 10} ${L + 1} ${HEAD_Y - 12} Z`}
          fill={p.hair}
          opacity={0.85}
        />
      );
    case 'side':
    case 'long':
      return (
        <Path
          d={`M${L - 3} ${HEAD_Y + 2} C${L - 7} ${dome(HEAD_Y - 1, top - 4)} ${R + 7} ${dome(HEAD_Y - 1, top - 6)} ${R + 3} ${HEAD_Y - 4} C${R - 2} ${top + 22} 114 ${top + 10} 90 ${top + 22} C72 ${top + 30} ${L + 5} ${top + 28} ${L - 3} ${HEAD_Y + 2} Z`}
          fill={p.hair}
        />
      );
    case 'bob':
      return (
        <Path
          d={`M${L - 3} ${HEAD_Y - 2} C${L - 2} ${dome(HEAD_Y - 2, top - 4)} ${R + 2} ${dome(HEAD_Y - 2, top - 4)} ${R + 3} ${HEAD_Y - 2} L${R - 3} ${top + 26} Q100 ${top + 22} ${L + 3} ${top + 26} Z`}
          fill={p.hair}
        />
      );
    case 'curly':
    case 'afro': {
      // Saç çizgisi boyunca küçük bukleler
      const count = look.hair === 'afro' ? 9 : 11;
      const radius = look.hair === 'afro' ? 9 : 10;
      return (
        <>
          {Array.from({ length: count }, (_, i) => {
            const angle = Math.PI * (0.05 + (0.9 * i) / (count - 1));
            return (
              <Circle
                key={i}
                cx={100 - Math.cos(angle) * (g.rx + 2)}
                cy={HEAD_Y - 8 - Math.sin(angle) * (g.ry - 4)}
                r={radius}
                fill={i % 2 === 0 ? p.hair : p.hairShade}
              />
            );
          })}
        </>
      );
    }
    case 'mohawk':
      return (
        <>
          <Path
            d={`M${L + 4} ${HEAD_Y - 14} C${L + 2} ${top + 2} ${R - 2} ${top + 2} ${R - 4} ${HEAD_Y - 14}`}
            stroke={p.hair}
            strokeWidth={3}
            opacity={0.35}
            fill="none"
          />
          <Path
            d={`M88 ${top + 12} Q92 ${top - 22} 100 ${top - 26} Q108 ${top - 22} 112 ${top + 12} Q100 ${top + 6} 88 ${top + 12} Z`}
            fill={p.hair}
          />
        </>
      );
    case 'bald':
      return (
        <Ellipse cx={86} cy={top + 12} rx={9} ry={4} fill={avatarColors.teeth} opacity={0.18} />
      );
  }
}

function Eyes({ look, lid, p }: { look: AvatarLook; lid: number; p: Palette }) {
  const y = HEAD_Y - 2;
  return (
    <>
      {[-1, 1].map((side) => {
        const x = 100 + side * EYE_DX;
        if (look.eyes === 'narrow') {
          return (
            <Ellipse
              key={side}
              cx={x}
              cy={y}
              rx={4.5}
              ry={Math.max(0.8, 3 * (1 - lid))}
              fill={avatarColors.pupil}
            />
          );
        }
        const big = look.eyes === 'wide' ? 9 : 7.5;
        const white =
          look.eyes === 'almond' ? (
            <Path
              d={`M${x - 9} ${y} Q${x} ${y - 9} ${x + 9} ${y} Q${x} ${y + 7} ${x - 9} ${y} Z`}
              fill={avatarColors.eyeWhite}
            />
          ) : (
            <Ellipse cx={x} cy={y} rx={big - 1} ry={big} fill={avatarColors.eyeWhite} />
          );
        const pupil = look.eyes === 'wide' ? 4.8 : 4.2;
        const lidHeight = (look.eyes === 'almond' ? 10 : big * 2 + 1) * lid;
        return (
          <G key={side}>
            {white}
            <Circle cx={x + side * 0.6} cy={y + 0.5} r={pupil} fill={avatarColors.pupil} />
            <Circle cx={x + 1.6} cy={y - 1.6} r={1.4} fill={avatarColors.eyeWhite} />
            {lid > 0 ? (
              // Göz kapağı ten renginde, üstten iner
              <Rect
                x={x - big - 2}
                y={y - big - 1}
                width={(big + 2) * 2}
                height={lidHeight}
                fill={p.skin}
              />
            ) : null}
            {lid > 0 ? (
              <Line
                x1={x - big}
                y1={y - big - 1 + lidHeight}
                x2={x + big}
                y2={y - big - 1 + lidHeight}
                stroke={p.skinDeep}
                strokeWidth={1.5}
              />
            ) : null}
          </G>
        );
      })}
    </>
  );
}

function Brows({ look, lift, color }: { look: AvatarLook; lift: number; color: string }) {
  const y = HEAD_Y - 17 - lift;
  const arch = look.brows === 'arched' ? 6 : look.brows === 'straight' ? 0 : 3;
  const width = look.brows === 'thick' ? 5.5 : 3;
  // Dinlenirken kaşların iç ucu hafif kalkar (yumuşak, yorgun ifade)
  const tilt = lift < 0 ? 2 : 0;
  return (
    <>
      {[-1, 1].map((side) => {
        const inner = 100 + side * 7;
        const outer = 100 + side * 22;
        return (
          <Path
            key={side}
            d={`M${inner} ${y - tilt} Q${(inner + outer) / 2} ${y - arch} ${outer} ${y + 1}`}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </>
  );
}

function Mouth({ look, smile }: { look: AvatarLook; smile: number }) {
  const y = HEAD_Y + 24;
  const curve = 3 + smile * 10;
  switch (look.mouth) {
    case 'smile':
      return (
        <Path
          d={`M88 ${y} Q100 ${y + curve} 112 ${y}`}
          stroke={avatarColors.mouth}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'small':
      return (
        <Path
          d={`M95 ${y + 1} Q100 ${y + 1 + curve * 0.5} 105 ${y + 1}`}
          stroke={avatarColors.mouth}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'lips':
      return (
        <>
          <Path
            d={`M89 ${y} Q94 ${y - 4} 100 ${y - 1} Q106 ${y - 4} 111 ${y} Q100 ${y + 2} 89 ${y} Z`}
            fill={avatarColors.mouth}
          />
          <Path
            d={`M89 ${y} Q100 ${y + 2 + curve * 0.6} 111 ${y} Q100 ${y + 2} 89 ${y} Z`}
            fill={avatarColors.tongue}
          />
        </>
      );
    case 'teeth':
      return (
        <>
          <Path d={`M86 ${y - 1} Q100 ${y + 4 + curve} 114 ${y - 1} Z`} fill={avatarColors.mouth} />
          <Path
            d={`M87 ${y - 1} Q100 ${y + 2 + curve * 0.35} 113 ${y - 1} Z`}
            fill={avatarColors.teeth}
          />
        </>
      );
  }
}

function FacialHairPart({ look, p, g }: { look: AvatarLook; p: Palette; g: FaceGeometry }) {
  const y = HEAD_Y + 24;
  const L = 100 - g.rx;
  const R = 100 + g.rx;
  const chin = HEAD_Y + g.ry;
  const mustache = (
    <Path
      d={`M85 ${y - 5} Q92 ${y - 12} 100 ${y - 7} Q108 ${y - 12} 115 ${y - 5} Q107 ${y - 3} 100 ${y - 5} Q93 ${y - 3} 85 ${y - 5} Z`}
      fill={p.hair}
    />
  );
  switch (look.facialHair) {
    case 'none':
      return null;
    case 'stubble':
      return (
        <Path
          d={`M${L + 3} ${HEAD_Y + 8} Q${L + 6} ${chin} 100 ${chin + 1} Q${R - 6} ${chin} ${R - 3} ${HEAD_Y + 8} Q100 ${HEAD_Y + 44} ${L + 3} ${HEAD_Y + 8} Z`}
          fill={p.hair}
          opacity={0.22}
        />
      );
    case 'mustache':
      return mustache;
    case 'beard':
      return (
        <>
          <Path
            d={`M${L + 1} ${HEAD_Y + 2} Q${L + 2} ${chin + 8} 100 ${chin + 10} Q${R - 2} ${chin + 8} ${R - 1} ${HEAD_Y + 2} Q${R - 6} ${HEAD_Y + 20} 112 ${y + 2} Q100 ${y + 12} 88 ${y + 2} Q${L + 6} ${HEAD_Y + 20} ${L + 1} ${HEAD_Y + 2} Z`}
            fill={p.hair}
          />
          {mustache}
        </>
      );
    case 'goatee':
      return (
        <>
          <Path
            d={`M91 ${y + 8} Q100 ${y + 20} 109 ${y + 8} Q100 ${y + 12} 91 ${y + 8} Z`}
            fill={p.hair}
          />
          {mustache}
        </>
      );
  }
}

function GlassesPart({ look }: { look: AvatarLook }) {
  const y = HEAD_Y - 2;
  const frame = avatarColors.outline;
  if (look.glasses === 'none') return null;
  const lenses = [-1, 1].map((side) => {
    const x = 100 + side * EYE_DX;
    if (look.glasses === 'round') {
      return (
        <Circle key={side} cx={x} cy={y} r={11} stroke={frame} strokeWidth={2.5} fill="none" />
      );
    }
    const sun = look.glasses === 'sun';
    return (
      <Rect
        key={side}
        x={x - 12}
        y={y - 9}
        width={24}
        height={18}
        rx={6}
        stroke={frame}
        strokeWidth={2.5}
        fill={sun ? avatarColors.lens : 'none'}
        fillOpacity={sun ? 0.92 : 0}
      />
    );
  });
  return (
    <>
      {lenses}
      <Path
        d={`M${100 - 4} ${y - 2} Q100 ${y - 5} ${100 + 4} ${y - 2}`}
        stroke={frame}
        strokeWidth={2.5}
        fill="none"
      />
      {look.glasses === 'sun' ? (
        <>
          <Line
            x1={80}
            y1={y - 4}
            x2={86}
            y2={y - 7}
            stroke={avatarColors.teeth}
            strokeWidth={1.5}
            opacity={0.5}
          />
          <Line
            x1={110}
            y1={y - 4}
            x2={116}
            y2={y - 7}
            stroke={avatarColors.teeth}
            strokeWidth={1.5}
            opacity={0.5}
          />
        </>
      ) : null}
    </>
  );
}

function AccessoryPart({ look, p, g }: { look: AvatarLook; p: Palette; g: FaceGeometry }) {
  const top = HEAD_Y - g.ry;
  const L = 100 - g.rx;
  const R = 100 + g.rx;
  const band = mixHex(p.accessory, avatarColors.pupil, 0.25);
  switch (look.accessory) {
    case 'none':
      return null;
    case 'beanie':
      return (
        <>
          <Path
            d={`M${L - 4} ${top + 16} C${L - 4} ${dome(top + 16, top - 10)} ${R + 4} ${dome(top + 16, top - 10)} ${R + 4} ${top + 16} Z`}
            fill={p.accessory}
          />
          <Rect x={L - 6} y={top + 8} width={g.rx * 2 + 12} height={12} rx={7} fill={band} />
          <Circle cx={100} cy={top - 16} r={7} fill={band} />
        </>
      );
    case 'cap':
      return (
        <>
          <Path
            d={`M${L - 3} ${top + 15} C${L - 2} ${dome(top + 15, top - 8)} ${R + 2} ${dome(top + 15, top - 8)} ${R + 3} ${top + 15} Z`}
            fill={p.accessory}
          />
          <Path
            d={`M${L - 6} ${top + 15} Q100 ${top + 7} ${R + 30} ${top + 17} Q${R + 20} ${top + 25} ${L - 6} ${top + 19} Z`}
            fill={band}
          />
          <Circle cx={100} cy={top - 8} r={3} fill={band} />
        </>
      );
    case 'headband':
      return (
        <Path
          d={`M${L - 1} ${top + 16} Q100 ${top - 2} ${R + 1} ${top + 16} L${R} ${top + 23} Q100 ${top + 6} ${L} ${top + 23} Z`}
          fill={p.accessory}
        />
      );
    case 'earrings':
      return (
        <>
          {[-1, 1].map((side) => (
            <Circle
              key={side}
              cx={100 + side * (g.rx - 1)}
              cy={HEAD_Y + 17}
              r={3}
              fill={pick(avatarColors.hair, 4)}
            />
          ))}
        </>
      );
  }
}

// ---------- Bileşen ----------

interface CartoonAvatarProps {
  readonly look: AvatarLook;
  readonly mood: Mood;
  readonly size: number;
  // Salınım ve göz kırpma (seçim kutucuklarında kapalı)
  readonly animated?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

export function CartoonAvatar({ look, mood, size, animated = true, style }: CartoonAvatarProps) {
  const reduced = useReducedMotion();
  const live = animated && !reduced;
  const expression = EXPRESSION[mood];
  const p = paletteFor(look);
  const g = FACE[look.face];
  const browColor = look.hair === 'bald' ? p.skinDeep : p.hairShade;

  // Göz kırpma: birkaç saniyede bir kısa süre kapanır
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!live) return undefined;
    let close: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setBlink(true);
      close = setTimeout(() => setBlink(false), BLINK_MS);
    }, BLINK_EVERY);
    return () => {
      clearInterval(timer);
      if (close) clearTimeout(close);
    };
  }, [live]);

  // Nefes alır gibi hafif yukarı-aşağı salınım; enerjik ruh halinde daha hızlı
  const bob = useSharedValue(0);
  useEffect(() => {
    if (!live) {
      bob.set(0);
      return;
    }
    const half = expression.period / 2;
    const ease = Easing.inOut(Easing.sin);
    bob.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: half, easing: ease }),
          withTiming(0, { duration: half, easing: ease }),
        ),
        -1,
      ),
    );
  }, [live, expression.period, bob]);
  const amplitude = (expression.bob * size) / 200;
  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * amplitude }],
  }));

  const lid = blink ? 1 : expression.lid;

  return (
    <Animated.View style={[{ width: size, height: size }, style, bobStyle]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Body look={look} p={p} />
        <HairBack look={look} p={p} g={g} />
        <Face look={look} p={p} g={g} />
        {expression.blush > 0 ? (
          <>
            {[-1, 1].map((side) => (
              <Ellipse
                key={side}
                cx={100 + side * 24}
                cy={HEAD_Y + 14}
                rx={7}
                ry={4}
                fill={withAlpha(avatarColors.blush, '66')}
                opacity={expression.blush / 0.4}
              />
            ))}
          </>
        ) : null}
        <FacialHairPart look={look} p={p} g={g} />
        <Eyes look={look} lid={lid} p={p} />
        <Brows look={look} lift={expression.brow} color={browColor} />
        <Path
          d={`M98 ${HEAD_Y + 6} Q94 ${HEAD_Y + 14} 100 ${HEAD_Y + 15}`}
          stroke={p.skinDeep}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        <Mouth look={look} smile={expression.smile} />
        {look.accessory === 'beanie' || look.accessory === 'cap' ? null : (
          <HairFront look={look} p={p} g={g} />
        )}
        <GlassesPart look={look} />
        <AccessoryPart look={look} p={p} g={g} />
      </Svg>
    </Animated.View>
  );
}

export const cartoonStyles = themedStyles(() => ({
  // Daire içinde büst: alt kenar dairenin dibine otursun
  inCircle: { position: 'absolute', bottom: 0, alignSelf: 'center' },
}));
