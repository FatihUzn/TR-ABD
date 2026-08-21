// ============================================================
// core.js — Tüm sayfalarda ortak: dil değişimi, nav, saatler,
// motivasyon çekirdeği (boot/rozet/kanıt sayaçları/izleme linki),
// ve YKS/EVRAK veri tanımları.
//
// ÖNEMLİ: YKS_DATA ve EVRAK_CHECKLIST burada duruyor çünkü kanıt
// sayaçları + rozet sistemi bu veriye HER sayfada ihtiyaç duyuyor
// (yks.html/evrak.html'e özel değil). Bu dosya her sayfada,
// diğer script'lerden ÖNCE yüklenmeli.
// ============================================================

// ============================================================
// ORTAK YARDIMCILAR — gün tanımı, dil hafızası
// "Gün" gece yarısında değil 04:00'te biter: gece vardiyasından
// sonra 01:30'da yapılan bir işaretleme hâlâ o güne yazılır.
// ============================================================
  const DAY_BOUNDARY_HOUR = 4;
  const LANG_KEY = 'almanya_lang';

  function localDateKey(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function shiftToOpDay(d) {
    const x = new Date(d.getTime());
    if (x.getHours() < DAY_BOUNDARY_HOUR) x.setDate(x.getDate() - 1);
    return x;
  }
  function motivationTodayKey() {
    return localDateKey(shiftToOpDay(new Date()));
  }

  // --- Dil değiştirme (TR/DE) ---
  function setLang(lang) {
    document.querySelectorAll('.i18n').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    if (typeof renderAlmancaTeaser === 'function') renderAlmancaTeaser();
  }

  // Kayıtlı dili uygula. Sayfaya özel script'ler core.js'ten SONRA
  // çalışıp yeni .i18n elemanları ürettiği için 'load' anında bir kez
  // daha uygulanır — yoksa sonradan basılan içerik TR kalırdı.
  function applySavedLang() {
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved === 'de' || saved === 'tr') setLang(saved);
  }
  window.addEventListener('load', applySavedLang);

  // --- Çok Sayfalı Site Nav: aktif sayfayı işaretle ---
  // Her sayfanın <body> etiketinde data-page="sistem|yks|finans|evrak|blog" olmalı.
  (function highlightActiveNavLink() {
    const current = document.body.dataset.page;
    if (!current) return;
    document.querySelectorAll('.dash-topnav-links [data-page-link], .tab-nav [data-page-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.pageLink === current);
    });
    // Sekme şeridi dar ekranlarda yatay kayıyor; aktif sekme şeridin
    // görünmeyen kısmında kalmasın diye görünüre kaydırılıyor.
    const activeLink = document.querySelector('.dash-topnav-links .active');
    const strip = activeLink && activeLink.parentElement;
    if (activeLink && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft = Math.max(0,
        activeLink.offsetLeft - (strip.clientWidth - activeLink.offsetWidth) / 2);
    }
  })();

  // Canlı kur tablosu verisi — gold chart bu objeyi kullandığı için erkenden tanımlanır
  let _liveRates = { EURTRY: null, USDTRY: null, GBPTRY: null, CHFTRY: null, AUDTRY: null, goldTRY: null, goldEUR: null };

  // --- Sabit Tarihler ---
  const JOB_START = new Date('2026-10-01T00:00:00');
  const JOB_END   = new Date('2027-09-30T23:59:59');
  const YKS_COUNT_START = new Date('2026-07-29T00:00:00'); 
  const YKS_EXAM_DAY  = new Date('2027-06-19T10:15:00');

  // --- CANLI SAAT VE GERİ SAYIMLAR ---
  function updateClocks() {
    const now = new Date();
    
    // 1. Ana Operasyon Barı (Azalan)
    const opTotal = JOB_END - JOB_START;
    const opElapsed = now - JOB_START;
    let opRemainingPct = 100 - ((opElapsed / opTotal) * 100);
    opRemainingPct = Math.max(0, Math.min(100, opRemainingPct));
    // Ekranda gösterilen değer İLERLEME'dir (etiket "Genel İlerleme").
    // Renk kodu ise kalan süreye bakar — süre azaldıkça uyarıya döner.
    const opProgressPct = 100 - opRemainingPct;

    const fillEl = document.getElementById('progressFill');
    if(fillEl) {
        const CIRC = 326.7; // 2 * PI * 52 (gauge yarıçapı)
        fillEl.style.strokeDashoffset = CIRC - (CIRC * opProgressPct / 100);
        document.getElementById('progressPct').textContent = '%' + Math.round(opProgressPct);
        // fillEl artık bir SVG <circle>; SVG elementlerde className salt-okunur (SVGAnimatedString)
        // olduğu için sınıf değişimi setAttribute ile yapılır.
        fillEl.setAttribute('class', 'hero-gauge-ring ' + (opRemainingPct >= 50 ? 'lvl-safe' : opRemainingPct >= 20 ? 'lvl-watch' : 'lvl-critical'));
    }

    // Nav rozeti: her sayfada üstte görünen kompakt "%X · FAZ 1" göstergesi
    const badgeEl = document.getElementById('navProgressBadge');
    if (badgeEl) {
      const faz = now < JOB_START ? 'FAZ 1' : (now < new Date('2027-10-01T00:00:00') ? 'FAZ 2' : 'FAZ 3');
      badgeEl.textContent = '%' + Math.round(opProgressPct) + ' · ' + faz;
    }

    // 2. YKS TikTak Saat & Bar (Azalan)
    const yksDiff = YKS_EXAM_DAY - now;
    if (yksDiff > 0) {
      const d = Math.floor(yksDiff / (1000 * 60 * 60 * 24));
      const h = Math.floor((yksDiff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((yksDiff / 1000 / 60) % 60);
      const s = Math.floor((yksDiff / 1000) % 60);
      
      const tDaysEl = document.getElementById('tDays');
      const tHoursEl = document.getElementById('tHours');
      const tMinsEl = document.getElementById('tMins');
      const tSecsEl = document.getElementById('tSecs');
      if (tDaysEl) tDaysEl.textContent = d.toString().padStart(2, '0');
      if (tHoursEl) tHoursEl.textContent = h.toString().padStart(2, '0');
      if (tMinsEl) tMinsEl.textContent = m.toString().padStart(2, '0');
      if (tSecsEl) tSecsEl.textContent = s.toString().padStart(2, '0');

      const yksTotal = YKS_EXAM_DAY - YKS_COUNT_START;
      const yksElapsed = now - YKS_COUNT_START;
      let yksRemainingPct = 100 - ((yksElapsed / yksTotal) * 100);
      yksRemainingPct = Math.max(0, Math.min(100, yksRemainingPct));
      const yksProgressPct = 100 - yksRemainingPct;

      const yFill = document.getElementById('yksFill');
      if(yFill) {
          yFill.style.width = yksProgressPct + '%';
          document.getElementById('yksPct').textContent = '%' + Math.round(yksProgressPct);
          yFill.className = 'hero-progress-fill ' + (yksRemainingPct >= 50 ? 'lvl-safe' : yksRemainingPct >= 20 ? 'lvl-watch' : 'lvl-critical');
      }
    }
  }
  setInterval(updateClocks, 1000);
  updateClocks();

  // ============================================================
  // MOTİVASYON ÇEKİRDEĞİ — Aşama 1
  // Boot sekansı, günlük mesaj, faz kutlaması, rota haritası, biriken gün sayacı
  // ============================================================
  const MOTIVATION_KEY = 'almanya_motivation_v1';
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function motivationLoadState() {
    try {
      const raw = localStorage.getItem(MOTIVATION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function motivationSaveState(state) {
    try { localStorage.setItem(MOTIVATION_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // --- Gün hesapları: biriken gün / kalan gün / henüz başlamadıysa hazırlık günü ---
  function getOpDayInfo() {
    const now = new Date();
    const totalDays = Math.round((JOB_END - JOB_START) / 86400000);
    if (now < JOB_START) {
      const prepDays = Math.ceil((JOB_START - now) / 86400000);
      return { started: false, prepDays: prepDays, totalDays: totalDays, elapsedDays: 0, remainingDays: totalDays };
    }
    let elapsedDays = Math.floor((now - JOB_START) / 86400000);
    elapsedDays = Math.max(0, Math.min(totalDays, elapsedDays));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    return { started: true, prepDays: 0, totalDays: totalDays, elapsedDays: elapsedDays, remainingDays: remainingDays };
  }

  function currentPhaseLabel(now) {
    now = now || new Date();
    return now < JOB_START ? 'FAZ 1' : (now < new Date('2027-10-01T00:00:00') ? 'FAZ 2' : 'FAZ 3');
  }

  // --- 1. Terminal boot sekansı: sadece ana sayfada, oturum başına bir kez ---
  function motivationRunBoot() {
    if (document.body.dataset.page !== 'sistem') return;
    if (sessionStorage.getItem('almanya_boot_shown')) return;
    sessionStorage.setItem('almanya_boot_shown', '1');
    if (prefersReducedMotion) return;

    const overlay = document.createElement('div');
    overlay.className = 'boot-overlay';
    overlay.innerHTML =
      '<div class="boot-card">' +
        '<div class="boot-emblem">' +
          '<div class="boot-emblem-mark">ALMANYA<span class="arrow">→</span>TU BERLIN</div>' +
          '<div class="boot-emblem-sub">OPERASYON PANELİ</div>' +
        '</div>' +
        '<div class="boot-lines" id="bootLines"></div>' +
        '<div class="boot-progress-row">' +
          '<div class="boot-progress-track"><div class="boot-progress-fill" id="bootProgressFill"></div></div>' +
          '<span class="boot-progress-pct" id="bootProgressPct">0%</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add('boot-active');

    const lines = ['Sistem başlatılıyor', 'Bağlantı kuruluyor', 'Operasyon verisi yükleniyor'];
    const linesEl = overlay.querySelector('#bootLines');
    const fillEl = overlay.querySelector('#bootProgressFill');
    const pctEl = overlay.querySelector('#bootProgressPct');
    let li = 0;

    function addLine(text, cb) {
      const p = document.createElement('div');
      p.className = 'boot-line';
      p.innerHTML = '<span class="boot-line-dot"></span><span class="boot-line-text"></span>';
      linesEl.appendChild(p);
      p.querySelector('.boot-line-text').textContent = text;
      setTimeout(function () {
        p.classList.add('boot-line-done');
        cb();
      }, 260);
    }

    function nextLine() {
      if (li < lines.length) {
        addLine(lines[li], function () { li++; setTimeout(nextLine, 190); });
      } else {
        let pct = 0;
        const iv = setInterval(function () {
          pct += 4;
          const shown = Math.min(100, pct);
          fillEl.style.width = shown + '%';
          pctEl.textContent = shown + '%';
          if (pct >= 100) { clearInterval(iv); setTimeout(finishBoot, 320); }
        }, 18);
      }
    }

    function finishBoot() {
      overlay.classList.add('boot-fade-out');
      setTimeout(function () {
        overlay.remove();
        document.body.classList.remove('boot-active');
      }, 550);
    }

    nextLine();
  }

  // --- 2. Günün ilk girişinde kişisel mesaj ---
  const DAILY_GREET_POOLS = {
    morning: [
      { tr: 'Günaydın. Bugün de hedefe bir gün daha yaklaştın.', de: 'Guten Morgen. Heute bist du deinem Ziel wieder einen Tag näher.' },
      { tr: 'Sabah oldu. Küçük bir adım, büyük resmi değiştirir.', de: 'Der Morgen ist da. Ein kleiner Schritt verändert das große Bild.' },
      { tr: 'Yeni gün, aynı hedef: TU Berlin. Devam.', de: 'Neuer Tag, gleiches Ziel: TU Berlin. Weiter geht\u2019s.' }
    ],
    afternoon: [
      { tr: 'Gün ortası. Bugüne kadar geldiğin yolu unutma.', de: 'Mitten am Tag. Vergiss nicht, wie weit du schon gekommen bist.' },
      { tr: 'Yorulmak normal. Durmak değil.', de: 'Müde sein ist normal. Aufhören nicht.' }
    ],
    evening: [
      { tr: 'Akşam oldu. Bugünü kapatırken kendine teşekkür et.', de: 'Der Abend ist da. Bedanke dich bei dir selbst für heute.' },
      { tr: 'Bugün ne kadar küçük olursa olsun, bir şey biriktirdin.', de: 'Egal wie klein, heute hast du etwas aufgebaut.' }
    ],
    night: [
      { tr: 'Gece vardiyası. Bu saatte burada olman bile bir irade göstergesi.', de: 'Nachtschicht. Allein dass du um diese Zeit hier bist, zeigt Willenskraft.' },
      { tr: 'Şehir uyuyor, sen çalışıyorsun. Fark tam olarak burada birikiyor.', de: 'Die Stadt schläft, du arbeitest. Genau hier sammelt sich der Unterschied.' },
      { tr: 'Bu vardiya da geçecek. Sabah geldiğinde bir gün daha eklenmiş olacak.', de: 'Auch diese Schicht geht vorbei. Am Morgen ist wieder ein Tag dazugekommen.' },
      { tr: 'Yorgunluk gerçek ama geçici. Hedef gerçek ve kalıcı.', de: 'Die Müdigkeit ist echt, aber vorübergehend. Das Ziel ist echt und bleibt.' },
      { tr: 'Bugün az yaptıysan da olur. Sıfır yapmadığın sürece seri devam ediyor.', de: 'Auch wenig ist heute in Ordnung. Solange es nicht null ist, läuft die Serie weiter.' },
      { tr: 'Gece primi vergisiz, ama asıl birikim saatlerde değil — devam etmende.', de: 'Der Nachtzuschlag ist steuerfrei, aber der eigentliche Gewinn liegt nicht in den Stunden — sondern darin, dass du weitermachst.' }
    ]
  };
  function motivationDailyGreeting() {
    const el = document.getElementById('dailyGreet');
    if (!el) return;
    const now = new Date();
    const hour = now.getHours();
    const dayKey = motivationTodayKey();
    let poolKey = 'morning';
    if (hour >= 12 && hour < 17) poolKey = 'afternoon';
    else if (hour >= 17 && hour < 22) poolKey = 'evening';
    else if (hour >= 22 || hour < 6) poolKey = 'night';
    const pool = DAILY_GREET_POOLS[poolKey];
    let seed = 0;
    for (let i = 0; i < dayKey.length; i++) seed += dayKey.charCodeAt(i);
    const chosen = pool[seed % pool.length];
    el.classList.add('i18n');
    el.setAttribute('data-tr', chosen.tr);
    el.setAttribute('data-de', chosen.de);
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    el.textContent = lang === 'de' ? chosen.de : chosen.tr;
  }

  // --- 6. Faz geçiş kutlaması ---
  function motivationShowPhaseToast(faz) {
    const toast = document.createElement('div');
    toast.className = 'phase-toast';
    toast.innerHTML = '<span class="phase-toast-tag">PHASE COMPLETE</span><span>' + faz + ' başladı</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 450);
    }, 4500);
  }
  function motivationCheckPhaseChange() {
    const state = motivationLoadState();
    const faz = currentPhaseLabel();
    if (state.lastPhase && state.lastPhase !== faz) {
      motivationShowPhaseToast(faz);
      motivationLogEvent('🚀 ' + faz + ' başladı.');
    }
    state.lastPhase = faz;
    motivationSaveState(state);
  }

  // --- 7. Rota haritası: ilerleme oranına göre nokta konumu ---
  function motivationUpdateRouteMap() {
    const path = document.getElementById('routePathFill');
    const dot = document.getElementById('routeDot');
    if (!path || !dot || !path.getTotalLength) return;
    const info = getOpDayInfo();
    let pct = info.started ? (info.elapsedDays / info.totalDays) : 0;
    pct = Math.max(0.01, Math.min(1, pct));
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * pct);
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
  }

  // --- 8. Biriken gün sayacı ---
  function motivationUpdateAccumCounter() {
    const numEl = document.getElementById('accumDaysNum');
    const subEl = document.getElementById('accumDaysSub');
    const barEl = document.getElementById('accumDaysBar');
    if (!numEl) return;
    const info = getOpDayInfo();
    if (!info.started) {
      numEl.textContent = info.prepDays;
      if (subEl) subEl.textContent = 'gün sonra başlıyor · hazırlık aşamasındasın';
      if (barEl) barEl.style.width = '8%';
    } else {
      numEl.textContent = info.elapsedDays;
      if (subEl) subEl.textContent = info.totalDays + ' günün ' + info.elapsedDays + '\'ini geride bıraktın · ' + info.remainingDays + ' gün kaldı';
      if (barEl) barEl.style.width = Math.max(4, Math.min(100, (info.elapsedDays / info.totalDays) * 100)) + '%';
    }
  }

  function motivationInit() {
    motivationRunBoot();
    motivationDailyGreeting();
    motivationCheckPhaseChange();
    motivationUpdateRouteMap();
    motivationUpdateAccumCounter();
  }
  motivationInit();

  // ============================================================
  // MOTİVASYON ÇEKİRDEĞİ — Aşama 2 (site geneli sabit bileşenler)
  // ============================================================
  const REASON_TEXT_TR = 'Bunu neden yapıyorsun: TU Berlin Mekatronik Mühendisliği.\n\nBu bir yıllık köprü dönemi zor olacak ama geçici. Şu an attığın her adım, bir yıl sonraki sana ait bir kapıyı açıyor. Bugün yorulman normal — bırakman değil.';
  const REASON_TEXT_DE = 'Warum du das machst: Mechatronik-Ingenieurwesen an der TU Berlin.\n\nDiese einjährige Übergangsphase wird hart, aber sie ist vorübergehend. Jeder Schritt, den du jetzt gehst, öffnet dir in einem Jahr eine Tür. Heute müde zu sein ist normal — aufzugeben nicht.';

  const EMPATHY_MESSAGES = {
    evrak: { tr: 'Bu kısım sıkıcı ve bürokratik ama gerekli. Bitince vize sürecine bir adım daha yaklaşmış olacaksın.', de: 'Dieser Teil ist mühsam und bürokratisch, aber notwendig. Danach bist du dem Visumsprozess einen Schritt näher.' },
    finans: { tr: 'Sayılarla uğraşmak yorucu olabilir ama her satır, planının ne kadar sağlam olduğunun kanıtı.', de: 'Mit Zahlen zu jonglieren kann anstrengend sein, aber jede Zeile ist ein Beweis dafür, wie solide dein Plan ist.' }
  };

  // --- 16. Ses geri bildirimi (kısa, rahatsız etmeyen "tık") ---
  function motivationPlaySound() {
    const state = motivationLoadState();
    if (!state.soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // Seri, günün işaretlenmemiş olmasıyla KIRILMAZ — gün henüz bitmedi.
  // Sayım bugünden (işaretliyse) ya da dünden başlar. Pazartesi haftalık
  // tam dinlenme günü olduğu için seriyi kırmaz, sadece seriye eklenmez.
  function motivationComputeStreak(checkins) {
    let streak = 0;
    let cursor = shiftToOpDay(new Date());
    if (!checkins[localDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
    let guard = 0;
    let skipped = 0;
    while (guard++ < 800) {
      const key = localDateKey(cursor);
      if (checkins[key]) { streak++; skipped = 0; }
      else if (cursor.getDay() === 1 && skipped < 1) { skipped++; }   // Pazartesi: izin günü
      else break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // --- 3. "Neden başladım" modalı (hem sabit köşe hem "Bugün zor" butonu açıyor) ---
  function motivationBuildModal() {
    if (document.getElementById('motivModalOverlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'motiv-modal-overlay';
    overlay.id = 'motivModalOverlay';
    overlay.innerHTML =
      '<div class="motiv-modal">' +
        '<div class="motiv-modal-title">NEDEN BAŞLADIN</div>' +
        '<div class="motiv-modal-text" id="motivModalText"></div>' +
        '<button type="button" class="motiv-modal-close" id="motivModalClose">Kapat</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) motivationCloseModal(); });
    document.getElementById('motivModalClose').addEventListener('click', motivationCloseModal);
  }
  function motivationOpenModal() {
    motivationBuildModal();
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    document.getElementById('motivModalText').textContent = lang === 'de' ? REASON_TEXT_DE : REASON_TEXT_TR;
    document.getElementById('motivModalOverlay').classList.add('open');
  }
  function motivationCloseModal() {
    const overlay = document.getElementById('motivModalOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  // --- 12. Sabit köşe hatırlatma şeridi ---
  function motivationBuildRibbon() {
    if (document.getElementById('reasonRibbon')) return;
    const ribbon = document.createElement('div');
    ribbon.className = 'reason-ribbon';
    ribbon.id = 'reasonRibbon';
    ribbon.innerHTML = '<span class="reason-ribbon-icon">🎯</span><span class="reason-ribbon-text">Hedef: TU Berlin · Mekatronik</span>';
    ribbon.addEventListener('click', motivationOpenModal);
    document.body.appendChild(ribbon);
  }

  // --- 9 & 11 & 16. Kontrol paneli (check-in/streak, sakin mod, ses) ---
  function motivationRenderPanel() {
    const state = motivationLoadState();
    const checkins = state.checkins || {};
    const todayKey = motivationTodayKey();
    const doneToday = !!checkins[todayKey];
    const streak = motivationComputeStreak(checkins);

    const checkinBtn = document.getElementById('motivCheckinBtn');
    const streakEl = document.getElementById('motivStreak');
    const calmBtn = document.getElementById('motivCalmBtn');
    const soundBtn = document.getElementById('motivSoundBtn');
    const badge = document.getElementById('motivFabBadge');

    if (checkinBtn) {
      checkinBtn.classList.toggle('done', doneToday);
      checkinBtn.textContent = doneToday ? '✓ Bugün işaretlendi' : 'Bugünü işaretle';
    }
    if (streakEl) streakEl.innerHTML = 'Seri: <b>' + streak + '</b> gün';
    if (calmBtn) calmBtn.classList.toggle('active', !!state.calmMode);
    if (soundBtn) soundBtn.classList.toggle('on', !!state.soundOn);
    if (badge) {
      if (streak > 0) { badge.style.display = 'flex'; badge.textContent = streak; }
      else badge.style.display = 'none';
    }
  }

  function motivationToggleCheckin() {
    const state = motivationLoadState();
    const checkins = state.checkins || {};
    const todayKey = motivationTodayKey();
    if (checkins[todayKey]) {
      delete checkins[todayKey];
    } else {
      checkins[todayKey] = true;
      motivationPlaySound();
    }
    state.checkins = checkins;
    motivationSaveState(state);
    motivationRenderPanel();
    if (typeof motivationRenderToday === 'function') motivationRenderToday();
    if (checkins[todayKey]) {
      motivationLogEvent('✅ Bugün check-in yapıldı.');
      if (typeof motivationCheckBadges === 'function') motivationCheckBadges();
    }
    if (typeof motivationRenderAccStatus === 'function') motivationRenderAccStatus();
  }

  function motivationApplyCalmMode(on) {
    document.body.classList.toggle('calm-mode', !!on);
    let banner = document.getElementById('calmBanner');
    if (on) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'calmBanner';
        banner.className = 'calm-banner';
        banner.textContent = 'Bugün minimum yeter. Sadece nefes al, yarın devam edersin.';
        const wrap = document.querySelector('.wrap');
        if (wrap) wrap.insertBefore(banner, wrap.firstChild);
      }
    } else if (banner) {
      banner.remove();
    }
  }
  function motivationToggleCalm() {
    const state = motivationLoadState();
    state.calmMode = !state.calmMode;
    motivationSaveState(state);
    motivationApplyCalmMode(state.calmMode);
    motivationRenderPanel();
  }

  function motivationToggleSound() {
    const state = motivationLoadState();
    state.soundOn = !state.soundOn;
    motivationSaveState(state);
    if (state.soundOn) motivationPlaySound();
    motivationRenderPanel();
  }

  function motivationBuildFab() {
    if (document.getElementById('motivFab')) return;

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'motiv-fab';
    fab.id = 'motivFab';
    fab.title = 'Kontrol paneli';
    fab.innerHTML = '⚡<span class="motiv-fab-badge" id="motivFabBadge" style="display:none;"></span>';

    const panel = document.createElement('div');
    panel.className = 'motiv-panel';
    panel.id = 'motivPanel';
    panel.innerHTML =
      '<div class="motiv-panel-head">' +
        '<span class="motiv-panel-title">Kontrol Paneli</span>' +
        '<button type="button" class="motiv-sound-toggle" id="motivSoundBtn" title="Ses geri bildirimi">🔊</button>' +
      '</div>' +
      '<div class="motiv-row">' +
        '<button type="button" class="motiv-checkin-btn" id="motivCheckinBtn">Bugünü işaretle</button>' +
      '</div>' +
      '<div class="motiv-streak" id="motivStreak"></div>' +
      '<button type="button" class="motiv-btn-secondary" id="motivHardBtn">😮\u200d💨 Bugün zor</button>' +
      '<button type="button" class="motiv-btn-secondary" id="motivCalmBtn">🌙 Sakin mod</button>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab) {
        panel.classList.remove('open');
      }
    });

    document.getElementById('motivCheckinBtn').addEventListener('click', motivationToggleCheckin);
    document.getElementById('motivCalmBtn').addEventListener('click', motivationToggleCalm);
    document.getElementById('motivSoundBtn').addEventListener('click', motivationToggleSound);
    document.getElementById('motivHardBtn').addEventListener('click', motivationOpenModal);

    motivationRenderPanel();
  }

  // --- 20. Zor sayfalara özel bağlamsal empati mesajı ---
  function motivationInjectEmpathyBanner() {
    const page = document.body.dataset.page;
    const msg = EMPATHY_MESSAGES[page];
    if (!msg) return;
    // Eskiden .tab-nav'ın altına ekleniyordu; o menü kaldırıldığı için
    // banner hiç görünmez olmuştu. Artık hero başlığının altına giriyor.
    const anchor = document.querySelector('.page-header') || document.querySelector('.dash-topnav');
    if (!anchor || document.getElementById('empathyBanner')) return;
    const banner = document.createElement('div');
    banner.className = 'empathy-banner';
    banner.id = 'empathyBanner';
    const icon = document.createElement('span');
    icon.className = 'empathy-banner-icon';
    icon.textContent = '💬';
    const textSpan = document.createElement('span');
    textSpan.className = 'i18n';
    textSpan.setAttribute('data-tr', msg.tr);
    textSpan.setAttribute('data-de', msg.de);
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    textSpan.textContent = lang === 'de' ? msg.de : msg.tr;
    banner.appendChild(icon);
    banner.appendChild(textSpan);
    anchor.insertAdjacentElement('afterend', banner);
  }

  function motivationInitStage2() {
    // motivationBuildRibbon() ARTIK ÇAĞRILMIYOR: sol alttaki sabit
    // "Hedef: TU Berlin" şeridi içeriğin üstünü kapatıyordu ve aynı
    // cümle footer'da zaten duruyor. Modalı ⚡ panelindeki
    // "Bugün zor" butonu açıyor.
    motivationBuildFab();
    motivationInjectEmpathyBanner();
    const state = motivationLoadState();
    motivationApplyCalmMode(!!state.calmMode);
  }
  motivationInitStage2();

  // ============================================================
  // MOTİVASYON ÇEKİRDEĞİ — Aşama 3 (sistem günlüğü, kanıt sayaçları, rozetler)
  // NOT: motivationInitStage3() dosyanın SONUNDA çağrılır, çünkü YKS_DATA
  // ve EVRAK_CHECKLIST bu noktadan sonra tanımlanıyor.
  // ============================================================
  const BADGE_DEFS = [
    { id: 'ilk-checkin', icon: '🥇', title: 'İlk Adım', desc: 'İlk check-in yapıldı.' },
    { id: 'streak-7', icon: '🔥', title: 'Bir Hafta', desc: '7 gün üst üste check-in yaptın.' },
    { id: 'streak-30', icon: '🔥', title: 'Bir Ay', desc: '30 gün üst üste check-in yaptın.' },
    { id: 'yks-ilk', icon: '📚', title: 'YKS Başlangıcı', desc: 'İlk YKS konusunu tamamladın.' },
    { id: 'yks-yarim', icon: '📖', title: 'Yarı Yol · YKS', desc: 'YKS konularının yarısını bitirdin.' },
    { id: 'evrak-tr', icon: '📋', title: 'Türkiye Evrakı Tamam', desc: 'Türkiye tarafındaki tüm evraklar tamam.' },
    { id: 'evrak-de', icon: '📋', title: 'Almanya Evrakı Tamam', desc: 'Almanya tarafındaki tüm evraklar tamam.' },
    { id: 'gun-30', icon: '📅', title: '30 Gün', desc: 'Operasyonun 30. gününe ulaştın.' },
    { id: 'gun-100', icon: '📅', title: '100 Gün', desc: 'Operasyonun 100. gününe ulaştın.' },
    { id: 'faz2', icon: '🚀', title: 'FAZ 2', desc: 'Vize dönüşüm fazına geçtin.' },
    { id: 'faz3', icon: '🎓', title: 'FAZ 3 · TU Berlin', desc: 'Son faza ulaştın.' }
  ];

  // --- 5. Sistem günlüğü ---
  function motivationLogEvent(text) {
    const state = motivationLoadState();
    const log = state.log || [];
    log.unshift({ ts: Date.now(), text: text });
    state.log = log.slice(0, 40);
    motivationSaveState(state);
    motivationRenderLog();
  }

  function motivationRenderLog() {
    const el = document.getElementById('sysLog');
    if (!el) return;
    const state = motivationLoadState();
    const log = state.log || [];
    if (!log.length) {
      el.innerHTML = '<div class="log-empty">Henüz kayıt yok — ilk adımını at.</div>';
      return;
    }
    el.innerHTML = log.map(function (item) {
      const d = new Date(item.ts);
      const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      return '<div class="log-line"><span class="log-ts">[' + dateStr + ']</span><span class="log-text"> ' + item.text + '</span></div>';
    }).join('');
  }

  // Bir konunun leaf checkbox id'lerini döndürür (altKonular varsa hepsi, yoksa kendisi).
  // ÖNEMLİ: Bu fonksiyon eskiden yks.js'teydi; core.js her sayfada ondan ÖNCE
  // çalıştığı için kanıt sayacı sessizce hata verip hep 0/0 gösteriyordu.
  function yksLeafIds(konu) {
    if (konu.altKonular && konu.altKonular.length) {
      return konu.altKonular.map(function (_, i) { return konu.id + '__' + i; });
    }
    return [konu.id];
  }

  // --- 14. Somut kanıt sayaçları (yks/evrak state'lerini doğrudan okur) ---
  function motivationYksTotals() {
    try {
      const raw = localStorage.getItem('yksChecklistState');
      const yksState = raw ? JSON.parse(raw) : {};
      let done = 0, total = 0;
      ['TYT', 'AYT'].forEach(function (grp) {
        (YKS_DATA[grp] || []).forEach(function (ders) {
          ders.konular.forEach(function (konu) {
            yksLeafIds(konu).forEach(function (id) {
              total++;
              if (yksState[id]) done++;
            });
          });
        });
      });
      return { done: done, total: total };
    } catch (e) { return { done: 0, total: 0 }; }
  }

  function motivationEvrakTotals() {
    try {
      const raw = localStorage.getItem('evrakChecklistState');
      const evrakState = raw ? JSON.parse(raw) : {};
      let trDone = 0, deDone = 0;
      const trTotal = EVRAK_CHECKLIST.turkiye.kalemler.length;
      const deTotal = EVRAK_CHECKLIST.almanya.kalemler.length;
      EVRAK_CHECKLIST.turkiye.kalemler.forEach(function (k) { if (evrakState[k.id]) trDone++; });
      EVRAK_CHECKLIST.almanya.kalemler.forEach(function (k) { if (evrakState[k.id]) deDone++; });
      return { trDone: trDone, trTotal: trTotal, deDone: deDone, deTotal: deTotal };
    } catch (e) { return { trDone: 0, trTotal: 0, deDone: 0, deTotal: 0 }; }
  }

  function motivationBuildProofContext() {
    const state = motivationLoadState();
    const checkins = state.checkins || {};
    const totalCheckins = Object.keys(checkins).length;
    const streak = motivationComputeStreak(checkins);
    const yks = motivationYksTotals();
    const evrak = motivationEvrakTotals();
    const dayInfo = getOpDayInfo();
    const phase = currentPhaseLabel();
    return {
      totalCheckins: totalCheckins, streak: streak,
      yksDone: yks.done, yksTotal: yks.total,
      evrakTrDone: evrak.trDone, evrakTrTotal: evrak.trTotal,
      evrakDeDone: evrak.deDone, evrakDeTotal: evrak.deTotal,
      elapsedDays: dayInfo.elapsedDays, phase: phase
    };
  }

  // Barın genişliği artık HTML'e elle yazılmış sabit değil, gerçek orandan
  // hesaplanıyor. Veri yoksa bar boş kalır — dolu göstermek yanıltıcıydı.
  function proofSetRow(valueEl, text, pct) {
    if (!valueEl) return;
    valueEl.textContent = text;
    const row = valueEl.closest('.metric-hbar-row');
    const fill = row && row.querySelector('.metric-hbar-fill');
    if (fill) fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function motivationRenderProofCounters(ctx) {
    const evrakDone = ctx.evrakTrDone + ctx.evrakDeDone;
    const evrakTotal = ctx.evrakTrTotal + ctx.evrakDeTotal;
    proofSetRow(document.getElementById('proofYks'),
      ctx.yksDone + '/' + ctx.yksTotal,
      ctx.yksTotal ? (ctx.yksDone / ctx.yksTotal) * 100 : 0);
    proofSetRow(document.getElementById('proofEvrak'),
      evrakDone + '/' + evrakTotal,
      evrakTotal ? (evrakDone / evrakTotal) * 100 : 0);
    // Check-in barı: 30 günlük işaretleme barı doldurur.
    proofSetRow(document.getElementById('proofCheckins'),
      String(ctx.totalCheckins), (ctx.totalCheckins / 30) * 100);
    // Seri barı: 30 günlük seri barı doldurur (30 gün rozetiyle aynı eşik).
    proofSetRow(document.getElementById('proofStreak'),
      String(ctx.streak), (ctx.streak / 30) * 100);
  }

  // --- 15. Rozet sistemi ---
  function motivationBadgeCheck(id, ctx) {
    switch (id) {
      case 'ilk-checkin': return ctx.totalCheckins >= 1;
      case 'streak-7': return ctx.streak >= 7;
      case 'streak-30': return ctx.streak >= 30;
      case 'yks-ilk': return ctx.yksDone >= 1;
      case 'yks-yarim': return ctx.yksTotal > 0 && (ctx.yksDone / ctx.yksTotal) >= 0.5;
      case 'evrak-tr': return ctx.evrakTrTotal > 0 && ctx.evrakTrDone === ctx.evrakTrTotal;
      case 'evrak-de': return ctx.evrakDeTotal > 0 && ctx.evrakDeDone === ctx.evrakDeTotal;
      case 'gun-30': return ctx.elapsedDays >= 30;
      case 'gun-100': return ctx.elapsedDays >= 100;
      case 'faz2': return ctx.phase === 'FAZ 2' || ctx.phase === 'FAZ 3';
      case 'faz3': return ctx.phase === 'FAZ 3';
      default: return false;
    }
  }

  function motivationShowBadgeToast(def) {
    const toast = document.createElement('div');
    toast.className = 'phase-toast';
    toast.innerHTML = '<span class="phase-toast-tag">ROZET</span><span>' + def.icon + ' ' + def.title + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 450);
    }, 4500);
  }

  function motivationRenderBadges() {
    const grid = document.getElementById('badgeGrid');
    if (!grid) return;
    const state = motivationLoadState();
    const badges = state.badges || {};
    grid.innerHTML = BADGE_DEFS.map(function (def) {
      const earned = !!badges[def.id];
      return '<div class="badge-item' + (earned ? ' earned' : '') + '" title="' + def.desc + '">' +
        '<span class="badge-icon">' + (earned ? def.icon : '🔒') + '</span>' +
        '<span class="badge-title">' + def.title + '</span>' +
        '</div>';
    }).join('');
  }

  function motivationCheckBadges() {
    const state = motivationLoadState();
    const badges = state.badges || {};
    const ctx = motivationBuildProofContext();
    let changed = false;
    BADGE_DEFS.forEach(function (def) {
      if (badges[def.id]) return;
      if (motivationBadgeCheck(def.id, ctx)) {
        badges[def.id] = Date.now();
        changed = true;
        motivationShowBadgeToast(def);
        motivationLogEvent('🏅 Rozet kazanıldı: ' + def.title);
      }
    });
    if (changed) {
      state.badges = badges;
      motivationSaveState(state);
    }
    motivationRenderBadges();
    motivationRenderProofCounters(ctx);
    return ctx;
  }

  function motivationInitStage3() {
    motivationCheckBadges();
    motivationRenderLog();
  }

  // ============================================================
  // YKS_DATA — konu verisi (yks.js render eder, ama kanıt sayaçları
  // /rozetler için burada, çekirdekte tanımlı)
  // ============================================================
  // ============================================================
  // --- YKS KONU TAKİBİ (checklist motoru) ---
  // Veri (TYT/AYT konu listeleri) aşağıdaki YKS_DATA objesine
  // eklenecek — bu adımda sadece motor kuruluyor, içerik boş.
  // Her ders: { id, ad, konular: [ { id, ad, altKonular?: [ad,ad,...] } ] }
  // Alt konusu olan bir konunun kendisi checkbox almaz; sadece
  // alt konuları checkbox olur. Alt konusu olmayan konu tek
  // checkbox'tır.
  // ============================================================
  const YKS_DATA = {
    TYT: [
      { id:'tyt-turkce', ad:'Türkçe (40)', konular:[
        { id:'tyt-turkce-1', ad:'Sözcükte ve Cümlede Anlam' },
        { id:'tyt-turkce-2', ad:'Paragraf (~%70 ağırlık — en yüksek getiri)' },
        { id:'tyt-turkce-3', ad:'Dil Bilgisi', altKonular:['İsimler','Zamirler','Sıfatlar','Zarflar','Edat','Bağlaç','Ünlem'] },
        { id:'tyt-turkce-4', ad:'Yazım Kuralları ve Noktalama İşaretleri' },
        { id:'tyt-turkce-5', ad:'Anlatım Bozuklukları' }
      ]},
      { id:'tyt-mat', ad:'Matematik ve Geometri (40)', konular:[
        { id:'tyt-mat-1', ad:'Temel Kavramlar, Sayı Basamakları, Rasyonel Sayılar' },
        { id:'tyt-mat-2', ad:'Oran-Orantı ve Denklem Çözme' },
        { id:'tyt-mat-3', ad:'Problemler (TYT matematiğin en önemli bölümü)' },
        { id:'tyt-mat-4', ad:'Kümeler, Fonksiyonlar, Grafik ve Tablo Yorumlama' },
        { id:'tyt-mat-5', ad:'Geometri', altKonular:['Doğruda ve Üçgende Açılar','Özel Üçgenler','Eşlik ve Benzerlik','Çokgenler','Dörtgenler','Çember ve Daire','Katı Cisimler','Analitik Geometri'] }
      ]},
      { id:'tyt-fizik', ad:'Fizik (7)', konular:[
        { id:'tyt-fizik-1', ad:'Hareket ve Kuvvet' },
        { id:'tyt-fizik-2', ad:'Enerji' },
        { id:'tyt-fizik-3', ad:'Isı ve Sıcaklık' },
        { id:'tyt-fizik-4', ad:'Basınç' },
        { id:'tyt-fizik-5', ad:'Elektrik' },
        { id:'tyt-fizik-6', ad:'Optik' }
      ]},
      { id:'tyt-kimya', ad:'Kimya (7)', konular:[
        { id:'tyt-kimya-1', ad:'Kimya Bilimi' },
        { id:'tyt-kimya-2', ad:'Atom ve Periyodik Sistem' },
        { id:'tyt-kimya-3', ad:'Kimyasal Türler Arası Etkileşimler' },
        { id:'tyt-kimya-4', ad:'Karışımlar' }
      ]},
      { id:'tyt-biyoloji', ad:'Biyoloji (6)', konular:[
        { id:'tyt-biyoloji-1', ad:'Hücre' },
        { id:'tyt-biyoloji-2', ad:'Canlıların Temel Bileşenleri' },
        { id:'tyt-biyoloji-3', ad:'Ekoloji' },
        { id:'tyt-biyoloji-4', ad:'Kalıtım' }
      ]},
      { id:'tyt-tarih', ad:'Tarih (5)', konular:[
        { id:'tyt-tarih-1', ad:'Genel Tarih Akışı' },
        { id:'tyt-tarih-2', ad:'Türk-İslam Devletleri' },
        { id:'tyt-tarih-3', ad:'Osmanlı Tarihi' },
        { id:'tyt-tarih-4', ad:'İnkılap Tarihi Temelleri' }
      ]},
      { id:'tyt-cografya', ad:'Coğrafya (5)', konular:[
        { id:'tyt-cografya-1', ad:'Doğa ve İnsan' },
        { id:'tyt-cografya-2', ad:'Harita Bilgisi' },
        { id:'tyt-cografya-3', ad:'Yerin Şekli ve Hareketleri' },
        { id:'tyt-cografya-4', ad:'İklim Bilgisi' },
        { id:'tyt-cografya-5', ad:'Nüfus ve Yerleşme' },
        { id:'tyt-cografya-6', ad:'Türkiye Coğrafyası' }
      ]},
      { id:'tyt-felsefe', ad:'Felsefe (5)', konular:[
        { id:'tyt-felsefe-1', ad:'Bilgi Felsefesi' },
        { id:'tyt-felsefe-2', ad:'Varlık Felsefesi' },
        { id:'tyt-felsefe-3', ad:'Ahlak Felsefesi' },
        { id:'tyt-felsefe-4', ad:'Siyaset Felsefesi' }
      ]},
      { id:'tyt-din', ad:'Din Kültürü (5)', konular:[
        { id:'tyt-din-1', ad:"Kur'an'da Kavramlar" },
        { id:'tyt-din-2', ad:'Hz. Muhammed\'in Hayatı' },
        { id:'tyt-din-3', ad:'İslam ve İbadet' }
      ]}
    ],
    AYT: [
      { id:'ayt-mat', ad:'Matematik (40)', konular:[
        { id:'ayt-mat-1', ad:'Polinomlar' },
        { id:'ayt-mat-2', ad:'İkinci Dereceden Denklemler' },
        { id:'ayt-mat-3', ad:'Trigonometri', altKonular:['Radyan-Derece','Birim Çember','Trigonometrik Fonksiyonlar ve Grafikleri'] },
        { id:'ayt-mat-4', ad:'Logaritma' },
        { id:'ayt-mat-5', ad:'Diziler' },
        { id:'ayt-mat-6', ad:'Limit' },
        { id:'ayt-mat-7', ad:'Türev' },
        { id:'ayt-mat-8', ad:'İntegral' }
      ]},
      { id:'ayt-fizik', ad:'Fizik (14)', konular:[
        { id:'ayt-fizik-1', ad:'Vektörler' },
        { id:'ayt-fizik-2', ad:'Newton\'un Hareket Yasaları' },
        { id:'ayt-fizik-3', ad:'Kuvvet, Tork ve Denge' },
        { id:'ayt-fizik-4', ad:'İş, Güç ve Enerji' },
        { id:'ayt-fizik-5', ad:'İtme ve Momentum' },
        { id:'ayt-fizik-6', ad:'Elektrik ve Manyetizma', altKonular:['Elektrik Alan ve Potansiyel','Paralel Levha Kondansatör','Manyetik Alan ve Kuvvet','Elektromanyetik İndükleme'] },
        { id:'ayt-fizik-7', ad:'Çembersel Hareket' },
        { id:'ayt-fizik-8', ad:'Basit Harmonik Hareket' },
        { id:'ayt-fizik-9', ad:'Dalga Mekaniği' },
        { id:'ayt-fizik-10', ad:'Atom Fiziğine Giriş ve Radyoaktivite' },
        { id:'ayt-fizik-11', ad:'Modern Fizik' },
        { id:'ayt-fizik-12', ad:'Fizik ve Teknoloji' }
      ]},
      { id:'ayt-kimya', ad:'Kimya (13)', konular:[
        { id:'ayt-kimya-1', ad:'Modern Atom Teorisi' },
        { id:'ayt-kimya-2', ad:'Gazlar' },
        { id:'ayt-kimya-3', ad:'Sıvı Çözeltiler ve Çözünürlük' },
        { id:'ayt-kimya-4', ad:'Kimyasal Tepkimelerde Enerji' },
        { id:'ayt-kimya-5', ad:'Kimyasal Tepkimelerde Hız' },
        { id:'ayt-kimya-6', ad:'Kimyasal Tepkimelerde Denge' },
        { id:'ayt-kimya-7', ad:'Asit-Baz Dengesi' },
        { id:'ayt-kimya-8', ad:'Çözünürlük Dengesi' },
        { id:'ayt-kimya-9', ad:'Kimya ve Elektrik (Elektrokimya)' },
        { id:'ayt-kimya-10', ad:'Organik Kimyaya Giriş (AYT kimyanın en belirleyici kısmı)', altKonular:['Karbon Kimyasına Giriş','Organik Bileşik Sınıfları','Hidrokarbonlar','Alkoller ve Eterler','Karbonil Bileşikleri'] },
        { id:'ayt-kimya-11', ad:'Enerji Kaynakları ve Bilimsel Gelişmeler' }
      ]},
      { id:'ayt-biyoloji', ad:'Biyoloji (13)', konular:[
        { id:'ayt-biyoloji-1', ad:'İnsan Fizyolojisi', altKonular:['Sinir Sistemi','Endokrin Sistem ve Hormonlar','Duyu Organları','Destek ve Hareket Sistemi','Sindirim Sistemi','Dolaşım ve Bağışıklık Sistemi','Solunum Sistemi','Boşaltım (Üriner) Sistemi','Üreme Sistemi ve Embriyonik Gelişim'] },
        { id:'ayt-biyoloji-2', ad:'Komünite ve Popülasyon Ekolojisi' },
        { id:'ayt-biyoloji-3', ad:'Genden Proteine' },
        { id:'ayt-biyoloji-4', ad:'Canlılık ve Enerji (Fotosentez - Kemosentez - Solunum)' },
        { id:'ayt-biyoloji-5', ad:'Bitki Biyolojisi' },
        { id:'ayt-biyoloji-6', ad:'Canlılarda Üreme, Büyüme ve Gelişme' },
        { id:'ayt-biyoloji-7', ad:'Genetik Mühendisliği ve Biyoteknoloji' }
      ]}
    ]
  };

  // ============================================================
  // EVRAK_CHECKLIST — evrak verisi (evrak.js render eder, ama kanıt
  // sayaçları/rozetler için burada, çekirdekte tanımlı)
  // ============================================================
  const EVRAK_CHECKLIST = {
    turkiye: {
      id: 'turkiye',
      kalemler: [
        { id:'tr-pasaport', ad:'Pasaport (en az 1 yıl geçerlilik)' },
        { id:'tr-pasaport-foto', ad:'Biyometrik fotoğraf (3.5×4.5, beyaz fon)' },
        { id:'tr-nufus-cuzdani', ad:'Nüfus cüzdanı fotokopisi' },
        { id:'tr-nufus-kayit', ad:'Vukuatlı nüfus kayıt örneği (e-Devlet)' },
        { id:'tr-adli-sicil', ad:'Adli sicil kaydı (sabıka kaydı, e-Devlet)' },
        { id:'tr-ikametgah', ad:'Yerleşim yeri (ikametgâh) belgesi' },
        { id:'tr-askerlik', ad:'Askerlik durum belgesi' },
        { id:'tr-diploma', ad:'Lise diploması + noter onaylı Almanca/İngilizce tercüme' },
        { id:'tr-is-sozlesmesi', ad:'İş sözleşmesi (Alman işvereninden, imzalı)' },
        { id:'tr-vize-form', ad:'Vize başvuru formu (VIDEX çıktısı + imza)' },
        { id:'tr-vize-randevu', ad:'Alman Başkonsolosluğu vize randevusu' },
        { id:'tr-seyahat-sigorta', ad:'Seyahat sağlık sigortası (giriş için, Schengen uyumlu)' },
        { id:'tr-konaklama', ad:"Almanya'da konaklama kanıtı (Limburgerhof)" },
        { id:'tr-banka-dekont', ad:'Banka hesap özeti / mali yeterlilik kanıtı' },
        { id:'tr-vize-harc', ad:'Vize harcı ödeme dekontu' }
      ]
    },
    almanya: {
      id: 'almanya',
      kalemler: [
        { id:'de-anmeldung', ad:'Anmeldung — ikamet kaydı (Bürgeramt, varıştan sonraki 14 gün içinde)' },
        { id:'de-bank', ad:'Alman banka hesabı açılışı' },
        { id:'de-kranken', ad:'Yasal sağlık sigortası (gesetzliche Krankenversicherung) kaydı' },
        { id:'de-steuer-id', ad:'Steuer-ID (vergi kimlik no) — posta ile otomatik gelir' },
        { id:'de-sozial', ad:'Sosyal güvenlik numarası (işveren üzerinden)' },
        { id:'de-vhs-kayit', ad:'VHS dil kursu kayıt belgesi' },
        { id:'de-rundfunk', ad:'Rundfunkbeitrag (yayın ücreti) kaydı' },
        { id:'de-aufenthalt', ad:'İkamet izni (Aufenthaltstitel) başvurusu — Ausländerbehörde' },
        { id:'de-16b', ad:"§16b'ye geçiş başvurusu (dil sertifikası + üniversite kabul belgesi ile)" },
        { id:'de-tub-kabul', ad:'TU Berlin kabul belgesi (Zulassungsbescheid)' }
      ]
    }
  };

  // YKS_DATA ve EVRAK_CHECKLIST artık tanımlı olduğu için Aşama 3 burada başlatılır
  motivationInitStage3();

  // --- Günlük anlık görüntü: her gün bir kez ilerleme durumunu kaydeder ---
  // (blog.js'teki karşılaştırma/zaman tüneli özellikleri bu geçmişi kullanır,
  // bu yüzden her sayfada çalışması gerekir, sadece blog.html'de değil)
  function motivationTakeDailySnapshot() {
    const state = motivationLoadState();
    const snapshots = state.snapshots || {};
    const key = motivationTodayKey();
    if (snapshots[key]) return;
    const ctx = motivationBuildProofContext();
    const yksPct = ctx.yksTotal > 0 ? Math.round((ctx.yksDone / ctx.yksTotal) * 100) : 0;
    const evrakTotal = ctx.evrakTrTotal + ctx.evrakDeTotal;
    const evrakDone = ctx.evrakTrDone + ctx.evrakDeDone;
    const evrakPct = evrakTotal > 0 ? Math.round((evrakDone / evrakTotal) * 100) : 0;
    snapshots[key] = {
      checkins: ctx.totalCheckins, streak: ctx.streak,
      yksPct: yksPct, evrakPct: evrakPct
    };
    state.snapshots = snapshots;
    motivationSaveState(state);
  }
  motivationTakeDailySnapshot();

  // ============================================================
  // MOTİVASYON ÇEKİRDEĞİ — Aşama 5 (sosyal: salt-okunur izleme linki)
  // Link, panelin o anki genel ilerleme özetini URL'ye küçük bir
  // base64 paket olarak gömer — sunucu/veritabanı gerekmez. Link açılan
  // kişiye normal panel yerine tıklanamaz, salt-okunur bir özet kartı
  // gösterilir; finansal/evrak detayları asla pakete dahil edilmez.
  // ============================================================

  function trackB64UrlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function trackB64UrlDecode(str) {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
  }

  function motivationBuildTrackingSnapshot() {
    const ctx = motivationBuildProofContext();
    const state = motivationLoadState();
    const badges = Object.keys(state.badges || {});
    return {
      v: 1,
      gen: Date.now(),
      phase: ctx.phase,
      elapsedDays: ctx.elapsedDays,
      totalDays: Math.round((JOB_END - JOB_START) / 86400000),
      streak: ctx.streak,
      totalCheckins: ctx.totalCheckins,
      yksDone: ctx.yksDone, yksTotal: ctx.yksTotal,
      evrakDone: ctx.evrakTrDone + ctx.evrakDeDone,
      evrakTotal: ctx.evrakTrTotal + ctx.evrakDeTotal,
      badges: badges
    };
  }

  function motivationInitTrackLinkGenerator() {
    const btn = document.getElementById('trackLinkGenBtn');
    if (!btn) return;
    const resultEl = document.getElementById('trackLinkResult');
    const inputEl = document.getElementById('trackLinkInput');
    const copyBtn = document.getElementById('trackLinkCopyBtn');

    btn.addEventListener('click', function () {
      if (location.protocol === 'file:') {
        // file:// altında location.origin "null" döner; üretilen link kimsede açılmaz.
        if (inputEl) inputEl.value = 'Bu özellik için site yayında olmalı (ör. GitHub Pages).';
        if (resultEl) resultEl.style.display = 'flex';
        return;
      }
      const snap = motivationBuildTrackingSnapshot();
      const encoded = trackB64UrlEncode(JSON.stringify(snap));
      const base = location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '') + 'index.html';
      const url = base + '?track=' + encoded;
      if (inputEl) inputEl.value = url;
      if (resultEl) resultEl.style.display = 'flex';
      if (inputEl) { inputEl.focus(); inputEl.select(); }
      motivationLogEvent('🔗 Salt-okunur izleme linki oluşturuldu.');
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!inputEl || !inputEl.value) return;
        inputEl.select();
        const finish = function (ok) {
          copyBtn.textContent = ok ? 'Kopyalandı ✓' : 'Kopyalanamadı';
          setTimeout(function () { copyBtn.textContent = 'Kopyala'; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(inputEl.value).then(function () { finish(true); }).catch(function () { finish(false); });
        } else {
          try { document.execCommand('copy'); finish(true); } catch (e) { finish(false); }
        }
      });
    }
  }

  function motivationBadgeIconFor(id) {
    const def = BADGE_DEFS.find(function (d) { return d.id === id; });
    return def ? def.icon : '🏅';
  }

  function motivationRenderTrackingOverlay(snap) {
    const overlay = document.createElement('div');
    overlay.className = 'track-overlay';
    const genLabel = new Date(snap.gen).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const yksPct = snap.yksTotal > 0 ? Math.round((snap.yksDone / snap.yksTotal) * 100) : 0;
    const evrakPct = snap.evrakTotal > 0 ? Math.round((snap.evrakDone / snap.evrakTotal) * 100) : 0;
    const dayPct = snap.totalDays > 0 ? Math.min(100, Math.max(0, Math.round((snap.elapsedDays / snap.totalDays) * 100))) : 0;
    const badgesHTML = snap.badges.length
      ? snap.badges.map(function (id) { return '<span class="track-badge" title="' + id + '">' + motivationBadgeIconFor(id) + '</span>'; }).join('')
      : '<span class="track-empty">Henüz rozet yok</span>';
    overlay.innerHTML =
      '<div class="track-card">' +
        '<div class="track-tag">👁️ İZLEME GÖRÜNÜMÜ · SALT-OKUNUR</div>' +
        '<div class="track-gen">Anlık görüntü: ' + genLabel + '</div>' +
        '<div class="track-phase">' + snap.phase + '</div>' +
        '<div class="track-days">' + snap.elapsedDays + ' / ' + snap.totalDays + ' gün</div>' +
        '<div class="track-bar-track"><div class="track-bar-fill" style="width:' + dayPct + '%"></div></div>' +
        '<div class="track-grid">' +
          '<div class="track-stat"><div class="track-stat-num">' + snap.totalCheckins + '</div><div class="track-stat-label">Check-in</div></div>' +
          '<div class="track-stat"><div class="track-stat-num">' + snap.streak + '</div><div class="track-stat-label">Seri (gün)</div></div>' +
          '<div class="track-stat"><div class="track-stat-num">' + yksPct + '%</div><div class="track-stat-label">YKS</div></div>' +
          '<div class="track-stat"><div class="track-stat-num">' + evrakPct + '%</div><div class="track-stat-label">Evrak</div></div>' +
        '</div>' +
        '<div class="track-badges">' + badgesHTML + '</div>' +
        '<a class="track-exit-link" href="' + location.pathname + '">Salt-okunur görünümü kapat</a>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add('track-active');
  }

  // ============================================================
  // ALMANCA TEASER — index.html'deki kompakt "Dil Yolculuğu" kartı
  // almanca.js'in yazdığı 'almanca_summary_v1' önbelleğini okur.
  // İlgili elementler sayfada yoksa sessizce çıkar.
  // ============================================================
  function renderAlmancaTeaser() {
    const bar = document.getElementById('homeAlmBar');
    if (!bar) return;
    let summary = null;
    try {
      const raw = localStorage.getItem('almanca_summary_v1');
      summary = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    const pctEl = document.getElementById('homeAlmPct');
    const levelEl = document.getElementById('homeAlmLevel');
    const streakEl = document.getElementById('homeAlmStreak');
    const doneEl = document.getElementById('homeAlmLevelsDone');
    if (!summary) {
      if (pctEl) pctEl.textContent = '%0';
      if (levelEl) levelEl.textContent = 'A1';
      if (streakEl) streakEl.textContent = '0';
      if (doneEl) doneEl.textContent = (lang === 'de' ? 'Noch nicht gestartet' : 'Henüz başlanmadı');
      bar.style.width = '0%';
      return;
    }
    if (pctEl) pctEl.textContent = '%' + summary.pct;
    if (levelEl) levelEl.textContent = summary.level;
    if (streakEl) streakEl.textContent = summary.streak;
    if (doneEl) doneEl.textContent = summary.levelsDone + '/' + summary.levelsTotal + (lang === 'de' ? ' Stufen abgeschlossen' : ' seviye tamamlandı');
    bar.style.width = summary.pct + '%';
  }
  renderAlmancaTeaser();


  // ============================================================
  // YEDEKLEME — bütün panel verisi tek JSON dosyasında
  // Veri yalnızca bu tarayıcının hafızasında duruyor; tarayıcı verisini
  // temizlemek bir yıllık kaydı siler. Bu yüzden dışa/içe aktarma şart.
  // ============================================================
  const BACKUP_KEYS = [
    'almanya_motivation_v1',
    'yksChecklistState',
    'yksWeeklyQuestionProgress',
    'evrakChecklistState',
    'evrakFormState',
    'almancaState_v1',
    'almanca_summary_v1',
    'almanya_lang'
  ];

  function motivationExportBackup() {
    const data = { _v: 1, _gen: new Date().toISOString(), keys: {} };
    BACKUP_KEYS.forEach(function (k) {
      try {
        const v = localStorage.getItem(k);
        if (v !== null) data.keys[k] = v;
      } catch (e) {}
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'almanya-paneli-yedek-' + motivationTodayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    motivationLogEvent('💾 Yedek alındı.');
  }

  function motivationImportBackup(file, statusEl) {
    const reader = new FileReader();
    reader.onload = function () {
      let data;
      try { data = JSON.parse(reader.result); } catch (e) { data = null; }
      if (!data || !data.keys) {
        if (statusEl) statusEl.textContent = 'Dosya okunamadı — bu bir panel yedeği değil.';
        return;
      }
      let n = 0;
      Object.keys(data.keys).forEach(function (k) {
        if (BACKUP_KEYS.indexOf(k) === -1) return;
        try { localStorage.setItem(k, data.keys[k]); n++; } catch (e) {}
      });
      if (statusEl) statusEl.textContent = n + ' kayıt geri yüklendi. Sayfa yenileniyor...';
      setTimeout(function () { location.reload(); }, 900);
    };
    reader.readAsText(file);
  }

  function motivationInitBackup() {
    const expBtn = document.getElementById('backupExportBtn');
    if (!expBtn) return;
    const impBtn = document.getElementById('backupImportBtn');
    const fileInput = document.getElementById('backupFileInput');
    const statusEl = document.getElementById('backupStatus');
    expBtn.addEventListener('click', motivationExportBackup);
    if (impBtn && fileInput) {
      impBtn.addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) motivationImportBackup(fileInput.files[0], statusEl);
      });
    }
  }
  motivationInitBackup();


  // ============================================================
  // FOOTER — canlı gün sayacı + aktif faz
  // Footer'daki eski 6 kartlık sayfa listesi kaldırıldı (üstteki
  // yapışkan menüyle birebir aynıydı). Yerine panelin asıl işi geldi.
  // ============================================================
  function motivationRenderFooter() {
    const numEl = document.getElementById('footerLiveNum');
    const labelEl = document.getElementById('footerLiveLabel');
    if (numEl) {
      const info = getOpDayInfo();
      if (!info.started) {
        numEl.textContent = info.prepDays;
        if (labelEl) labelEl.textContent = 'gün sonra başlıyor · hazırlık aşaması';
      } else if (info.remainingDays > 0) {
        numEl.textContent = info.elapsedDays;
        if (labelEl) labelEl.textContent = info.totalDays + ' günün ' + info.elapsedDays + '\'i geride · ' + info.remainingDays + ' gün kaldı';
      } else {
        numEl.textContent = info.totalDays;
        if (labelEl) labelEl.textContent = 'köprü dönemi tamamlandı';
      }
    }

    const list = document.getElementById('footerPhases');
    if (list) {
      const faz = currentPhaseLabel();
      let passed = true;
      list.querySelectorAll('li').forEach(function (li) {
        const isCurrent = li.dataset.phase === faz;
        li.classList.toggle('is-current', isCurrent);
        li.classList.toggle('is-done', passed && !isCurrent);
        if (isCurrent) passed = false;
      });
    }
  }
  motivationRenderFooter();


  // ============================================================
  // BUGÜN KARTI — anasayfada tek eylem bloğu
  // Panel çok iyi ÖLÇÜYORDU ama "bugün ne yapacağım"ı söylemiyordu.
  // Bu kart üç izin de sıradaki somut adımını gösterir.
  // ============================================================
  function todayReadJSON(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  // Sıradaki işaretlenmemiş YKS konusu: "Ders · Konu"
  function todayNextYksTopic() {
    const st = todayReadJSON('yksChecklistState') || {};
    const groups = ['TYT', 'AYT'];
    for (let g = 0; g < groups.length; g++) {
      const dersler = YKS_DATA[groups[g]] || [];
      for (let i = 0; i < dersler.length; i++) {
        const ders = dersler[i];
        for (let j = 0; j < ders.konular.length; j++) {
          const konu = ders.konular[j];
          const ids = yksLeafIds(konu);
          for (let k = 0; k < ids.length; k++) {
            if (!st[ids[k]]) {
              const alt = (konu.altKonular && konu.altKonular.length) ? ' · ' + konu.altKonular[k] : '';
              return { ders: ders.ad.replace(/\s*\(\d+\)$/, ''), konu: konu.ad + alt, group: groups[g] };
            }
          }
        }
      }
    }
    return null;
  }

  function todayNextEvrak() {
    const st = todayReadJSON('evrakChecklistState') || {};
    const sides = [
      { label: 'Türkiye', list: EVRAK_CHECKLIST.turkiye.kalemler },
      { label: 'Almanya', list: EVRAK_CHECKLIST.almanya.kalemler }
    ];
    for (let i = 0; i < sides.length; i++) {
      for (let j = 0; j < sides[i].list.length; j++) {
        if (!st[sides[i].list[j].id]) return { side: sides[i].label, ad: sides[i].list[j].ad };
      }
    }
    return null;
  }

  function motivationRenderToday() {
    const card = document.querySelector('.today-card');
    if (!card) return;

    const now = new Date();
    const dateEl = document.getElementById('todayDate');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // --- Check-in durumu ---
    const state = motivationLoadState();
    const checkins = state.checkins || {};
    const doneToday = !!checkins[motivationTodayKey()];
    const btn = document.getElementById('todayCheckinBtn');
    const lbl = document.getElementById('todayCheckinLabel');
    if (btn) btn.classList.toggle('done', doneToday);
    if (lbl) lbl.textContent = doneToday ? '✓ Bugün işaretlendi' : 'Bugünü işaretle';

    const streak = motivationComputeStreak(checkins);
    const streakEl = document.getElementById('todayStreak');
    if (streakEl) {
      streakEl.innerHTML = streak > 0
        ? '<b>' + streak + '</b> gündür üst üste. Bugün de küçük bir şey yeter.'
        : 'Seri henüz başlamadı — bugün ilk adımı at.';
    }

    // --- Almanca: bugünkü kelime sayacı ---
    const alm = todayReadJSON('almancaState_v1');
    const almMain = document.getElementById('todayAlmMain');
    const almMeta = document.getElementById('todayAlmMeta');
    if (almMain) {
      const target = (alm && alm.wordTarget) || 15;
      const done = (alm && alm.wordLog && alm.wordLog[motivationTodayKey()]) || 0;
      const studied = !!(alm && alm.studyDays && alm.studyDays[motivationTodayKey()]);
      almMain.textContent = done + ' / ' + target + ' kelime';
      almMain.parentElement.classList.toggle('is-done', done >= target && studied);
      if (almMeta) {
        almMeta.textContent = done >= target
          ? (studied ? 'bugünlük tamam' : 'kelime tamam · çalışmayı işaretle')
          : (target - done) + ' kelime kaldı';
      }
    }

    // --- YKS: sıradaki konu ---
    const yksMain = document.getElementById('todayYksMain');
    const yksMeta = document.getElementById('todayYksMeta');
    if (yksMain) {
      const next = todayNextYksTopic();
      if (next) {
        yksMain.textContent = next.konu;
        if (yksMeta) yksMeta.textContent = next.group + ' · ' + next.ders;
      } else {
        yksMain.textContent = 'Bütün konular bitti';
        yksMain.parentElement.classList.add('is-done');
        if (yksMeta) yksMeta.textContent = 'tekrar zamanı';
      }
    }

    // --- Evrak: sıradaki madde ---
    const evMain = document.getElementById('todayEvrakMain');
    const evMeta = document.getElementById('todayEvrakMeta');
    if (evMain) {
      const next = todayNextEvrak();
      if (next) {
        evMain.textContent = next.ad;
        if (evMeta) evMeta.textContent = next.side + ' cephesi';
      } else {
        evMain.textContent = 'Evrak cephesi tamam';
        evMain.parentElement.classList.add('is-done');
        if (evMeta) evMeta.textContent = '';
      }
    }
  }

  function motivationInitToday() {
    const btn = document.getElementById('todayCheckinBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      motivationToggleCheckin();
      motivationRenderToday();
    });
    motivationRenderToday();
  }

  // ============================================================
  // KAPALI AKORDİYON ÖZETİ — kapalıyken boş bant yerine durum satırı
  // ============================================================
  function motivationRenderAccStatus() {
    const el = document.getElementById('proofAccStatus');
    if (!el) return;
    const state = motivationLoadState();
    const earned = Object.keys(state.badges || {}).length;
    const logs = (state.log || []).length;
    const parts = [earned + '/' + BADGE_DEFS.length + ' rozet'];
    if (logs) {
      const last = state.log[0];
      const days = Math.floor((Date.now() - last.ts) / 86400000);
      parts.push(days <= 0 ? 'son kayıt bugün' : 'son kayıt ' + days + ' gün önce');
    } else {
      parts.push('henüz kayıt yok');
    }
    el.textContent = parts.join(' · ');
  }

  function motivationInitStage5() {
    motivationInitTrackLinkGenerator();
    motivationInitToday();
    motivationRenderAccStatus();

    const params = new URLSearchParams(location.search);
    const track = params.get('track');
    if (!track) return;
    try {
      const snap = JSON.parse(trackB64UrlDecode(track));
      if (snap && snap.v === 1) motivationRenderTrackingOverlay(snap);
    } catch (e) {
      // bozuk/eski link — sessizce yoksay, normal panel görünür kalır
    }
  }
  motivationInitStage5();
