// Halka + çekirdek + altında günlük özet, metrikler ve "Eklenti Ekle" butonu.
// Telefonda okunabilirlik için durum metni halkanın içine değil altına alındı.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { layout } from '@core/theme/layout';
import { colors, radius, spacing } from '@core/theme/tokens';
import { PROFILE_NAME_MAX_LENGTH, resolveGreetingName } from '@domain/entities/Profile';
import { themedStyles } from '@core/theme/themed';
import { useAuth } from '@features/auth/presentation/useAuth';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { metricIcon } from '@presentation/components/common/iconMaps';
import { TextInputDialog } from '@presentation/components/common/TextInputDialog';
import { ChainRing } from '@presentation/components/ring/ChainRing';
import { CoreHub } from '@presentation/components/ring/CoreHub';
import { MetricPill } from '@presentation/components/ring/MetricPill';
import { useBriefing } from '@presentation/hooks/useBriefing';
import { useProfile } from '@presentation/hooks/useProfile';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useUiStore } from '@presentation/store/useUiStore';

interface RingSectionProps {
  readonly size: number;
  readonly onAddPress: () => void;
}

export function RingSection({ size, onAddPress }: RingSectionProps) {
  const briefing = useBriefing();
  const { user } = useAuth();
  const { profile, rename } = useProfile();
  const pulseKey = useUiStore((s) => s.ringPulseKey);
  const pulseRing = useUiStore((s) => s.pulseRing);
  const play = useSoundEffect();
  const [editingName, setEditingName] = useState(false);

  const onRingPress = () => {
    play('chainPulse');
    pulseRing();
  };

  return (
    <View style={styles.container}>
      {/* Halka butonu ile isim butonu kardeş: iç içe buton olmaz; çekirdeğin boş alanı dokunuşu halkaya geçirir */}
      <View style={{ width: size, height: size }}>
        <Pressable
          onPress={onRingPress}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Zincir halka"
        >
          <ChainRing size={size} pulseKey={pulseKey} />
        </Pressable>
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
