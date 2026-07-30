  // --- Supabase Bağlantısı (Bulut Hafıza) ---
  // NOT: URL ve KEY girilene kadar bağlantı kurulmaz — ama sayfanın geri kalanı
  // (saat, canlı kur widget'ı, YKS hesaplayıcı arayüzü vb.) yine de çalışmaya devam eder.
  const SUPABASE_URL = 'https://eznrszomudtzgfusvghh.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_rk4vlzDfCOgzlUbRqyU47g_BEGi9Sa8';

  let _supabase = null;
  const SUPABASE_READY = SUPABASE_URL.indexOf('BURAYA_') === -1 && SUPABASE_KEY.indexOf('BURAYA_') === -1;
  if (SUPABASE_READY) {
    try {
      _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
      console.warn('Supabase bağlantısı kurulamadı:', e);
      _supabase = null;
    }
  }
  const SUPABASE_WARN = '<div class="cp-empty">Bulut bağlantısı henüz kurulmadı (Faz 5 tamamlanmadı). app.js içine Supabase URL/KEY eklenince burası aktifleşecek.</div>';

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
  }

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
    
    const fillEl = document.getElementById('progressFill');
    if(fillEl) {
        fillEl.style.width = opRemainingPct + '%';
        document.getElementById('progressPct').textContent = '%' + Math.round(opRemainingPct);
        fillEl.className = 'hero-progress-fill ' + (opRemainingPct >= 50 ? 'lvl-safe' : opRemainingPct >= 20 ? 'lvl-watch' : 'lvl-critical');
    }

    // 2. YKS TikTak Saat & Bar (Azalan)
    const yksDiff = YKS_EXAM_DAY - now;
    if (yksDiff > 0) {
      const d = Math.floor(yksDiff / (1000 * 60 * 60 * 24));
      const h = Math.floor((yksDiff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((yksDiff / 1000 / 60) % 60);
      const s = Math.floor((yksDiff / 1000) % 60);
      
      document.getElementById('tDays').textContent = d.toString().padStart(2, '0');
      document.getElementById('tHours').textContent = h.toString().padStart(2, '0');
      document.getElementById('tMins').textContent = m.toString().padStart(2, '0');
      document.getElementById('tSecs').textContent = s.toString().padStart(2, '0');

      const yksTotal = YKS_EXAM_DAY - YKS_COUNT_START;
      const yksElapsed = now - YKS_COUNT_START;
      let yksRemainingPct = 100 - ((yksElapsed / yksTotal) * 100);
      yksRemainingPct = Math.max(0, Math.min(100, yksRemainingPct));
      
      const yFill = document.getElementById('yksFill');
      if(yFill) {
          yFill.style.width = yksRemainingPct + '%';
          document.getElementById('yksPct').textContent = '%' + Math.round(yksRemainingPct);
          yFill.className = 'hero-progress-fill ' + (yksRemainingPct >= 50 ? 'lvl-safe' : yksRemainingPct >= 20 ? 'lvl-watch' : 'lvl-critical');
      }
    }
  }
  setInterval(updateClocks, 1000);
  updateClocks();

  // --- SUPABASE ÇOKLU CİHAZ SENKRONİZASYONLU CHECKPOINT ---
  function checkDailyAlert(list) {
    const now = new Date();
    const todayStr = now.toDateString();
    const hasLogToday = list.some(cp => new Date(Number(cp.ts)).toDateString() === todayStr);
    const alertBox = document.getElementById('dailyAlert');
    if (alertBox) {
      if (!hasLogToday) {
        alertBox.classList.add('active');
      } else {
        alertBox.classList.remove('active');
      }
    }
  }

  function calculateGamification(list) {
    const totalXP = list.length * 15;
    const level = Math.floor(totalXP / 100) + 1;
    const currentXP = totalXP % 100;
    
    document.getElementById('levelCount').textContent = level;
    document.getElementById('xpCount').textContent = currentXP;
    document.getElementById('xpFill').style.width = currentXP + '%';

    let streak = 0;
    if (list.length > 0) {
      const dates = [...new Set(list.map(cp => new Date(Number(cp.ts)).toDateString()))].sort((a,b) => new Date(b) - new Date(a));
      const today = new Date();
      today.setHours(0,0,0,0);
      let expectedDate = new Date(today);
      
      const lastLogDate = new Date(dates[0]);
      const diffDays = Math.floor((today - lastLogDate) / 86400000);
      
      if (diffDays <= 1) {
        for (let i = 0; i < dates.length; i++) {
          if (new Date(dates[i]).getTime() === expectedDate.getTime() || (i===0 && diffDays===1)) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else { break; }
        }
      }
    }
    document.getElementById('streakCount').textContent = streak;
    const fire = document.getElementById('streakIcon');
    if(fire) {
      fire.style.filter = streak > 2 ? 'drop-shadow(0 0 12px red)' : 'drop-shadow(0 0 4px rgba(168,99,26,0.6))';
      fire.style.opacity = streak === 0 ? '0.3' : '1';
    }
  }

  async function renderCheckpoints() {
    const el = document.getElementById('cpList');
    if(!el) return;
    if (!_supabase) { el.innerHTML = SUPABASE_WARN; return; }

    // Supabase'den verileri çek
    const { data: list, error } = await _supabase
      .from('checkpoints')
      .select('*')
      .order('ts', { ascending: false });

    if (error) {
      el.innerHTML = '<div class="cp-empty">Bağlantı hatası: Veriler yüklenemedi. API ayarlarını kontrol et.</div>';
      return;
    }

    checkDailyAlert(list);
    calculateGamification(list);

    if (!list || !list.length) {
      el.innerHTML = '<div class="cp-empty">Komuta merkezinde henüz rapor yok. İlk raporunu ilet.</div>';
      return;
    }

    el.innerHTML = list.slice(0, 10).map(cp => {
      const d = new Date(Number(cp.ts));
      const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
      return '<div class="cp-item">' +
        '<span class="cp-tag">' + escapeHtml(cp.tag) + '</span>' +
        '<div class="cp-body"><div class="cp-date">' + dateStr + '</div>' +
        '<div class="cp-note">' + escapeHtml(cp.note) + '</div></div>' +
        batteryBadge(cp.battery) +
        '<button class="cp-del" onclick="deleteCheckpoint(\'' + cp.id + '\')">✕</button>' +
        '</div>';
    }).join('');
  }

  function batteryBadge(val) {
    if (val === null || val === undefined || val === '') return '';
    const n = Number(val);
    let cls = 'bat-mid', label = '🔋 %' + n;
    if (n >= 75) { cls = 'bat-high'; label = '🔋 %' + n; }
    else if (n <= 25 && n > 0) { cls = 'bat-low'; label = '🪫 %' + n; }
    else if (n === 0) { cls = 'bat-low'; label = '🪫 Tükendim'; }
    return '<span class="cp-battery ' + cls + '">' + label + '</span>';
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  async function addCheckpoint() {
    const noteEl = document.getElementById('cpNote');
    const tagEl = document.getElementById('cpTag');
    const batteryEl = document.getElementById('cpBattery');
    const note = noteEl.value.trim();
    if (!note) return;
    if (!_supabase) { alert('Bulut bağlantısı henüz kurulmadı — Faz 5 tamamlanmadan raporlar kaydedilemez.'); return; }

    const newCp = {
      tag: tagEl.value,
      note: note,
      battery: batteryEl ? Number(batteryEl.value) : null,
      ts: Date.now()
    };

    // Supabase'e gönder
    const { error } = await _supabase.from('checkpoints').insert([newCp]);
    if (error) {
      alert('Kayıt başarısız oldu: ' + error.message);
      return;
    }

    noteEl.value = '';
    renderCheckpoints();
  }

  async function deleteCheckpoint(id) {
    if (!_supabase) return;
    // Supabase'den sil
    const { error } = await _supabase.from('checkpoints').delete().eq('id', id);
    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }
    renderCheckpoints();
  }

  // --- ETİKETE GÖRE HAZIR NOT ÇİPLERİ ---
  const QUICK_NOTES = {
    'Dil':   ['VHS dersine gittim', 'Kelime/gramer tekrarı yaptım', 'Konuşma pratiği yaptım', 'Ders kaçırdım'],
    'YKS':   ['Deneme çözdüm', 'Konu tekrarı yaptım', 'Soru bankası çalıştım', 'Bugün çalışamadım'],
    'Kasa':  ['Maaş/gelir yattı', 'Harcama yaptım', 'Altına çevirdim', 'Bütçe kontrolü yaptım'],
    'İş':    ['Vardiyaya gittim', 'Mesai yaptım', 'İzin kullandım', 'İşte bir sorun yaşadım'],
    'Genel': ['Bugün iyi geçti', 'Yorgun/zor bir gündü', 'Motivasyon düştü', 'Planı gözden geçirdim']
  };

  function renderQuickNotes() {
    const tagEl = document.getElementById('cpTag');
    const container = document.getElementById('cpQuickNotes');
    const noteInput = document.getElementById('cpNote');
    if (!tagEl || !container || !noteInput) return;

    const options = QUICK_NOTES[tagEl.value] || [];
    container.innerHTML = options.map(opt =>
      '<button type="button" class="quick-chip" data-note="' + escapeHtml(opt) + '">' + escapeHtml(opt) + '</button>'
    ).join('') + '<button type="button" class="quick-chip quick-chip-custom" id="cpCustomToggle">✎ Diğer (yaz)</button>';

    container.querySelectorAll('.quick-chip[data-note]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.quick-chip').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        noteInput.value = btn.dataset.note;
        noteInput.classList.remove('visible');
      });
    });

    document.getElementById('cpCustomToggle')?.addEventListener('click', () => {
      container.querySelectorAll('.quick-chip').forEach(b => b.classList.remove('selected'));
      noteInput.classList.add('visible');
      noteInput.value = '';
      noteInput.focus();
    });

    noteInput.classList.remove('visible');
    noteInput.value = '';
  }

  document.getElementById('cpTag')?.addEventListener('change', renderQuickNotes);
  renderQuickNotes();

  document.getElementById('cpNote')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCheckpoint();
  });
  
  // Sayfa açıldığında verileri yükle
  renderCheckpoints();

  // --- PLAN vs BUGÜNÜN KURUYLA ALTIN GRAFİĞİ (tamamen otomatik, elle giriş yok) ---
  // Her ay için: o ana kadarki kümülatif kasa (€) + planda kullanılan sabit 114,08 €/gr
  // varsayımıyla hesaplanmış gram (Nakit & Altın Rotası / Ay Ay Kasa Kaydı ile aynı veri).
  // "Bugünün kuruyla" çizgisi bu kasa tutarlarının GÜNCEL canlı €/gr kuruna bölünmesiyle
  // otomatik hesaplanır — kur değiştikçe kendiliğinden güncellenir, hiçbir giriş gerekmez.
  const PLAN_MILESTONES = [
    { tarih: '2026-11-01', kasa: 1200,  planGram: 10.52 },
    { tarih: '2026-11-30', kasa: 910,   planGram: 7.98 },
    { tarih: '2026-12-01', kasa: 2910,  planGram: 25.51 },
    { tarih: '2026-12-31', kasa: 4620,  planGram: 40.50 },
    { tarih: '2027-01-31', kasa: 6330,  planGram: 55.49 },
    { tarih: '2027-02-28', kasa: 8040,  planGram: 70.48 },
    { tarih: '2027-03-31', kasa: 9750,  planGram: 85.47 },
    { tarih: '2027-04-30', kasa: 11460, planGram: 100.46 },
    { tarih: '2027-05-31', kasa: 13460, planGram: 117.99 },
    { tarih: '2027-06-30', kasa: 15460, planGram: 135.52 },
    { tarih: '2027-07-31', kasa: 17460, planGram: 153.05 },
    { tarih: '2027-08-31', kasa: 19460, planGram: 170.58 },
    { tarih: '2027-09-30', kasa: 21460, planGram: 188.11 }
  ];

  let _goldChartInstance = null;

  function fmtGram(n) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' gr';
  }

  function renderGoldChart() {
    const canvas = document.getElementById('goldChart');
    if (!canvas || !window.Chart) return;

    const planPoints = PLAN_MILESTONES.map(p => ({ x: new Date(p.tarih + 'T00:00:00').getTime(), y: p.planGram }));
    const todayPoints = _liveRates.goldEUR
      ? PLAN_MILESTONES.map(p => ({ x: new Date(p.tarih + 'T00:00:00').getTime(), y: Number((p.kasa / _liveRates.goldEUR).toFixed(2)) }))
      : [];

    const datasets = [
      {
        label: 'Plan (sabit 114,08 €/gr)',
        data: planPoints,
        borderColor: '#fde68a', /* Eski mor yerine açık altın */
        backgroundColor: 'rgba(253, 230, 138, 0.08)',
        borderDash: [5, 4],
        pointRadius: 2,
        borderWidth: 2,
        tension: 0.25,
        fill: false
      },
      {
        label: 'Bugünün Kuruyla (canlı)',
        data: todayPoints,
        borderColor: '#fbbf24', /* Eski mor yerine koyu altın/amber */
        backgroundColor: 'rgba(251, 191, 36, 0.12)',
        pointRadius: 3,
        pointBackgroundColor: '#fbbf24',
        borderWidth: 2.5,
        tension: 0.15,
        fill: false
      }
    ];

    if (_goldChartInstance) {
      _goldChartInstance.data.datasets = datasets;
      _goldChartInstance.update();
    } else {
      _goldChartInstance = new Chart(canvas, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'nearest', intersect: false },
          scales: {
            x: {
              type: 'linear',
              ticks: {
                color: '#6b6250',
                font: { family: 'JetBrains Mono', size: 10 },
                callback: v => new Date(v).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
              },
              grid: { color: '#d9d0b8' }
            },
            y: {
              ticks: {
                color: '#6b6250',
                font: { family: 'JetBrains Mono', size: 10 },
                callback: v => v + ' gr'
              },
              grid: { color: '#d9d0b8' }
            }
          },
          plugins: {
            legend: { labels: { color: '#221d14', font: { family: 'Inter', size: 11 }, boxWidth: 14 } },
            tooltip: {
              callbacks: {
                title: items => new Date(items[0].parsed.x).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
                label: c => c.dataset.label + ': ' + fmtGram(c.parsed.y)
              }
            }
          }
        }
      });
    }
  }

  renderGoldChart();

  // --- Roadmap Node Durumları ---
  document.querySelectorAll('.roadmap').forEach(roadmap => {
    const nodes = Array.from(roadmap.querySelectorAll('.node[data-date]'));
    let determined = false;
    const now = new Date();
    nodes.forEach(node => {
      const nodeDate = new Date(node.dataset.date + 'T23:59:59');
      node.classList.remove('done', 'now');
      if (now > nodeDate) {
        node.classList.add('done');
      } else if (!determined) {
        node.classList.add('now');
        determined = true;
      }
    });
    if (!determined && nodes.length) nodes[nodes.length - 1].classList.add('now');
  });

  // --- ANLIK KUR (key gerektirmez) ---
  // Orta kur: Frankfurter API (Avrupa Merkez Bankası verisi, CORS açık, key gerekmez)
  // Frankfurter engellenir/başarısız olursa yedek: open.er-api.com (o da key gerektirmez)
  // Altın: goldprice.org'un herkese açık, key gerektirmeyen veri akışı (resmi olmayan ama yaygın kullanılan bir kaynak)
  function fmtRate(n, decimals) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function setRateMid(code, mid, decimals) {
    const el = document.getElementById('rate-' + code + '-mid');
    if (!el) return;
    el.textContent = (mid === null || isNaN(mid)) ? '—' : fmtRate(mid, decimals);
  }

  async function fetchFxRates() {
    // 1. deneme: Frankfurter (ECB)
    try {
      const r = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,TRY,GBP,CHF,AUD');
      if (!r.ok) throw new Error('frankfurter http ' + r.status);
      const d = await r.json();
      if (!d.rates || !d.rates.TRY) throw new Error('frankfurter: TRY yok');
      const eurTry = d.rates.TRY;
      return {
        EURTRY: eurTry,
        USDTRY: eurTry / d.rates.USD,
        GBPTRY: eurTry / d.rates.GBP,
        CHFTRY: eurTry / d.rates.CHF,
        AUDTRY: eurTry / d.rates.AUD
      };
    } catch (e) {
      console.warn('Frankfurter başarısız, yedek kaynağa geçiliyor:', e);
    }
    // 2. deneme (yedek): open.er-api.com
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/EUR');
      if (!r.ok) throw new Error('open.er-api http ' + r.status);
      const d = await r.json();
      if (!d.rates || !d.rates.TRY) throw new Error('open.er-api: TRY yok');
      const eurTry = d.rates.TRY;
      return {
        EURTRY: eurTry,
        USDTRY: eurTry / d.rates.USD,
        GBPTRY: eurTry / d.rates.GBP,
        CHFTRY: eurTry / d.rates.CHF,
        AUDTRY: eurTry / d.rates.AUD
      };
    } catch (e) {
      console.warn('Yedek kur kaynağı da başarısız:', e);
      return null;
    }
  }

  async function loadLiveRates() {
    const updEl = document.getElementById('rateUpdatedAt');
    const errEl = document.getElementById('rateError');
    if (!document.getElementById('rate-USD-mid')) return; // bu bölüm sayfada yoksa çık

    const fx = await fetchFxRates();
    if (fx) {
      Object.assign(_liveRates, fx);
      setRateMid('USD', fx.USDTRY, 4);
      setRateMid('EUR', fx.EURTRY, 4);
      setRateMid('GBP', fx.GBPTRY, 4);
      setRateMid('CHF', fx.CHFTRY, 4);
      setRateMid('AUD', fx.AUDTRY, 4);
      if (errEl) errEl.style.display = 'none';
    } else {
      ['USD', 'EUR', 'GBP', 'CHF', 'AUD'].forEach(code => setRateMid(code, null));
      if (errEl) errEl.style.display = 'block';
    }

    try {
      const r2 = await fetch('https://data-asg.goldprice.org/dbXRates/TRY');
      if (!r2.ok) throw new Error('goldprice http ' + r2.status);
      const d2 = await r2.json();
      const ounceTry = d2.items[0].xauPrice; // TRY / ons
      _liveRates.goldTRY = ounceTry / 31.1035; // TRY / gram
      _liveRates.goldEUR = _liveRates.EURTRY ? _liveRates.goldTRY / _liveRates.EURTRY : null;
      setRateMid('XAU', _liveRates.goldTRY, 2);
    } catch (e) {
      console.warn('Altın kuru alınamadı:', e);
      setRateMid('XAU', null);
    }

    if (updEl) {
      updEl.textContent = '· güncellendi ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    computeKasaValue();
    renderGoldChart();
  }

  function computeKasaValue() {
    const input = document.getElementById('kasaEur');
    const resultEl = document.getElementById('kasaResult');
    if (!input || !resultEl) return;
    const eur = parseFloat(input.value);
    if (isNaN(eur) || eur <= 0) { resultEl.innerHTML = ''; return; }

    const parts = [];
    if (_liveRates.EURTRY) parts.push((eur * _liveRates.EURTRY).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺');
    if (_liveRates.EURTRY && _liveRates.USDTRY) parts.push('$' + (eur * _liveRates.EURTRY / _liveRates.USDTRY).toLocaleString('tr-TR', { maximumFractionDigits: 0 }));
    if (_liveRates.goldEUR) parts.push((eur / _liveRates.goldEUR).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' gr altın');

    resultEl.innerHTML = parts.length
      ? ('Kasanız ≈ <b>' + parts.join('</b> · <b>') + '</b>')
      : 'Kur verisi yüklenemedi, birazdan tekrar dene.';
  }

  document.getElementById('kasaEur')?.addEventListener('input', computeKasaValue);

  loadLiveRates();
  setInterval(loadLiveRates, 5 * 60 * 1000); // 5 dakikada bir tazele
