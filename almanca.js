// ============================================================
// almanca.js — ALMANCA A1→C1 sayfasına özel mantık.
// core.js'ten SONRA yüklenmeli (setLang, motivationLoadState vb.
// çekirdek fonksiyonlara güvenir, ama kendi state'ini AYRI bir
// localStorage anahtarında tutar: almancaState_v1).
// ============================================================

(function () {

  // ============================================================
  // 1. VERİ — Seviye yol haritası + her seviyenin konu/tema listesi.
  // Her tema check edilebilir; seviyenin % tamamlanması buradan hesaplanır.
  // ============================================================
  const ALMANCA_LEVELS = [
    {
      id: 'a1', label: 'A1', ay: 'Ekim–Kasım',
      tr: 'Temel Seviye', de: 'Grundstufe',
      themes: [
        { id: 'a1-alphabet', tr: 'Alfabe & telaffuz', de: 'Alphabet & Aussprache' },
        { id: 'a1-vorstellen', tr: 'Kendini tanıtma (sich vorstellen)', de: 'Sich vorstellen' },
        { id: 'a1-zahlen', tr: 'Sayılar, saat, tarih', de: 'Zahlen, Uhrzeit, Datum' },
        { id: 'a1-praesens', tr: 'Präsens (şimdiki zaman) çekimi', de: 'Präsens-Konjugation' },
        { id: 'a1-artikel', tr: 'Der/die/das — artikel ve Akkusativ', de: 'Artikel & Akkusativ' },
        { id: 'a1-alltag', tr: 'Günlük yaşam kelime hazinesi', de: 'Alltagswortschatz' },
        { id: 'a1-fragen', tr: 'Soru cümleleri (W-Fragen)', de: 'W-Fragen' }
      ]
    },
    {
      id: 'a2', label: 'A2', ay: 'Aralık–Ocak',
      tr: 'Temel Seviye+', de: 'Grundstufe+',
      themes: [
        { id: 'a2-perfekt', tr: 'Perfekt (geçmiş zaman)', de: 'Perfekt' },
        { id: 'a2-praeteritum', tr: 'Präteritum (sein/haben/modal)', de: 'Präteritum' },
        { id: 'a2-dativ', tr: 'Dativ — temel kullanım', de: 'Dativ — Grundlagen' },
        { id: 'a2-modal', tr: 'Modalverben (können, müssen, wollen…)', de: 'Modalverben' },
        { id: 'a2-satzbau', tr: 'Bağlaçlar & yan cümle başlangıcı', de: 'Konnektoren & Nebensätze' },
        { id: 'a2-einkaufen', tr: 'Alışveriş, randevu, telefon dili', de: 'Einkaufen, Termine, Telefonieren' },
        { id: 'a2-comparativ', tr: 'Komparativ / Superlativ', de: 'Komparativ / Superlativ' }
      ]
    },
    {
      id: 'b1', ay: 'Şubat–Nisan', label: 'B1',
      tr: 'Orta Seviye', de: 'Mittelstufe',
      themes: [
        { id: 'b1-dativ-akk', tr: 'Dativ/Akkusativ ayrımı — ileri', de: 'Dativ/Akkusativ — vertieft' },
        { id: 'b1-passiv', tr: 'Passiv (edilgen çatı)', de: 'Passiv' },
        { id: 'b1-konjunktiv2', tr: 'Konjunktiv II (dilek/koşul kipi)', de: 'Konjunktiv II' },
        { id: 'b1-nebensaetze', tr: 'Yan cümleler (weil, obwohl, dass…)', de: 'Nebensätze' },
        { id: 'b1-genitiv', tr: 'Genitiv', de: 'Genitiv' },
        { id: 'b1-meinung', tr: 'Görüş bildirme & tartışma dili', de: 'Meinung äußern & diskutieren' },
        { id: 'b1-beruf', tr: 'İş hayatı & başvuru dili', de: 'Berufssprache & Bewerbung' }
      ]
    },
    {
      id: 'b2', ay: 'Mayıs–Temmuz', label: 'B2',
      tr: 'Orta Seviye+', de: 'Mittelstufe+',
      themes: [
        { id: 'b2-konnektoren', tr: 'İleri bağlaçlar (je…desto, indem…)', de: 'Erweiterte Konnektoren' },
        { id: 'b2-nominalisierung', tr: 'Nominalizasyon (isim yapıları)', de: 'Nominalisierung' },
        { id: 'b2-indirekte-rede', tr: 'Dolaylı anlatım (indirekte Rede)', de: 'Indirekte Rede' },
        { id: 'b2-textsorten', tr: 'Metin türleri: rapor, özet, e-posta', de: 'Textsorten: Bericht, Zusammenfassung' },
        { id: 'b2-diskussion', tr: 'Akademik tartışma & argümantasyon', de: 'Akademische Diskussion' },
        { id: 'b2-hoerverstehen', tr: 'İleri dinleme — haber/podcast', de: 'Hörverstehen — Nachrichten/Podcast' }
      ]
    },
    {
      id: 'c1', ay: 'Ağustos–Eylül', label: 'C1',
      tr: 'İleri Seviye', de: 'Fortgeschrittene Stufe',
      themes: [
        { id: 'c1-fachsprache', tr: 'Teknik/akademik terminoloji (Mekatronik)', de: 'Fachsprache (Mechatronik)' },
        { id: 'c1-wissenschaft', tr: 'Bilimsel metin okuma & analiz', de: 'Wissenschaftliche Texte' },
        { id: 'c1-vortrag', tr: 'Sunum & sözlü savunma dili', de: 'Vortrag & mündliche Verteidigung' },
        { id: 'c1-stilmittel', tr: 'Üslup & ileri ifade kalıpları', de: 'Stilmittel & Redewendungen' },
        { id: 'c1-pruefung', tr: 'telc C1 Hochschule sınav formatı pratiği', de: 'telc C1 Hochschule — Prüfungsformat' },
        { id: 'c1-final', tr: 'Final deneme sınavları', de: 'Abschlussprüfungssimulationen' }
      ]
    }
  ];

  // Beceri dağılımı — 6 kategori, manuel olarak +/- ile güncellenir (0-100)
  const SKILLS = [
    { id: 'wortschatz', tr: 'Wortschatz (Kelime)', de: 'Wortschatz' },
    { id: 'grammatik',  tr: 'Grammatik (Dilbilgisi)', de: 'Grammatik' },
    { id: 'hoeren',     tr: 'Hören (Dinleme)', de: 'Hören' },
    { id: 'sprechen',   tr: 'Sprechen (Konuşma)', de: 'Sprechen' },
    { id: 'lesen',      tr: 'Lesen (Okuma)', de: 'Lesen' },
    { id: 'schreiben',  tr: 'Schreiben (Yazma)', de: 'Schreiben' }
  ];

  // Sınavlar. lvl = sınavın seviyesi (0=A1 ... 5=C2); "Yaklaşan sınav"
  // kartı bu bilgiyi kullanıyor, yoksa A1'deyken 75 gün sonrasına C1
  // sınavı gösteriyordu — motive etmek yerine baştan yenilgi hissi verir.
  //
  // TARİHLER ELLE GİRİLİYOR ve eskiyor. Panelde geçmiş tarihler
  // gösterilmiyor; bir sınavın tarihleri tükenirse kart bunu söylüyor.
  // Kesin tarih için her zaman kurumun kendi takvimine bak.
  const EXAMS = [
    { id: 'telc-a2',  lvl: 1, name: 'telc Deutsch A2', note: 'VHS / Mannheim Abendakademie — tarihleri kursla netleştir', dates: [] },
    { id: 'telc-b1',  lvl: 2, name: 'telc Deutsch B1', note: 'VHS / Mannheim Abendakademie — tarihleri kursla netleştir', dates: [] },
    { id: 'telc-b2',  lvl: 3, name: 'telc Deutsch B2', note: 'VHS / Mannheim Abendakademie — tarihleri kursla netleştir', dates: [] },
    { id: 'telc-c1',  lvl: 4, name: 'telc Deutsch C1 Hochschule', note: 'Mannheim Abendakademie', dates: ['2026-11-03', '2026-12-18'] },
    { id: 'testdaf',  lvl: 4, name: 'TestDaF (TDN 4×4 şart)', note: '', dates: ['2027-01-20', '2027-04-14', '2027-06-08', '2027-09-15', '2027-10-07', '2027-11-11'] },
    { id: 'dsh',      lvl: 4, name: 'DSH-2 / DSH-3', note: 'Sabit takvim yok — kuruma sorulmalı', dates: [] },
    { id: 'goethe-c2', lvl: 5, name: 'Goethe-Zertifikat C2 (GDS)', note: 'C1 yeterli değil, bilgi amaçlı', dates: [] }
  ];

  const STATUS_OPTS = [
    { v: 'none', tr: 'Planlanmadı', de: 'Nicht geplant' },
    { v: 'planned', tr: 'Hedefte', de: 'Geplant' },
    { v: 'registered', tr: 'Kayıt yapıldı', de: 'Angemeldet' },
    { v: 'passed', tr: 'Geçildi ✓', de: 'Bestanden ✓' }
  ];

  const STORE_KEY = 'almancaState_v1';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const s = raw ? JSON.parse(raw) : {};
      s.themes = s.themes || {};
      s.skills = s.skills || { wortschatz: 20, grammatik: 15, hoeren: 25, sprechen: 10, lesen: 30, schreiben: 10 };
      s.wordTarget = s.wordTarget || 15;
      s.wordLog = s.wordLog || {};
      s.studyDays = s.studyDays || {};
      s.examStatus = s.examStatus || {};
      return s;
    } catch (e) {
      return { themes: {}, skills: { wortschatz: 20, grammatik: 15, hoeren: 25, sprechen: 10, lesen: 30, schreiben: 10 }, wordTarget: 15, wordLog: {}, studyDays: {}, examStatus: {} };
    }
  }
  function saveState(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  // Gün tanımı core.js ile aynı olmalı: yerel saat, sınır 04:00.
  // (Eskiden UTC'ydi; gece vardiyasından sonra yapılan kayıt bir önceki
  // güne yazılıyordu.)
  function todayKey() {
    return (typeof motivationTodayKey === 'function')
      ? motivationTodayKey()
      : new Date().toISOString().slice(0, 10);
  }
  function lang() { return document.documentElement.getAttribute('lang') || 'tr'; }

  // ============================================================
  // 2. SEVİYE İLERLEME HESAPLARI
  // ============================================================
  function levelStats(state) {
    return ALMANCA_LEVELS.map(function (lvl) {
      const total = lvl.themes.length;
      let done = 0;
      lvl.themes.forEach(function (t) { if (state.themes[t.id]) done++; });
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { level: lvl, done: done, total: total, pct: pct };
    });
  }

  function overallPct(stats) {
    if (!stats.length) return 0;
    const sum = stats.reduce(function (acc, s) { return acc + s.pct; }, 0);
    return Math.round(sum / stats.length);
  }

  function currentLevelIndex(stats) {
    for (let i = 0; i < stats.length; i++) {
      if (stats[i].pct < 100) return i;
    }
    return stats.length - 1;
  }

  // ============================================================
  // 3. RENDER — Seviye kartları (ring + tema checklist accordion)
  // ============================================================
  const RING_CIRC = 2 * Math.PI * 34; // r=34

  function renderLevelCards() {
    const wrap = document.getElementById('almancaLevelCards');
    if (!wrap) return;
    const state = loadState();
    const stats = levelStats(state);
    const curIdx = currentLevelIndex(stats);
    const L = lang();

    wrap.innerHTML = stats.map(function (s, i) {
      const status = s.pct === 100 ? 'done' : (i === curIdx ? 'now' : 'locked');
      const offset = RING_CIRC - (RING_CIRC * s.pct / 100);
      const statusLabel = status === 'done'
        ? (L === 'de' ? 'Abgeschlossen' : 'Tamamlandı')
        : (status === 'now' ? (L === 'de' ? 'Aktuell' : 'Şu an burada') : (L === 'de' ? 'Noch nicht' : 'Sırada'));
      return (
        '<div class="lvl-card lvl-' + status + '" data-level="' + s.level.id + '">' +
          '<div class="lvl-card-top">' +
            '<svg class="lvl-ring" viewBox="0 0 80 80" aria-hidden="true">' +
              '<circle class="lvl-ring-track" cx="40" cy="40" r="34"></circle>' +
              '<circle class="lvl-ring-fill" cx="40" cy="40" r="34" style="stroke-dasharray:' + RING_CIRC + '; stroke-dashoffset:' + offset + '"></circle>' +
            '</svg>' +
            '<div class="lvl-ring-label">' +
              '<span class="lvl-ring-pct">%' + s.pct + '</span>' +
              '<span class="lvl-ring-code">' + s.level.label + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="lvl-card-name">' + (L === 'de' ? s.level.de : s.level.tr) + '</div>' +
          '<div class="lvl-card-month">' + s.level.ay + '</div>' +
          '<div class="lvl-card-status lvl-card-status--' + status + '">' + statusLabel + '</div>' +
          '<div class="lvl-card-frac">' + s.done + '/' + s.total + '</div>' +
        '</div>'
      );
    }).join('');

    renderTopStats(stats);
  }

  function renderThemeChecklist() {
    const wrap = document.getElementById('almancaThemeGroups');
    if (!wrap) return;
    const state = loadState();
    const L = lang();

    wrap.innerHTML = ALMANCA_LEVELS.map(function (lvl) {
      let done = 0;
      const rows = lvl.themes.map(function (t) {
        const checked = !!state.themes[t.id];
        if (checked) done++;
        return (
          '<label class="yks-topic-row' + (checked ? ' checked' : '') + '" data-theme-id="' + t.id + '">' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + '>' +
            '<span class="yks-topic-name">' + (L === 'de' ? t.de : t.tr) + '</span>' +
          '</label>'
        );
      }).join('');
      const pct = lvl.themes.length ? Math.round((done / lvl.themes.length) * 100) : 0;
      return (
        '<details class="acc-section theme-group">' +
          '<summary class="sec-label acc-summary"><span>' + lvl.label + ' — ' + (L === 'de' ? lvl.de : lvl.tr) + '</span><span class="theme-group-pct">%' + pct + '</span><span class="acc-chevron">▾</span></summary>' +
          '<div class="acc-body"><div class="yks-topic-list">' + rows + '</div></div>' +
        '</details>'
      );
    }).join('');

    wrap.querySelectorAll('.yks-topic-row').forEach(function (row) {
      row.querySelector('input').addEventListener('change', function () {
        const id = row.dataset.themeId;
        const s = loadState();
        if (this.checked) s.themes[id] = true; else delete s.themes[id];
        saveState(s);
        row.classList.toggle('checked', this.checked);
        renderLevelCards();
        renderThemeChecklist();
        if (typeof motivationLogEvent === 'function') {
          motivationLogEvent(this.checked ? '🇩🇪 Almanca konu tamamlandı: ' + id : '↩️ Almanca konu geri alındı: ' + id);
        }
      });
    });
  }

  // ============================================================
  // 4. ÜST İSTATİSTİK KARTLARI (genel %, seri, sınava kalan gün)
  // ============================================================
  // core.js'teki genel seri hesabıyla aynı kurallar: gün henüz bitmediği
  // için bugün işaretsizse seri kırılmaz, Pazartesi (haftalık tam dinlenme
  // günü) seriyi kırmaz, gün sınırı yerel saatle 04:00'tür.
  function computeStreak(studyDays) {
    if (typeof motivationComputeStreak === 'function') {
      return motivationComputeStreak(studyDays);
    }
    let streak = 0;
    let d = new Date();
    while (streak < 800) {
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (studyDays[key]) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  }

  // Yaklaşan sınav, mevcut seviyenin en fazla BİR ÜSTÜNDEKİ sınavlar
  // arasından seçilir. A1'deyken hedef C1 sınavı değil, bir sonraki
  // basamaktır. Uygun aday yoksa seviye filtresi gevşetilir.
  function nextExamInfo(curLvlIdx) {
    const state = loadState();
    const now = new Date();
    function pick(maxLvl) {
      let best = null;
      EXAMS.forEach(function (ex) {
        if (state.examStatus[ex.id] === 'passed') return;
        if (maxLvl !== null && ex.lvl > maxLvl) return;
        ex.dates.forEach(function (dstr) {
          const d = new Date(dstr + 'T10:00:00');
          if (d > now && (!best || d < best.date)) best = { date: d, exam: ex };
        });
      });
      return best;
    }
    if (typeof curLvlIdx === 'number') {
      const near = pick(curLvlIdx + 1);
      if (near) return near;
    }
    return pick(null);
  }

  function renderTopStats(stats) {
    const state = loadState();
    const pct = overallPct(stats);
    const gaugeEl = document.getElementById('almGaugeFill');
    const pctEl = document.getElementById('almGaugePct');
    if (gaugeEl) {
      const CIRC = 326.7;
      gaugeEl.style.strokeDashoffset = CIRC - (CIRC * pct / 100);
    }
    if (pctEl) pctEl.textContent = '%' + pct;

    const curIdx = currentLevelIndex(stats);
    const curLvlEl = document.getElementById('almCurrentLevel');
    if (curLvlEl) curLvlEl.textContent = stats[curIdx].level.label;

    const streak = computeStreak(state.studyDays);
    const streakEl = document.getElementById('almStreakNum');
    if (streakEl) streakEl.textContent = streak;

    const next = nextExamInfo(curIdx);
    const examEl = document.getElementById('almNextExamDays');
    const examNameEl = document.getElementById('almNextExamName');
    if (next) {
      const days = Math.ceil((next.date - new Date()) / 86400000);
      if (examEl) examEl.textContent = days;
      if (examNameEl) examNameEl.textContent = next.exam.name;
    } else {
      if (examEl) examEl.textContent = '–';
      if (examNameEl) examNameEl.textContent = lang() === 'de' ? 'Kein Termin geplant' : 'Planlanmış tarih yok';
    }
  }

  // ============================================================
  // 5. BUGÜN ÇALIŞTIM BUTONU (seriye özel — genel check-in'den farklı)
  // ============================================================
  function renderStudyButton() {
    const btn = document.getElementById('almStudyBtn');
    if (!btn) return;
    const state = loadState();
    const done = !!state.studyDays[todayKey()];
    const L = lang();
    btn.classList.toggle('done', done);
    btn.textContent = done
      ? (L === 'de' ? '✓ Heute gelernt' : '✓ Bugün çalıştım')
      : (L === 'de' ? 'Heute Deutsch gelernt' : 'Bugün Almanca çalıştım');
  }

  function toggleStudyDay() {
    const state = loadState();
    const key = todayKey();
    if (state.studyDays[key]) delete state.studyDays[key];
    else state.studyDays[key] = true;
    saveState(state);
    renderStudyButton();
    renderLevelCards();
    renderStreakCalendar();
    if (state.studyDays[key] && typeof motivationLogEvent === 'function') {
      motivationLogEvent('🇩🇪 Bugün Almanca çalışıldı olarak işaretlendi.');
    }
  }

  // ============================================================
  // 6. SERİ TAKVİMİ — son 28 günün mini ızgarası
  // ============================================================
  function renderStreakCalendar() {
    const wrap = document.getElementById('almStreakCal');
    if (!wrap) return;
    const state = loadState();
    const cells = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const on = !!state.studyDays[key];
      cells.push('<span class="streak-cell' + (on ? ' on' : '') + '" title="' + key + '"></span>');
    }
    wrap.innerHTML = cells.join('');
  }

  // ============================================================
  // 7. KELİME SAYACI — günlük hedef + sayaç
  // ============================================================
  function renderWordCounter() {
    const state = loadState();
    const key = todayKey();
    const done = state.wordLog[key] || 0;
    const target = state.wordTarget;
    const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;

    const numEl = document.getElementById('almWordDone');
    const targetEl = document.getElementById('almWordTarget');
    const barEl = document.getElementById('almWordBar');
    if (numEl) numEl.textContent = done;
    if (targetEl) targetEl.textContent = target;
    if (barEl) barEl.style.width = pct + '%';
  }

  function adjustWordCount(delta) {
    const state = loadState();
    const key = todayKey();
    const cur = state.wordLog[key] || 0;
    const next = Math.max(0, cur + delta);
    state.wordLog[key] = next;
    saveState(state);
    renderWordCounter();
    if (delta > 0 && next === state.wordTarget && typeof motivationLogEvent === 'function') {
      motivationLogEvent('📚 Günlük kelime hedefine ulaşıldı (' + next + ').');
    }
  }

  function adjustWordTarget(delta) {
    const state = loadState();
    state.wordTarget = Math.max(1, state.wordTarget + delta);
    saveState(state);
    renderWordCounter();
  }

  // ============================================================
  // 8. BECERİ DAĞILIMI — 6 kategori, +/- ile manuel güncelleme
  // ============================================================
  function renderSkills() {
    const wrap = document.getElementById('almSkillBars');
    if (!wrap) return;
    const state = loadState();
    const L = lang();
    wrap.innerHTML = SKILLS.map(function (sk) {
      const val = state.skills[sk.id] || 0;
      return (
        '<div class="skill-row" data-skill="' + sk.id + '">' +
          '<span class="skill-label">' + (L === 'de' ? sk.de : sk.tr) + '</span>' +
          '<span class="skill-track"><span class="skill-fill" style="width:' + val + '%"></span></span>' +
          '<span class="skill-val">%' + val + '</span>' +
          '<span class="skill-btns">' +
            '<button type="button" class="skill-btn" data-delta="-5">–</button>' +
            '<button type="button" class="skill-btn" data-delta="5">+</button>' +
          '</span>' +
        '</div>'
      );
    }).join('');

    wrap.querySelectorAll('.skill-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const row = btn.closest('.skill-row');
        const id = row.dataset.skill;
        const delta = parseInt(btn.dataset.delta, 10);
        const s = loadState();
        const cur = s.skills[id] || 0;
        s.skills[id] = Math.max(0, Math.min(100, cur + delta));
        saveState(s);
        renderSkills();
      });
    });
  }

  // ============================================================
  // 9. SINAV TAKVİMİ
  // ============================================================
  function renderExamTracker() {
    const wrap = document.getElementById('almExamList');
    if (!wrap) return;
    const state = loadState();
    const L = lang();

    wrap.innerHTML = EXAMS.map(function (ex) {
      const status = state.examStatus[ex.id] || 'none';
      // Geçmiş tarihler gösterilmiyor; liste tükendiyse bunu açıkça söyle.
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming = ex.dates.filter(function (d) { return new Date(d + 'T00:00:00') >= today; });
      let dateChips;
      if (upcoming.length) {
        dateChips = upcoming.map(function (d) {
          const dt = new Date(d + 'T00:00:00');
          return '<span class="cert-date-chip">' + dt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + '</span>';
        }).join('');
      } else if (ex.dates.length) {
        dateChips = '<span class="cert-mini-note">Kayıtlı tarihler geçti — kurumun güncel takvimine bak.</span>';
      } else {
        dateChips = '<span class="cert-mini-note">' + ex.note + '</span>';
      }
      const optionsHTML = STATUS_OPTS.map(function (o) {
        return '<option value="' + o.v + '"' + (o.v === status ? ' selected' : '') + '>' + (L === 'de' ? o.de : o.tr) + '</option>';
      }).join('');
      return (
        '<div class="cert-mini exam-mini" data-exam-id="' + ex.id + '">' +
          '<div class="cert-mini-top">' +
            '<span class="cert-mini-name">' + ex.name + '</span>' +
            '<select class="exam-status-select">' + optionsHTML + '</select>' +
          '</div>' +
          '<div class="cert-mini-dates">' + dateChips + (ex.note && upcoming.length ? '<span class="cert-mini-note">' + ex.note + '</span>' : '') + '</div>' +
        '</div>'
      );
    }).join('');

    wrap.querySelectorAll('.exam-status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        const id = sel.closest('.exam-mini').dataset.examId;
        const s = loadState();
        s.examStatus[id] = sel.value;
        saveState(s);
        renderLevelCards();
        if (typeof motivationLogEvent === 'function') {
          motivationLogEvent('📝 Sınav durumu güncellendi: ' + id + ' → ' + sel.value);
        }
      });
    });
  }

  // ============================================================
  // 10. BAŞLAT
  // ============================================================
  function initAlmanca() {
    renderLevelCards();
    renderThemeChecklist();
    renderStudyButton();
    renderStreakCalendar();
    renderWordCounter();
    renderSkills();
    renderExamTracker();

    const studyBtn = document.getElementById('almStudyBtn');
    if (studyBtn) studyBtn.addEventListener('click', toggleStudyDay);

    const wpBtn = document.getElementById('almWordPlus');
    const wmBtn = document.getElementById('almWordMinus');
    if (wpBtn) wpBtn.addEventListener('click', function () { adjustWordCount(1); });
    if (wmBtn) wmBtn.addEventListener('click', function () { adjustWordCount(-1); });

    const tpBtn = document.getElementById('almTargetPlus');
    const tmBtn = document.getElementById('almTargetMinus');
    if (tpBtn) tpBtn.addEventListener('click', function () { adjustWordTarget(5); });
    if (tmBtn) tmBtn.addEventListener('click', function () { adjustWordTarget(-5); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlmanca);
  } else {
    initAlmanca();
  }

  // Dil değişince (TR/DE) sayfayı yeniden çiz — setLang core.js'te tanımlı,
  // burada onu saramıyoruz ama dil butonlarına ek bir dinleyici ekliyoruz.
  document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTimeout(function () {
        renderLevelCards();
        renderThemeChecklist();
        renderStudyButton();
        renderWordCounter();
        renderSkills();
        renderExamTracker();
      }, 0);
    });
  });

})();
