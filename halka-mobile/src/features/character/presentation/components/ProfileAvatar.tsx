// Profil avatarı: dışta yakınlık halkası (turuncu), içte çizgi karakter + arkasında parçacık aura,
// altta halkadan taşan yakınlık etiketi (gecikmeli zıplayarak çıkar), sağ altta düzenle butonu.
import { StyleSheet, View } from 'react-native';
import { durations, staggers } from '@core/theme/motion';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import type { AvatarLook, Mood } from '@features/character/domain/look';
import {
  AvatarBadge,
  type AvatarFigure,
} from '@features/character/presentation/components/AvatarBadge';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { ProgressRing } from '@presentation/components/common/ProgressRing';

const SIZE = 210;
// viewBox 200 içinde: ekranda yarıçap 101, kalınlık 5
const RING_RADIUS = (101 * 200) / SIZE;
const RING_STROKE = (5 * 200) / SIZE;
const AVATAR_SIZE = 184;
const EDIT_SIZE = 44;

interface ProfileAvatarProps {
  readonly progress: number; // 0-1
  readonly figure: AvatarFigure;
  readonly look: AvatarLook;
  readonly mood: Mood;
  readonly dicebear?: DiceBearAvatar | null;
  readonly dicebearSeed?: string;
  // Yakınlık 0-1 (auranın canlılığı); bilinmiyorsa null
  readonly energy: number | null;
  readonly pillText: string;
  readonly accessibilityLabel: string;
  readonly onEdit?: () => void;
  readonly editLabel?: string;
}

export function ProfileAvatar({
  progress,
  figure,
  look,
  mood,
  dicebear,
  dicebearSeed,
  energy,
  pillText,
  accessibilityLabel,
  onEdit,
  editLabel,
}: ProfileAvatarProps) {
  return (
    <View style={styles.wrapper}>
      <View accessibilityLabel={accessibilityLabel} accessibilityRole="image">
        <ProgressRing
          size={SIZE}
          duration={durations.levelFill}
          rings={[
            {
              progress,
              color: colors.accent,
              radius: RING_RADIUS,
              strokeWidth: RING_STROKE,
            },
          ]}
        >
          <AvatarBadge
            figure={figure}
            look={look}
            mood={mood}
            size={AVATAR_SIZE}
            energy={energy}
            dicebear={dicebear}
            dicebearSeed={dicebearSeed}
          />
        </ProgressRing>
      </View>
      <Appear variant="pop" delay={staggers.levelPill} style={styles.pill}>
        <AppText variant="label" numberOfLines={1} style={styles.pillText}>
          {pillText}
        </AppText>
      </Appear>
      {onEdit && editLabel ? (
        // Konum dış kapta: IconButton stili iç (ölçeklenen) öğeye uygulanır
        <View style={styles.edit}>
          <IconButton
            icon="edit-2"
            variant="solid"
            color={colors.textPrimary}
            size={EDIT_SIZE}
            accessibilityLabel={editLabel}
            onPress={onEdit}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: spacing.md },
  pill: {
    position: 'absolute',
    bottom: -spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  pillText: { color: colors.gold, fontFamily: fonts.semibold },
  // Halkanın sağ alt çeyreğinde
  edit: {
    position: 'absolute',
    left: '50%',
    marginLeft: SIZE / 2 - EDIT_SIZE + spacing.xs,
    bottom: spacing.lg,
  },
});
