/* Health Lyfe — Service Worker */
const VERSION = 'hl-sw-v2';

// Mensagens motivacionais
const MOTIVATIONAL = [
  { title: '🌅 Bom dia!', body: 'Um novo dia, uma nova chance. Você consegue!' },
  { title: '💪 Hora de agir!', body: 'Cada pequeno passo te aproxima dos seus objetivos.' },
  { title: '🔥 Continue assim!', body: 'A consistência é o segredo do sucesso. Siga em frente!' },
  { title: '🌟 Você é capaz!', body: 'Grandes conquistas começam com pequenas ações diárias.' },
  { title: '✨ Foco no objetivo!', body: 'Não desista agora. O melhor está por vir.' },
  { title: '🎯 Disciplina é liberdade!', body: 'Cada hábito cultivado hoje molda quem você será amanhã.' },
  { title: '🌿 Health Lyfe', body: 'Sua saúde é seu maior patrimônio. Cuide dela!' },
  { title: '🙏 Gratidão', body: 'Seja grato pelo dia de hoje e por mais uma oportunidade.' },
];

const WATER_MSGS = [
  { title: '💧 Hora de hidratar!', body: 'Já bebeu água hoje? Lembre-se: meta de 2 litros!' },
  { title: '💧 Beba água!', body: 'Manter-se hidratado melhora energia, foco e saúde.' },
  { title: '💧 Hidratação!', body: 'Seu corpo precisa de água agora. Vai lá!' },
  { title: '💧 Água, por favor!', body: '8 copos por dia. Você já chegou lá hoje?' },
];

const ENCOURAGEMENT = [
  { title: '🌙 Boa noite!', body: 'Como foi seu dia? Cada hábito concluído é uma vitória.' },
  { title: '🌙 Reflita o dia', body: 'Você deu seu melhor hoje. Amanhã é mais uma oportunidade.' },
  { title: '⭐ Noite de descanso', body: 'Descanse bem. Amanhã você retoma sua jornada!' },
];

let _timers = [];

function clearAll() {
  _timers.forEach(t => clearTimeout(t));
  _timers = [];
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function scheduleNotif(delayMs, msg) {
  if (delayMs <= 0) return;
  const t = setTimeout(() => {
    self.registration.showNotification(msg.title, {
      body: msg.body,
      icon: 'https://lucasparaiso67-boop.github.io/health-lyfe/hl-icon.png',
      vibrate: [200, 100, 200],
      tag: 'hl-' + Date.now(),
    });
  }, delayMs);
  _timers.push(t);
}

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE') {
    clearAll();
    const now = Date.now();
    const nowMs = now % 86400000; // ms dentro do dia

    // Habit reminders
    if (payload.habits) {
      payload.habits.forEach(h => {
        const [hh, mm] = (h.time || '08:00').split(':').map(Number);
        const targetMs = (hh * 3600 + mm * 60) * 1000;
        let delay = targetMs - nowMs;
        if (delay < 0) delay += 86400000; // amanhã
        scheduleNotif(delay, { title: `⏰ ${h.name}`, body: `Hora de: ${h.name}. Você está no caminho certo!` });
      });
    }

    // Water reminders
    if (payload.waterInterval && payload.waterInterval > 0) {
      const intervalMs = payload.waterInterval * 60 * 1000;
      for (let i = 1; i <= 12; i++) {
        const delay = intervalMs * i;
        if (delay < 86400000) scheduleNotif(delay, rand(WATER_MSGS));
      }
    }

    // Motivational — manhã
    if (payload.motivational) {
      const morning = 7 * 3600000;
      let delayMorning = morning - nowMs;
      if (delayMorning < 0) delayMorning += 86400000;
      scheduleNotif(delayMorning, rand(MOTIVATIONAL));

      // Tarde
      const afternoon = 14 * 3600000;
      let delayAfternoon = afternoon - nowMs;
      if (delayAfternoon < 0) delayAfternoon += 86400000;
      scheduleNotif(delayAfternoon, rand(MOTIVATIONAL));

      // Noite
      const night = 21 * 3600000;
      let delayNight = night - nowMs;
      if (delayNight < 0) delayNight += 86400000;
      scheduleNotif(delayNight, rand(ENCOURAGEMENT));
    }
  }

  if (type === 'ACHIEVEMENT') {
    self.registration.showNotification(payload.title || '🏆 Conquista!', {
      body: payload.body || 'Parabéns! Continue assim!',
      icon: './icon-192.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'hl-achievement',
    });
  }

  if (type === 'MOTIVATION') {
    const msg = rand(MOTIVATIONAL);
    self.registration.showNotification(msg.title, {
      body: msg.body,
      icon: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'hl-motivation',
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
