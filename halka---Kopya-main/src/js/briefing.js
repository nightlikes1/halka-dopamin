// Dynamic Life OS Briefing & Center Ring Status Generator

export function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Günaydın';
  if (hour >= 12 && hour < 18) return 'Tünaydın';
  if (hour >= 18 && hour < 22) return 'İyi akşamlar';
  return 'İyi geceler';
}

export function formatTurkishDate() {
  const now = new Date();
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dayNum = now.getDate();
  const year = now.getFullYear();

  return `${dayNum} ${monthName} ${year}, ${dayName}`;
}

export function generateDailyBriefing(storageManager) {
  const profile = storageManager.getProfile();
  const activeIds = storageManager.getActiveWidgetIds();
  const widgetsData = storageManager.data.widgetsData;

  const name = profile.name || 'Dostum';
  const greeting = getGreetingTime();

  // Metric highlights
  const metrics = [];
  const statusInsights = [];

  if (activeIds.includes('water') && widgetsData.water) {
    const { current, target } = widgetsData.water;
    const pct = Math.min(100, Math.round((current / (target || 2000)) * 100));
    metrics.push({
      icon: '💧',
      label: 'Su',
      value: `${current} / ${target} ml`,
      pct: pct
    });
    if (pct >= 100) {
      statusInsights.push('Günlük su hedefine ulaştın! 💦');
    } else if (pct >= 50) {
      statusInsights.push(`Su hedefinin %${pct}'si tamamlandı.`);
    } else {
      statusInsights.push(`Bir bardak su ile enerjini tazele (%${pct}).`);
    }
  }

  if (activeIds.includes('pomodoro') && widgetsData.pomodoro) {
    const { completedSessions } = widgetsData.pomodoro;
    metrics.push({
      icon: '⏱️',
      label: 'Odak',
      value: `${completedSessions} Oturum`,
      pct: Math.min(100, completedSessions * 25)
    });
    if (completedSessions > 0) {
      statusInsights.push(`${completedSessions} derin odak seansı tamamlandı.`);
    }
  }

  if (activeIds.includes('tasks') && widgetsData.tasks) {
    const items = widgetsData.tasks.items || [];
    const done = items.filter(t => t.done).length;
    const total = items.length;
    const taskPct = total > 0 ? Math.round((done / total) * 100) : 100;
    metrics.push({
      icon: '✅',
      label: 'Görevler',
      value: `${done}/${total}`,
      pct: taskPct
    });
    if (total === 0) {
      statusInsights.push('Henüz görev listesi boş, yeni hedefler belirleyebilirsin.');
    } else if (done === total) {
      statusInsights.push('Tüm günlük görevlerin bitti, harikasın! 🎉');
    } else {
      statusInsights.push(`${total - done} görev tamamlanmayı bekliyor.`);
    }
  }

  if (activeIds.includes('streak') && widgetsData.streak) {
    const { currentStreak, habitName } = widgetsData.streak;
    metrics.push({
      icon: '🔥',
      label: 'Zincir',
      value: `${currentStreak} Gün`,
      pct: Math.min(100, currentStreak * 10)
    });
    statusInsights.push(`"${habitName}" zincirin ${currentStreak} gündür kırılmadı! ⛓️`);
  }

  if (activeIds.includes('bigOne') && widgetsData.bigOne) {
    const { goal, isCompleted } = widgetsData.bigOne;
    if (goal) {
      if (isCompleted) {
        statusInsights.push(`Günün ana hedefi ("${goal}") başarıyla tamamlandı! 🌟`);
      } else {
        statusInsights.push(`Günün ana odağı: "${goal}"`);
      }
    }
  }

  // Synthesize concise briefing paragraph
  let summaryText = '';
  if (statusInsights.length > 0) {
    summaryText = statusInsights.slice(0, 2).join(' ') + ' Halkanın tüm döngüleri dengeli işliyor.';
  } else {
    summaryText = `Bugün etrafına ekleyeceğin eklentilerle kişisel ritmini kurabilirsin. Halka hazır!`;
  }

  return {
    greeting: `${greeting}, ${name}`,
    dateStr: formatTurkishDate(),
    activeCount: activeIds.length,
    summaryText: summaryText,
    metrics: metrics
  };
}
