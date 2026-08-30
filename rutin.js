// ============================================================
// rutin.js — Günlük Rutin sayfası: saat saat gün şablonu, haftalık
// spor programı ve beslenme alışkanlıkları. Sadece rutin.html'de
// yüklenir. core.js'in ÖNCE yüklenmiş olması gerekir
// (motivationTodayKey / motivationLogEvent için — yoksa da çalışır).
//
// Veri modeli: her şey TARİHE göre saklanır, yani her sabah
// (04:00 gün sınırı) kutucuklar kendiliğinden sıfırlanır.
// ============================================================

  // core.js'teki gün anahtarı yoksa yerel bir yedek üret.
  function rutinTodayKey() {
    if (typeof motivationTodayKey === 'function') return motivationTodayKey();
    const d = new Date();
    if (d.getHours() < 4) d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ============================================================
  // GÜN ŞABLONU — TASLAK. YKS yılına göre kurgulandı: günün en taze
  // saatleri en zor işe (AYT Matematik) ayrıldı, spor akşamüstü
  // "ikinci rüzgâr" olarak konumlandı, dil günde 30 dk'lık küçük
  // ama her gün tekrarlanan bir alışkanlık olarak duruyor.
  // ============================================================
  const RUTIN_GUN = [
    { id: 'r-0630', saat: '06:30', ad: 'Uyanış · su · 10 dk esneme', tur: 'temel' },
    { id: 'r-0700', saat: '07:00', ad: 'Kahvaltı (protein ağırlıklı)', tur: 'beslenme' },
    { id: 'r-0730', saat: '07:30–09:30', ad: 'YKS Blok 1 · AYT Matematik', tur: 'yks', not: 'En zor iş, en taze kafa. Gün içinde ertelenirse bir daha aynı verimle çalışılmıyor.' },
    { id: 'r-0930', saat: '09:30–09:45', ad: 'Mola · ekran yok', tur: 'temel' },
    { id: 'r-0945', saat: '09:45–11:45', ad: 'YKS Blok 2 · AYT Fizik / Kimya (dönüşümlü)', tur: 'yks' },
    { id: 'r-1145', saat: '11:45–12:45', ad: 'Öğle yemeği + 15 dk yürüyüş', tur: 'beslenme' },
    { id: 'r-1245', saat: '12:45–14:45', ad: 'YKS Blok 3 · TYT (Türkçe / Matematik dönüşümlü)', tur: 'yks', not: 'TYT netleri sıralamada AYT kadar belirleyici — "kolay" diye ihmal edilen yer burası.' },
    { id: 'r-1445', saat: '14:45–15:15', ad: 'Kısa uyku (20 dk) veya mola', tur: 'temel' },
    { id: 'r-1515', saat: '15:15–16:45', ad: 'YKS Blok 4 · Soru çözümü + hata analizi', tur: 'yks', not: 'Hata analizi olmadan çözülen soru, tekrarlanan hatadır. Yanlışları deftere yaz.' },
    { id: 'r-1700', saat: '17:00–18:30', ad: 'SPOR · salon veya kardiyo', tur: 'spor', not: 'Sporu "zaman kaybı" değil, akşam bloğunun yakıtı olarak gör.' },
    { id: 'r-1830', saat: '18:30–19:15', ad: 'Akşam yemeği + duş', tur: 'beslenme' },
    { id: 'r-1915', saat: '19:15–19:45', ad: 'İspanyolca · 30 dk', tur: 'dil', not: 'Kısa ama asla atlanmayan blok. Dil, uzun seansla değil kesintisiz tekrarla öğreniliyor.' },
    { id: 'r-1945', saat: '19:45–21:00', ad: 'YKS Blok 5 · Günün tekrarı / eksik konu', tur: 'yks' },
    { id: 'r-2100', saat: '21:00–22:15', ad: 'Serbest · kitap / gündem okuma (genel kültür)', tur: 'genel' },
    { id: 'r-2215', saat: '22:15–22:45', ad: 'Yarını planla · ekranı bırak', tur: 'temel', not: 'Ertesi günün 3 önceliğini yaz. Sabah "ne yapsam" diye düşünmek, günün en pahalı 20 dakikası.' },
    { id: 'r-2300', saat: '23:00', ad: 'Uyku', tur: 'temel', not: '7–8 saat uyku, hafızanın konuyu kalıcı hale getirdiği yer. Uykudan çalınan saat, ertesi gün iki katı olarak geri alınıyor.' }
  ];

  const RUTIN_TUR_ETIKET = {
    yks: 'YKS', spor: 'Spor', dil: 'Dil', beslenme: 'Beslenme', genel: 'Genel Kültür', temel: 'Temel'
  };

  // ============================================================
  // HAFTALIK SPOR PROGRAMI — karma (salon + kardiyo).
  // ============================================================
  const SPOR_HAFTA = [
    { id: 's-pzt', gun: 'Pazartesi', tur: 'Salon', detay: 'İtiş — göğüs, omuz, triceps' },
    { id: 's-sal', gun: 'Salı', tur: 'Kardiyo', detay: '30–40 dk tempolu koşu' },
    { id: 's-car', gun: 'Çarşamba', tur: 'Salon', detay: 'Bacak — squat, lunge, calf' },
    { id: 's-per', gun: 'Perşembe', tur: 'Hafif', detay: 'Yürüyüş + esneme (aktif dinlenme)' },
    { id: 's-cum', gun: 'Cuma', tur: 'Salon', detay: 'Çekiş — sırt, biceps' },
    { id: 's-cmt', gun: 'Cumartesi', tur: 'Kardiyo', detay: 'Uzun tempo, mümkünse açık havada' },
    { id: 's-paz', gun: 'Pazar', tur: 'Dinlenme', detay: 'Tam dinlenme — kas bu gün büyüyor' }
  ];

  // ============================================================
  // BESLENME — kısıtlayıcı bir diyet değil, çalışma performansını
  // ayakta tutan birkaç sade alışkanlık.
  // ============================================================
  const BESLENME = [
    { id: 'b-ogun', ad: '3 ana öğün — hiçbirini atlamadım' },
    { id: 'b-protein', ad: 'Her öğünde bir protein kaynağı vardı' },
    { id: 'b-su', ad: '~2.5 L su içtim' },
    { id: 'b-kafein', ad: 'Kafeini 16:00\'dan sonra kestim' },
    { id: 'b-atistirma', ad: 'Çalışma aralarında şeker yerine kuruyemiş/meyve' },
    { id: 'b-aksam', ad: 'Akşam yemeğini uykudan en az 2 saat önce bitirdim' }
  ];

  const RUTIN_STORAGE_KEY = 'rutinDailyState';

  function rutinLoadState() {
    try {
      const raw = localStorage.getItem(RUTIN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Rutin state okunamadı:', e);
      return {};
    }
  }

  function rutinSaveState(state) {
    try {
      localStorage.setItem(RUTIN_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Rutin state kaydedilemedi:', e);
    }
  }

  let _rutinState = rutinLoadState();

  function rutinDay(key) {
    if (!_rutinState[key]) _rutinState[key] = {};
    return _rutinState[key];
  }

  function rutinIsChecked(itemId) {
    const day = _rutinState[rutinTodayKey()];
    return !!(day && day[itemId]);
  }

  function rutinSetChecked(itemId, val) {
    const day = rutinDay(rutinTodayKey());
    if (val) day[itemId] = true; else delete day[itemId];
    rutinSaveState(_rutinState);
  }

  // Bir günün tamamlanma oranı: gün şablonu + beslenme maddeleri üzerinden.
  function rutinDayPct(dayObj) {
    const ids = RUTIN_GUN.map(x => x.id).concat(BESLENME.map(x => x.id));
    if (!ids.length) return 0;
    let done = 0;
    ids.forEach(id => { if (dayObj && dayObj[id]) done++; });
    return Math.round((done / ids.length) * 100);
  }

  // Seri: geriye doğru, %70 ve üzeri tamamlanan ardışık günler.
  // Bugün henüz tamamlanmamışsa seri kırılmış sayılmaz — dünden geriye bakılır.
  const RUTIN_STREAK_ESIK = 70;

  function rutinComputeStreak() {
    let streak = 0;
    const d = new Date();
    if (d.getHours() < 4) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const pct = rutinDayPct(_rutinState[key]);
      if (pct >= RUTIN_STREAK_ESIK) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function rutinRowHTML(item, extraLabel) {
    const checked = rutinIsChecked(item.id);
    return '<label class="rutin-row' + (checked ? ' checked' : '') + '" data-tur="' + (item.tur || '') + '">' +
      '<input type="checkbox" class="rutin-checkbox" data-id="' + item.id + '"' + (checked ? ' checked' : '') + '>' +
      (extraLabel ? '<span class="rutin-time">' + extraLabel + '</span>' : '') +
      '<span class="rutin-main">' +
        '<span class="rutin-name">' + item.ad + '</span>' +
        (item.not ? '<span class="rutin-note">' + item.not + '</span>' : '') +
      '</span>' +
      (item.tur ? '<span class="rutin-tag rutin-tag--' + item.tur + '">' + (RUTIN_TUR_ETIKET[item.tur] || item.tur) + '</span>' : '') +
      '</label>';
  }

  function rutinRenderGun() {
    const el = document.getElementById('rutinGunList');
    if (!el) return;
    el.innerHTML = RUTIN_GUN.map(item => rutinRowHTML(item, item.saat)).join('');
  }

  function rutinRenderBeslenme() {
    const el = document.getElementById('rutinBeslenmeList');
    if (!el) return;
    el.innerHTML = BESLENME.map(item => rutinRowHTML(item, null)).join('');
  }

  function rutinRenderSpor() {
    const el = document.getElementById('rutinSporList');
    if (!el) return;
    // JS'te getDay(): 0=Pazar. Programımız Pazartesi'den başlıyor.
    const jsDay = new Date().getDay();
    const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
    el.innerHTML = SPOR_HAFTA.map((s, i) => {
      const isToday = i === todayIdx;
      const checked = rutinIsChecked(s.id);
      return '<label class="rutin-row rutin-row--spor' + (checked ? ' checked' : '') + (isToday ? ' today' : '') + '">' +
        '<input type="checkbox" class="rutin-checkbox" data-id="' + s.id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="rutin-time">' + s.gun + '</span>' +
        '<span class="rutin-main">' +
          '<span class="rutin-name">' + s.detay + '</span>' +
        '</span>' +
        '<span class="rutin-tag rutin-tag--spor">' + s.tur + '</span>' +
        '</label>';
    }).join('');
  }

  function rutinUpdateSummary() {
    const pct = rutinDayPct(_rutinState[rutinTodayKey()]);
    const streak = rutinComputeStreak();

    const fillEl = document.getElementById('rutinFill');
    const pctEl = document.getElementById('rutinPct');
    const subEl = document.getElementById('rutinSub');
    const streakEl = document.getElementById('rutinStreak');

    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.className = 'hero-progress-fill ' + (pct >= 70 ? 'lvl-safe' : pct >= 40 ? 'lvl-watch' : 'lvl-critical');
    }
    if (pctEl) pctEl.textContent = '%' + pct;
    if (subEl) {
      const ids = RUTIN_GUN.length + BESLENME.length;
      const day = _rutinState[rutinTodayKey()] || {};
      let done = 0;
      RUTIN_GUN.concat(BESLENME).forEach(x => { if (day[x.id]) done++; });
      subEl.textContent = done + ' / ' + ids + ' madde · gün %' + RUTIN_STREAK_ESIK + ' dolunca seriye sayılıyor';
    }
    if (streakEl) {
      streakEl.innerHTML = streak > 0
        ? '🔥 <b>' + streak + '</b> günlük seri'
        : 'Seri henüz başlamadı — bugünü %' + RUTIN_STREAK_ESIK + ' doldur, sayaç çalışsın.';
    }
  }

  function rutinRenderAll() {
    rutinRenderGun();
    rutinRenderSpor();
    rutinRenderBeslenme();
    rutinUpdateSummary();
  }

  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('rutin-checkbox')) return;
    const id = e.target.dataset.id;
    rutinSetChecked(id, e.target.checked);
    e.target.closest('.rutin-row')?.classList.toggle('checked', e.target.checked);
    rutinUpdateSummary();

    if (e.target.checked && typeof motivationLogEvent === 'function') {
      const name = e.target.closest('.rutin-row')?.querySelector('.rutin-name')?.textContent?.trim();
      motivationLogEvent('⏱️ Rutin tamamlandı' + (name ? ': ' + name : '.'));
      if (typeof motivationCheckBadges === 'function') motivationCheckBadges();
    }
  });

  rutinRenderAll();
