// Halka + çekirdek + altında günlük özet, metrikler ve "Eklenti Ekle" butonu.
// Telefonda okunabilirlik için durum metni halkanın içine değil altına alındı.
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ViewInstance,
} from 'react-native';
import { layout } from '@core/theme/layout';
import { colors, radius, spacing } from '@core/theme/tokens';
import {
  PROFILE_NAME_MAX_LENGTH,
  resolveGreetingName,
} from '@features/halka/domain/entities/Profile';
import { themedStyles } from '@core/theme/themed';
import { useAuth } from '@features/auth/presentation/useAuth';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { metricIcon } from '@features/halka/presentation/components/iconMaps';
import { TextInputDialog } from '@features/halka/presentation/components/TextInputDialog';
import { CoreHub } from '@features/halka/presentation/components/ring/CoreHub';
import { MetricPill } from '@features/halka/presentation/components/ring/MetricPill';
import { TapRipple } from '@features/halka/presentation/components/ring/TapRipple';
import { ParticleHalo } from '@presentation/particles/components/ParticleHalo';
import { HALO_REFERENCE_WIDTH } from '@presentation/particles/engine/haloEngine';
import { useParticlePointer } from '@presentation/particles/renderer/useParticlePointer';
import { useBriefing } from '@features/halka/presentation/hooks/useBriefing';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import { useSoundEffect } from '@features/halka/presentation/hooks/useSoundEffect';
import { useUiStore } from '@features/halka/presentation/store/useUiStore';

interface RingSectionProps {
  readonly size: number;
  readonly onAddPress: () => void;
}

export function RingSection({ size, onAddPress }: RingSectionProps) {
  const briefing = useBriefing();
  const { user } = useAuth();
  const { profile, rename } = useProfile();
  // Kıvılcım yalnızca eklenti eklenince/çıkarılınca; dokunuşta su damlası (TapRipple)
  const pulseKey = useUiStore((s) => s.ringPulseKey);
  const play = useSoundEffect();
  const [editingName, setEditingName] = useState(false);
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);
  const ringBox = useRef<ViewInstance | null>(null);
  // Halka alanındaki dokunuş/sürükleme hale parçacıklarını iter (olaylar yalnızca izlenir)
  const { channel, targetRef, handlers } = useParticlePointer(HALO_REFERENCE_WIDTH);

  const onRingPress = (event: GestureResponderEvent) => {
    play('chainPulse');
    // Konum ekrana göre alınıp kutuya çevrilir (kaydırılan listede de doğru yerde çıkar)
    const { pageX, pageY } = event.nativeEvent;
    ringBox.current?.measureInWindow((boxX, boxY) => {
      setRipple((previous) => ({
        id: (previous?.id ?? 0) + 1,
        x: pageX - boxX,
        y: pageY - boxY,
      }));
    });
  };

  return (
    <View style={styles.container}>
      {/* Halka butonu ile isim butonu kardeş: iç içe buton olmaz; çekirdeğin boş alanı dokunuşu halkaya geçirir */}
      <View ref={ringBox} style={{ width: size, height: size }} {...handlers}>
        <ParticleHalo size={size} burstKey={pulseKey} pointer={channel} targetRef={targetRef} />
        <Pressable
          onPress={onRingPress}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Halka"
        />
        {ripple ? <TapRipple key={ripple.id} x={ripple.x} y={ripple.y} /> : null}
        <View style={styles.hubWrapper} pointerEvents="box-none">
          <CoreHub
            diameter={size * 0.66}
            briefing={{
              ...briefing,
              userName: resolveGreetingName(user?.displayName, briefing.userName),
            }}
            onEditName={() => setEditingName(true)}
          />
        </View>
      </View>

      <View style={styles.statusBox}>
        <AppText variant="muted" style={styles.statusText}>
          {briefing.summaryText}
        </AppText>
      </View>

      <View style={styles.metrics}>
        {briefing.metrics.length > 0 ? (
          briefing.metrics.map((metric) => (
            <MetricPill
              key={metric.label}
              icon={metricIcon(metric.label)}
              value={metric.value}
              label={metric.label}
            />
          ))
        ) : (
          <MetricPill icon="plus-circle" value="Etrafına + ile eklenti ekle" hint />
        )}
      </View>

      <ActionButton label="Eklenti Ekle" icon="plus" onPress={onAddPress} />

      <TextInputDialog
        visible={editingName}
        title="Halka sana nasıl hitap etsin?"
        initialValue={profile.name}
        maxLength={PROFILE_NAME_MAX_LENGTH}
        emptyMessage="İsim boş olamaz."
        placeholder="İsmin"
        onSubmit={rename}
        onClose={() => setEditingName(false)}
      />
    </View>
  );
}

const styles = themedStyles(() => ({
  container: { alignItems: 'center', gap: spacing.md },
  hubWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.bgCard,
  },
  statusText: { textAlign: 'center' },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: layout.contentMaxWidth,
  },
}));
