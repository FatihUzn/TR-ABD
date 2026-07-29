  // --- Supabase Bağlantısı (Bulut Hafıza) ---
  const SUPABASE_URL = 'BURAYA_SUPABASE_URL_GELECEK'; // Örn: https://xyzabc.supabase.co
  const SUPABASE_KEY = 'BURAYA_COK_UZUN_OLAN_ANON_KEY_GELECEK'; 
  
  const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    // Supabase'den sil
    const { error } = await _supabase.from('checkpoints').delete().eq('id', id);
    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }
    renderCheckpoints();
  }

  document.getElementById('cpNote')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCheckpoint();
  });
  
  // Sayfa açıldığında verileri yükle
  renderCheckpoints();

  // --- SUPABASE: YKS NET & PUAN TAKİBİ ---
  function num(id) {
    const v = parseFloat(document.getElementById(id).value);
    return isNaN(v) ? 0 : v;
  }
  function net(d, y) {
    const n = d - (y / 4);
    return n < 0 ? 0 : n;
  }

  // Yaklaşık YKS Sayısal (Y-SAY) katsayıları — resmi ÖSYM standart sapma hesaplamasının
  // yerini tutmaz, sadece deneme ilerlemesini kıyaslamak için tahmini bir modeldir.
  const YSAY_CONST = 133.28;
  const YSAY_COEF = { tr: 1.11, sb: 1.12, tm: 1.11, fb: 1.20, m: 3.19, f: 2.43, k: 3.07, b: 2.51 };

  function computeYksResult() {
    const trN = net(num('trD'), num('trY'));
    const sbN = net(num('sbD'), num('sbY'));
    const tmN = net(num('tmD'), num('tmY'));
    const fbN = net(num('fbD'), num('fbY'));
    const amN = net(num('amD'), num('amY'));
    const afN = net(num('afD'), num('afY'));
    const akN = net(num('akD'), num('akY'));
    const abN = net(num('abD'), num('abY'));

    const tytNet = trN + sbN + tmN + fbN;
    const aytNet = amN + afN + akN + abN;
    const toplamNet = tytNet + aytNet;

    let puan = YSAY_CONST
      + trN * YSAY_COEF.tr + sbN * YSAY_COEF.sb + tmN * YSAY_COEF.tm + fbN * YSAY_COEF.fb
      + amN * YSAY_COEF.m + afN * YSAY_COEF.f + akN * YSAY_COEF.k + abN * YSAY_COEF.b;

    const obp = num('dnObp');
    let obpKatki = 0;
    if (obp > 0) {
      obpKatki = (obp * 5) * 0.12;
      puan += obpKatki;
    }

    return {
      detay: { tr: [num('trD'), num('trY')], sb: [num('sbD'), num('sbY')], tm: [num('tmD'), num('tmY')], fb: [num('fbD'), num('fbY')],
                am: [num('amD'), num('amY')], af: [num('afD'), num('afY')], ak: [num('akD'), num('akY')], ab: [num('abD'), num('abY')],
                obp: obp || null },
      tytNet: Math.round(tytNet * 100) / 100,
      aytNet: Math.round(aytNet * 100) / 100,
      toplamNet: Math.round(toplamNet * 100) / 100,
      puan: Math.round(puan * 100) / 100
    };
  }

  async function calculateAndSaveYks() {
    const yayin = document.getElementById('dnYayin').value.trim() || 'İsimsiz Deneme';
    const tarih = document.getElementById('dnTarih').value || new Date().toISOString().slice(0,10);
    const r = computeYksResult();

    const liveEl = document.getElementById('netLiveResult');
    liveEl.innerHTML = 'TYT Net: <b>' + r.tytNet + '</b> · AYT Net: <b>' + r.aytNet + '</b> · Tahmini Puan: <b>' + r.puan + '</b>';

    const row = { yayin: yayin, tarih: tarih, tyt_net: r.tytNet, ayt_net: r.aytNet, toplam_net: r.toplamNet, puan: r.puan, detay: r.detay, ts: Date.now() };
    const { error } = await _supabase.from('yks_denemeler').insert([row]);
    if (error) {
      liveEl.innerHTML += '<br><span style="color:var(--red);">Kayıt başarısız: ' + error.message + '</span>';
      return;
    }

    document.getElementById('dnYayin').value = '';
    ['trD','trY','sbD','sbY','tmD','tmY','fbD','fbY','amD','amY','afD','afY','akD','akY','abD','abY'].forEach(id => document.getElementById(id).value = '');
    renderYksResults();
  }

  async function deleteYksResult(id) {
    const { error } = await _supabase.from('yks_denemeler').delete().eq('id', id);
    if (error) { alert('Silinemedi: ' + error.message); return; }
    renderYksResults();
  }

  async function renderYksResults() {
    const el = document.getElementById('yksResultList');
    if (!el) return;

    const { data: list, error } = await _supabase
      .from('yks_denemeler')
      .select('*')
      .order('ts', { ascending: true });

    if (error) {
      el.innerHTML = '<div class="yks-empty">Bağlantı hatası: Veriler yüklenemedi. yks_denemeler tablosunu ve API ayarlarını kontrol et.</div>';
      return;
    }

    if (!list || !list.length) {
      el.innerHTML = '<div class="yks-empty">Henüz kayıtlı deneme yok. İlk denemeni gir.</div>';
      return;
    }

    // ts ascending geldi (delta hesaplamak için); ekranda en yeni en üstte olacak şekilde ters çeviriyoruz
    const withDelta = list.map((d, i) => {
      const prev = i > 0 ? list[i - 1] : null;
      const delta = prev ? Math.round((d.puan - prev.puan) * 100) / 100 : null;
      return { d, delta };
    }).reverse();

    el.innerHTML = withDelta.map(({ d, delta }) => {
      const dateStr = d.tarih ? new Date(d.tarih + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      let deltaHtml = '';
      if (delta !== null) {
        const cls = delta > 0 ? 'up' : (delta < 0 ? 'down' : '');
        const sign = delta > 0 ? '▲ +' : (delta < 0 ? '▼ ' : '— ');
        deltaHtml = '<div class="yks-result-delta ' + cls + '">' + sign + delta + '</div>';
      }
      return '<div class="yks-result-item">' +
        '<div class="yks-result-main">' +
          '<div class="yks-result-yayin">' + escapeHtml(d.yayin) + '</div>' +
          '<div class="yks-result-meta">' + dateStr + ' · TYT ' + d.tyt_net + ' net · AYT ' + d.ayt_net + ' net · Toplam ' + d.toplam_net + ' net</div>' +
        '</div>' +
        '<div class="yks-result-score"><div class="yks-result-puan">' + d.puan + '</div>' + deltaHtml + '</div>' +
        '<button class="yks-del" onclick="deleteYksResult(\'' + d.id + '\')">✕</button>' +
        '</div>';
    }).join('');
  }

  renderYksResults();

  // --- FAZ 6: HEDEF vs GERÇEKLEŞEN ALTIN GRAFİĞİ ---
  // Taban senaryo hedef noktaları (Nakit & Altın Rotası / Ay Ay Kasa Kaydı ile aynı veri)
  const TARGET_GOLD = [
    { tarih: '2026-11-01', gram: 10.52 },
    { tarih: '2026-11-30', gram: 7.98 },
    { tarih: '2026-12-01', gram: 25.51 },
    { tarih: '2026-12-31', gram: 40.50 },
    { tarih: '2027-01-31', gram: 55.49 },
    { tarih: '2027-02-28', gram: 70.48 },
    { tarih: '2027-03-31', gram: 85.47 },
    { tarih: '2027-04-30', gram: 100.46 },
    { tarih: '2027-05-31', gram: 117.99 },
    { tarih: '2027-06-30', gram: 135.52 },
    { tarih: '2027-07-31', gram: 153.05 },
    { tarih: '2027-08-31', gram: 170.58 },
    { tarih: '2027-09-30', gram: 188.11 }
  ];

  let _goldChartInstance = null;

  function fmtGram(n) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' gr';
  }

  function closestTarget(dateObj) {
    return TARGET_GOLD.reduce((closest, t) => {
      const tDate = new Date(t.tarih + 'T00:00:00');
      if (!closest) return t;
      const closestDate = new Date(closest.tarih + 'T00:00:00');
      return Math.abs(tDate - dateObj) < Math.abs(closestDate - dateObj) ? t : closest;
    }, null);
  }

  async function renderGoldChart() {
    const listEl = document.getElementById('goldEntryList');
    const canvas = document.getElementById('goldChart');

    const { data: list, error } = await _supabase
      .from('gerceklesen_altin')
      .select('*')
      .order('tarih', { ascending: true });

    if (error) {
      if (listEl) listEl.innerHTML = '<div class="gold-empty">Bağlantı hatası: Veriler yüklenemedi. API ayarlarını kontrol et.</div>';
      return;
    }

    // --- Grafik ---
    if (canvas && window.Chart) {
      const targetPoints = TARGET_GOLD.map(t => ({ x: new Date(t.tarih + 'T00:00:00').getTime(), y: t.gram }));
      const actualPoints = (list || []).map(r => ({ x: new Date(r.tarih + 'T00:00:00').getTime(), y: Number(r.gram) }));

      const datasets = [
        {
          label: 'Hedef (Taban Senaryo)',
          data: targetPoints,
          borderColor: '#a996ea',
          backgroundColor: 'rgba(109,79,224,0.08)',
          borderDash: [5, 4],
          pointRadius: 2,
          borderWidth: 2,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Gerçekleşen',
          data: actualPoints,
          borderColor: '#147a55',
          backgroundColor: 'rgba(20,122,85,0.12)',
          pointRadius: 4,
          pointBackgroundColor: '#147a55',
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

    // --- Kayıt listesi ---
    if (!listEl) return;
    if (!list || !list.length) {
      listEl.innerHTML = '<div class="gold-empty">Henüz gerçekleşen kayıt yok. İlk kaydını ekle.</div>';
      return;
    }

    listEl.innerHTML = list.slice().reverse().map(r => {
      const d = new Date(r.tarih + 'T00:00:00');
      const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
      const target = closestTarget(d);
      let deltaHtml = '';
      if (target) {
        const diff = Number(r.gram) - target.gram;
        const cls = diff >= 0 ? 'up' : 'down';
        const sign = diff >= 0 ? '+' : '';
        deltaHtml = '<div class="gold-delta-badge ' + cls + '">' + sign + diff.toFixed(2) + ' gr (en yakın hedefe göre)</div>';
      }
      return '<div class="gold-entry-item">' +
        '<div class="gold-entry-main">' +
          '<div class="gold-entry-date">' + dateStr + '</div>' +
          '<div class="gold-entry-detail">' + Number(r.kasa).toLocaleString('tr-TR') + ' € · ' + Number(r.kur).toLocaleString('tr-TR') + ' €/gr</div>' +
          deltaHtml +
        '</div>' +
        '<div class="gold-entry-gram">' + fmtGram(Number(r.gram)) + '</div>' +
        '<button class="gold-del" onclick="deleteRealizedGold(\'' + r.id + '\')">✕</button>' +
        '</div>';
    }).join('');
  }

  async function addRealizedGold() {
    const tarihEl = document.getElementById('gdTarih');
    const kasaEl = document.getElementById('gdKasa');
    const kurEl = document.getElementById('gdKur');
    const resultEl = document.getElementById('goldLiveResult');

    const tarih = tarihEl.value;
    const kasa = parseFloat(kasaEl.value);
    const kur = parseFloat(kurEl.value);

    if (!tarih || isNaN(kasa) || isNaN(kur) || kur <= 0) {
      if (resultEl) resultEl.textContent = 'Lütfen tarih, kasa ve kur alanlarını doğru gir.';
      return;
    }

    const gram = Number((kasa / kur).toFixed(2));

    const { error } = await _supabase.from('gerceklesen_altin').insert([{
      tarih: tarih,
      kasa: kasa,
      kur: kur,
      gram: gram
    }]);

    if (error) {
      if (resultEl) resultEl.textContent = 'Kayıt başarısız: ' + error.message;
      return;
    }

    if (resultEl) resultEl.innerHTML = 'Kaydedildi: <b>' + fmtGram(gram) + '</b>';
    kasaEl.value = '';
    kurEl.value = '';
    renderGoldChart();
  }

  async function deleteRealizedGold(id) {
    const { error } = await _supabase.from('gerceklesen_altin').delete().eq('id', id);
    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }
    renderGoldChart();
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
