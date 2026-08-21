// ============================================================
// finans.js — Nakit & Altın Rotası: plan vs bugünün kuruyla altın
// grafiği, ay ay kasa kaydı tablosu, canlı kur çekme ve kasa hesabı.
// Sadece finans.html'de yüklenir. core.js'in ÖNCE yüklenmiş olması gerekir.
// ============================================================

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

  // --- Milestone durumları: bugüne göre "geçti / şu an / planlanan" ---
  // Roadmap node'larındaki done/now mantığıyla aynı: PLAN_MILESTONES tarihini
  // bugünle kıyaslar, ilk geçmemiş tarihi "şu an" olarak işaretler.
  function computeMilestoneStatuses() {
    const now = new Date();
    let determined = false;
    const statuses = PLAN_MILESTONES.map(p => {
      const d = new Date(p.tarih + 'T23:59:59');
      if (now > d) return 'past';
      if (!determined) { determined = true; return 'now'; }
      return 'future';
    });
    if (!determined && statuses.length) statuses[statuses.length - 1] = 'now';
    return statuses;
  }

  const STATUS_LABEL = { past: 'Geçti', now: 'Şu An', future: 'Planlanan' };

  // --- Plana göre bugünkü kasa hedefi (Hedef Özeti altındaki ilerleme çubuğu) ---
  function renderKasaProgress() {
    const fillEl = document.getElementById('kasaProgressFill');
    const pctEl = document.getElementById('kasaProgressPct');
    const labelEl = document.getElementById('kasaProgressLabel');
    if (!fillEl || !pctEl || !labelEl) return;

    const statuses = computeMilestoneStatuses();
    let idx = statuses.indexOf('now');
    if (idx === -1) idx = statuses.length - 1;
    const current = PLAN_MILESTONES[idx];
    const target = PLAN_MILESTONES[PLAN_MILESTONES.length - 1].kasa;
    const pct = Math.max(0, Math.min(100, Math.round((current.kasa / target) * 100)));

    fillEl.style.width = pct + '%';
    pctEl.textContent = '%' + pct;
    labelEl.textContent = current.kasa.toLocaleString('tr-TR') + ' € / ' + target.toLocaleString('tr-TR') + ' €';
  }

  function fmtGram(n) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' gr';
  }

  // Chart.js tek bir CDN'den geliyor. Yüklenemediğinde grafik alanı
  // sessizce boş kalıyordu — artık sebebi yazıyor.
  function goldChartFallback(msg) {
    const box = document.getElementById('goldChartFallback');
    const canvas = document.getElementById('goldChart');
    if (!box) return;
    box.textContent = msg;
    box.style.display = 'flex';
    if (canvas) canvas.style.display = 'none';
  }

  function renderGoldChart() {
    const canvas = document.getElementById('goldChart');
    if (!canvas) return;
    if (!window.Chart) {
      goldChartFallback('Grafik kütüphanesi (Chart.js) yüklenemedi — internet bağlantısını kontrol et. Aşağıdaki tablodaki veriler etkilenmedi.');
      return;
    }

    const planPoints = PLAN_MILESTONES.map(p => ({ x: new Date(p.tarih + 'T00:00:00').getTime(), y: p.planGram }));
    const todayPoints = _liveRates.goldEUR
      ? PLAN_MILESTONES.map(p => ({ x: new Date(p.tarih + 'T00:00:00').getTime(), y: Number((p.kasa / _liveRates.goldEUR).toFixed(2)) }))
      : [];

    const datasets = [
      {
        label: 'Plan (sabit 114,08 €/gr)',
        data: planPoints,
        borderColor: '#4aa8dc', /* Buski mavi tonu — plan çizgisi */
        backgroundColor: 'rgba(74, 168, 220, 0.1)',
        borderDash: [5, 4],
        pointRadius: 2,
        borderWidth: 2,
        tension: 0.25,
        fill: false
      },
      {
        label: 'Bugünün Kuruyla (canlı)',
        data: todayPoints,
        borderColor: '#1e88c7', /* Buski'nin ana mavi tonu */
        backgroundColor: 'rgba(30, 136, 199, 0.14)',
        pointRadius: 3,
        pointBackgroundColor: '#1e88c7',
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
                color: '#475569', /* açık temada koyu gri metin */
                font: { family: 'JetBrains Mono', size: 10 },
                callback: v => new Date(v).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
              },
              grid: { color: '#e2e8f0' } /* açık gri kılavuz çizgileri */
            },
            y: {
              ticks: {
                color: '#475569', /* açık temada koyu gri metin */
                font: { family: 'JetBrains Mono', size: 10 },
                callback: v => v + ' gr'
              },
              grid: { color: '#e2e8f0' } /* açık gri kılavuz çizgileri */
            }
          },
          plugins: {
            legend: { labels: { color: '#0f172a', font: { family: 'Inter', size: 11 }, boxWidth: 14 } }, /* koyu başlık metni */
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

  // --- Ay Ay Kasa Kaydı tablosu (finans.html) — PLAN_MILESTONES verisinden üretilir ---
  function renderKasaLogTable() {
    const body = document.getElementById('kasaLogBody');
    if (!body) return;
    const statuses = computeMilestoneStatuses();
    body.innerHTML = PLAN_MILESTONES.map((p, i) => {
      const d = new Date(p.tarih + 'T00:00:00');
      const tarihStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
      const kasaStr = p.kasa.toLocaleString('tr-TR') + ' €';
      const st = statuses[i];
      return '<tr><td data-label="Tarih">' + tarihStr + '</td>' +
        '<td data-label="Kümülatif Kasa (€)" class="cash">' + kasaStr + '</td>' +
        '<td data-label="Plan Altın (gr)">' + fmtGram(p.planGram) + '</td>' +
        '<td data-label="Durum"><span class="fin-status ' + st + '">' + STATUS_LABEL[st] + '</span></td></tr>';
    }).join('');
  }
  renderKasaLogTable();
  renderKasaProgress();

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
