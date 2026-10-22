// Günlük özet (Life Briefing) üretimi — web'deki briefing.js ile aynı kurallar
import { formatTurkishDate, toIsoDate } from '@core/utils/date';
import type { BriefingMetric, DailyBriefing } from '@domain/entities/Briefing';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import { PROFILE_FALLBACK_NAME } from '@domain/entities/Profile';
import { getCurrentStreak } from '@domain/entities/Streak';
import { getTaskProgress } from '@domain/entities/Task';
import { getWaterProgress } from '@domain/entities/Water';

export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Günaydın';
  if (hour >= 12 && hour < 18) return 'Tünaydın';
  if (hour >= 18 && hour < 22) return 'İyi akşamlar';
  return 'İyi geceler';
}

const SUMMARY_SUFFIX = ' Halkanın tüm döngüleri dengeli işliyor.';
const EMPTY_SUMMARY =
  'Bugün etrafına ekleyeceğin eklentilerle kişisel ritmini kurabilirsin. Halka hazır!';

export function generateDailyBriefing(snapshot: HalkaSnapshot, now: Date): DailyBriefing {
  const active = new Set(snapshot.activeWidgetIds);
  const today = toIsoDate(now);
  const metrics: BriefingMetric[] = [];
  const insights: string[] = [];

  if (active.has('water')) {
    const { current, target } = snapshot.water;
    const { pct } = getWaterProgress(snapshot.water);
    metrics.push({ icon: '💧', label: 'Su', value: `${current} / ${target} ml`, pct });
    if (pct >= 100) insights.push('Günlük su hedefine ulaştın! 💦');
    else if (pct >= 50) insights.push(`Su hedefinin %${pct}'si tamamlandı.`);
    else insights.push(`Bir bardak su ile enerjini tazele (%${pct}).`);
  }

  if (active.has('pomodoro')) {
    const sessions = snapshot.pomodoro.completedSessions;
    metrics.push({
      icon: '⏱️',
      label: 'Odak',
      value: `${sessions} Oturum`,
      pct: Math.min(100, sessions * 25),
    });
    if (sessions > 0) insights.push(`${sessions} derin odak seansı tamamlandı.`);
  }

  if (active.has('tasks')) {
    const { done, total } = getTaskProgress(snapshot.tasks);
    const pct = total > 0 ? Math.round((done / total) * 100) : 100;
    metrics.push({ icon: '✅', label: 'Görevler', value: `${done}/${total}`, pct });
    if (total === 0) insights.push('Henüz görev listesi boş, yeni hedefler belirleyebilirsin.');
    else if (done === total) insights.push('Tüm günlük görevlerin bitti, harikasın! 🎉');
    else insights.push(`${total - done} görev tamamlanmayı bekliyor.`);
  }

  if (active.has('streak')) {
    const current = getCurrentStreak(snapshot.streak, today);
    metrics.push({
      icon: '🔥',
      label: 'Zincir',
      value: `${current} Gün`,
      pct: Math.min(100, current * 10),
    });
    insights.push(`"${snapshot.streak.habitName}" zincirin ${current} gündür kırılmadı! ⛓️`);
  }

  if (active.has('bigOne') && snapshot.bigOne.goal) {
    const { goal, isCompleted } = snapshot.bigOne;
    insights.push(
      isCompleted
        ? `Günün ana hedefi ("${goal}") başarıyla tamamlandı! 🌟`
        : `Günün ana odağı: "${goal}"`,
    );
  }

  const summaryText =
    insights.length > 0 ? insights.slice(0, 2).join(' ') + SUMMARY_SUFFIX : EMPTY_SUMMARY;

  return {
    greeting: getGreeting(now.getHours()),
    userName: snapshot.profile.name.trim() || PROFILE_FALLBACK_NAME,
    dateText: formatTurkishDate(now),
    activeCount: snapshot.activeWidgetIds.length,
    summaryText,
    metrics,
  };
}
