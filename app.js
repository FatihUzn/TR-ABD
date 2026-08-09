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

  // --- Çok Sayfalı Site Nav: aktif sayfayı işaretle ---
  // Her sayfanın <body> etiketinde data-page="sistem|yks|finans|evrak|blog" olmalı.
  (function highlightActiveNavLink() {
    const current = document.body.dataset.page;
    if (!current) return;
    document.querySelectorAll('.site-nav [data-page-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.pageLink === current);
    });
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
    
    const fillEl = document.getElementById('progressFill');
    if(fillEl) {
        fillEl.style.width = opRemainingPct + '%';
        document.getElementById('progressPct').textContent = '%' + Math.round(opRemainingPct);
        fillEl.className = 'hero-progress-fill ' + (opRemainingPct >= 50 ? 'lvl-safe' : opRemainingPct >= 20 ? 'lvl-watch' : 'lvl-critical');
    }

    // Nav rozeti: her sayfada üstte görünen kompakt "%X · FAZ 1" göstergesi
    const badgeEl = document.getElementById('navProgressBadge');
    if (badgeEl) {
      const faz = now < JOB_START ? 'FAZ 1' : (now < new Date('2027-10-01T00:00:00') ? 'FAZ 2' : 'FAZ 3');
      badgeEl.textContent = '%' + Math.round(opRemainingPct) + ' · ' + faz;
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
    body.innerHTML = PLAN_MILESTONES.map(p => {
      const d = new Date(p.tarih + 'T00:00:00');
      const tarihStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
      const kasaStr = p.kasa.toLocaleString('tr-TR') + ' €';
      return '<tr><td data-label="Tarih">' + tarihStr + '</td>' +
        '<td data-label="Kümülatif Kasa (€)" class="cash">' + kasaStr + '</td>' +
        '<td data-label="Plan Altın (gr)">' + fmtGram(p.planGram) + '</td></tr>';
    }).join('');
  }
  renderKasaLogTable();

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

  const YKS_STORAGE_KEY = 'yksChecklistState';

  function yksLoadState() {
    try {
      const raw = localStorage.getItem(YKS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('YKS state okunamadı:', e);
      return {};
    }
  }

  function yksSaveState(state) {
    try {
      localStorage.setItem(YKS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('YKS state kaydedilemedi:', e);
    }
  }

  let _yksState = yksLoadState();

  // Bir konunun leaf checkbox id'lerini döndürür (altKonular varsa hepsi, yoksa kendisi)
  function yksLeafIds(konu) {
    if (konu.altKonular && konu.altKonular.length) {
      return konu.altKonular.map((_, i) => konu.id + '__' + i);
    }
    return [konu.id];
  }

  function yksTopicRowHTML(id, ad, extraClass) {
    const checked = !!_yksState[id];
    return '<label class="yks-topic-row' + (checked ? ' checked' : '') + (extraClass ? ' ' + extraClass : '') + '">' +
      '<input type="checkbox" class="yks-checkbox" data-id="' + id + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="yks-topic-name">' + ad + '</span>' +
      '</label>';
  }

  function yksKonuHTML(konu) {
    if (konu.altKonular && konu.altKonular.length) {
      const subRows = konu.altKonular.map((ad, i) => yksTopicRowHTML(konu.id + '__' + i, ad)).join('');
      return '<div class="yks-topic-group">' +
        '<div class="yks-topic-row" style="cursor:default; color:var(--text);"><span class="yks-topic-name"><b>' + konu.ad + '</b></span></div>' +
        '<div class="yks-subtopics">' + subRows + '</div>' +
        '</div>';
    }
    return yksTopicRowHTML(konu.id, konu.ad);
  }

  function yksDersProgress(ders) {
    let done = 0, total = 0;
    ders.konular.forEach(konu => {
      yksLeafIds(konu).forEach(id => {
        total++;
        if (_yksState[id]) done++;
      });
    });
    return { done, total };
  }

  function yksDersHTML(ders) {
    const { done, total } = yksDersProgress(ders);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const topicsHTML = ders.konular.map(yksKonuHTML).join('');
    return '<details class="acc-section yks-subject" data-ders-id="' + ders.id + '">' +
      '<summary class="sec-label acc-summary"><span>' + ders.ad + '</span>' +
      '<span class="yks-subject-count" data-count-for="' + ders.id + '">' + done + '/' + total + '</span>' +
      '<span class="acc-chevron">▾</span></summary>' +
      '<div class="acc-body">' +
      '<div class="hero-progress-track yks-mini-track"><div class="hero-progress-fill yks-mini-fill" data-fill-for="' + ders.id + '" style="width:' + pct + '%;"></div></div>' +
      '<div class="yks-topic-list">' + topicsHTML + '</div>' +
      '</div></details>';
  }

  function yksOverallProgress(dersListe) {
    let done = 0, total = 0;
    dersListe.forEach(ders => {
      const p = yksDersProgress(ders);
      done += p.done; total += p.total;
    });
    return { done, total };
  }

  function yksUpdateOverallBar(prefix, dersListe) {
    const { done, total } = yksOverallProgress(dersListe);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const fillEl = document.getElementById('yks' + prefix + 'Fill');
    const pctEl = document.getElementById('yks' + prefix + 'Pct');
    const subEl = document.getElementById('yks' + prefix + 'Sub');
    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.className = 'hero-progress-fill ' + (pct >= 66 ? 'lvl-safe' : pct >= 33 ? 'lvl-watch' : 'lvl-critical');
    }
    if (pctEl) pctEl.textContent = '%' + pct;
    if (subEl) subEl.textContent = done + ' / ' + total + ' konu';
  }

  function yksRenderSection(containerId, dersListe, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!dersListe.length) {
      container.innerHTML = '<p style="color:var(--text-faint); font-size:13px;">Konu listesi yakında eklenecek.</p>';
    } else {
      container.innerHTML = dersListe.map(yksDersHTML).join('');
    }
    yksUpdateOverallBar(prefix, dersListe);
  }

  function yksRenderAll() {
    yksRenderSection('yksTytContainer', YKS_DATA.TYT, 'Tyt');
    yksRenderSection('yksAytContainer', YKS_DATA.AYT, 'Ayt');
  }

  // Checkbox tıklamalarını event delegation ile yakala (yeniden render sonrası da çalışsın)
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('yks-checkbox')) return;
    const id = e.target.dataset.id;
    _yksState[id] = e.target.checked;
    yksSaveState(_yksState);
    e.target.closest('.yks-topic-row')?.classList.toggle('checked', e.target.checked);
    // İlgili dersin mini bar + sayaç + genel bar'ları güncelle
    const dersEl = e.target.closest('details.yks-subject');
    if (dersEl) {
      const dersId = dersEl.dataset.dersId;
      const allDersler = YKS_DATA.TYT.concat(YKS_DATA.AYT);
      const ders = allDersler.find(d => d.id === dersId);
      if (ders) {
        const { done, total } = yksDersProgress(ders);
        const pct = total ? Math.round((done / total) * 100) : 0;
        const fillEl = dersEl.querySelector('[data-fill-for="' + dersId + '"]');
        const countEl = dersEl.querySelector('[data-count-for="' + dersId + '"]');
        if (fillEl) fillEl.style.width = pct + '%';
        if (countEl) countEl.textContent = done + '/' + total;
      }
      const isTyt = YKS_DATA.TYT.includes(ders);
      yksUpdateOverallBar(isTyt ? 'Tyt' : 'Ayt', isTyt ? YKS_DATA.TYT : YKS_DATA.AYT);
    }
  });

  yksRenderAll();

  // ============================================================
  // EVRAK SAYFASI — Almanya/Türkiye evrak checklist + form bilgileri
  // TASLAK LİSTE: bu maddeler tahmini olarak kondu, sen düzelteceksin.
  // Sadece evrak.html'de gerekli container'lar bulunur; diğer sayfalarda
  // fonksiyonlar sessizce hiçbir şey yapmadan çıkar.
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

  const EVRAK_CHECK_KEY = 'evrakChecklistState';
  const EVRAK_FORM_KEY = 'evrakFormState';

  function evrakLoadState(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Evrak state okunamadı:', e);
      return {};
    }
  }

  function evrakSaveState(key, state) {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('Evrak state kaydedilemedi:', e);
    }
  }

  let _evrakCheckState = evrakLoadState(EVRAK_CHECK_KEY);
  let _evrakFormState = evrakLoadState(EVRAK_FORM_KEY);

  function evrakItemRowHTML(item) {
    const checked = !!_evrakCheckState[item.id];
    return '<label class="yks-topic-row' + (checked ? ' checked' : '') + '">' +
      '<input type="checkbox" class="evrak-checkbox" data-id="' + item.id + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="yks-topic-name">' + item.ad + '</span>' +
      '</label>';
  }

  function evrakCepheProgress(cephe) {
    let done = 0;
    const total = cephe.kalemler.length;
    cephe.kalemler.forEach(k => { if (_evrakCheckState[k.id]) done++; });
    return { done, total };
  }

  function evrakUpdateCepheCount(cephe) {
    const { done, total } = evrakCepheProgress(cephe);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const countEl = document.querySelector('[data-evrak-count-for="' + cephe.id + '"]');
    const fillEl = document.querySelector('[data-evrak-fill-for="' + cephe.id + '"]');
    if (countEl) countEl.textContent = done + '/' + total;
    if (fillEl) fillEl.style.width = pct + '%';
  }

  function evrakRenderCephe(cephe) {
    const container = document.getElementById('evrakList-' + cephe.id);
    if (!container) return;
    container.innerHTML = cephe.kalemler.map(evrakItemRowHTML).join('');
    evrakUpdateCepheCount(cephe);
  }

  function evrakOverallProgress() {
    let done = 0, total = 0;
    Object.values(EVRAK_CHECKLIST).forEach(c => {
      const p = evrakCepheProgress(c);
      done += p.done; total += p.total;
    });
    return { done, total };
  }

  function evrakUpdateOverallBar() {
    const { done, total } = evrakOverallProgress();
    const pct = total ? Math.round((done / total) * 100) : 0;
    const fillEl = document.getElementById('evrakOverallFill');
    const pctEl = document.getElementById('evrakOverallPct');
    const subEl = document.getElementById('evrakOverallSub');
    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.className = 'hero-progress-fill ' + (pct >= 66 ? 'lvl-safe' : pct >= 33 ? 'lvl-watch' : 'lvl-critical');
    }
    if (pctEl) pctEl.textContent = '%' + pct;
    if (subEl) subEl.textContent = done + ' / ' + total + ' evrak tamam';
  }

  function evrakRenderAll() {
    if (!document.getElementById('evrakList-turkiye') && !document.getElementById('evrakList-almanya')) return;
    Object.values(EVRAK_CHECKLIST).forEach(evrakRenderCephe);
    evrakUpdateOverallBar();
  }

  // Checkbox tıklamalarını event delegation ile yakala
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('evrak-checkbox')) return;
    const id = e.target.dataset.id;
    _evrakCheckState[id] = e.target.checked;
    evrakSaveState(EVRAK_CHECK_KEY, _evrakCheckState);
    e.target.closest('.yks-topic-row')?.classList.toggle('checked', e.target.checked);
    const cephe = Object.values(EVRAK_CHECKLIST).find(c => c.kalemler.some(k => k.id === id));
    if (cephe) {
      evrakUpdateCepheCount(cephe);
      evrakUpdateOverallBar();
    }
  });

  // --- Form bilgileri (kimlik / pasaport / işveren) — yazdıkça otomatik kaydeder ---
  function evrakRestoreForm() {
    document.querySelectorAll('.evrak-form-input').forEach(input => {
      const key = input.dataset.field;
      if (key && _evrakFormState[key] !== undefined) input.value = _evrakFormState[key];
    });
  }

  document.addEventListener('input', function (e) {
    if (!e.target.classList || !e.target.classList.contains('evrak-form-input')) return;
    const key = e.target.dataset.field;
    if (!key) return;
    _evrakFormState[key] = e.target.value;
    evrakSaveState(EVRAK_FORM_KEY, _evrakFormState);
  });

  evrakRenderAll();
  evrakRestoreForm();

  // ============================================================
  // BLOG SAYFASI — foto-öncelikli kart grid + tek yazı detay şablonu
  // Sadece blog.html'de gerekli container'lar bulunur; diğer sayfalarda
  // fonksiyonlar sessizce hiçbir şey yapmadan çıkar (evrak/YKS mantığıyla aynı desen).
  // YENİ YAZI EKLEMEK İÇİN: aşağıdaki BLOG_POSTS dizisine "taslak" objesinin
  // üstüne yeni bir obje ekle (slug, date, dateLabel, title, excerpt, image, paragraphs),
  // görsel için Studio/ klasöründeki bir dosya adını kullan.
  // ============================================================
  const BLOG_POSTS = [
    {
      slug: 'kabul-haberi',
      draft: false,
      date: '2026-08-09',
      dateLabel: '09 Ağustos 2026',
      title: 'Kabul Geldi',
      excerpt: "Limburgerhof'taki fırın pozisyonundan resmi onay bugün geldi — operasyonun sıfır günü artık takvimde sabit bir tarih.",
      image: 'Studio/harvard1.jpg',
      paragraphs: [
        "Bugün beklenen e-posta geldi: Limburgerhof'taki pozisyon resmi olarak onaylandı. Aylardır kağıt üzerinde duran '01.10.2026' tarihi artık gerçek bir başlangıç günü oldu.",
        "İlk tepkim rahatlama oldu, ikincisi biraz panik — çünkü artık her şey geri sayıma bağlandı: VHS kursuna kayıt, dil sertifikaları, evrak cephesi, hepsi bu tarihe göre hizalanacak.",
        "Bu paneli tam da bunun için kurdum: tek bir yerden ritmi, bütçeyi ve evrakı takip edebilmek için. Bugünden itibaren buraya arada bir not düşeceğim — hem ilerlemeyi görmek hem de ileride geriye bakıp neyin işe yaradığını hatırlamak için.",
        "Şimdilik plan net: Ekim'de vardiya ve VHS dil kursu başlıyor, hedef bir yıl içinde C1'i tamamlayıp §16b üzerinden TU Berlin'e geçiş yapmak. Bir sonraki yazı muhtemelen ilk hafta izlenimleri olacak."
      ]
    },
    {
      slug: 'taslak-yazi',
      draft: true,
      date: '',
      dateLabel: 'TASLAK',
      title: 'Yeni yazı — başlığı burada değiştireceksin',
      excerpt: "Bu bir boş şablon kartı. app.js içindeki BLOG_POSTS dizisine yeni bir obje ekleyip alanları doldurunca burada gerçek bir yazı olarak görünür.",
      image: null,
      paragraphs: [
        'Buraya yazının tam metnini yaz. Dizideki her satır ayrı bir paragraf olarak render edilir.'
      ]
    }
  ];

  function blogCardHTML(post) {
    if (post.draft) {
      return '<div class="blog-card blog-card-draft" data-slug="' + post.slug + '">' +
        '<div class="blog-card-img">+ YENİ YAZI EKLE</div>' +
        '<div class="blog-card-body">' +
          '<div class="blog-card-title">' + post.title + '</div>' +
          '<div class="blog-card-excerpt">' + post.excerpt + '</div>' +
        '</div></div>';
    }
    return '<div class="blog-card" data-slug="' + post.slug + '">' +
      '<div class="blog-card-img" style="background-image:url(\'' + post.image + '\')">' +
        '<span class="blog-card-date">' + post.dateLabel + '</span>' +
      '</div>' +
      '<div class="blog-card-body">' +
        '<div class="blog-card-title">' + post.title + '</div>' +
        '<div class="blog-card-excerpt">' + post.excerpt + '</div>' +
      '</div></div>';
  }

  function blogRenderGrid() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    grid.innerHTML = BLOG_POSTS.map(blogCardHTML).join('');
  }

  function blogRenderDetail(post) {
    const wrap = document.getElementById('blogDetailContent');
    if (!wrap || !post) return;
    const hero = post.image ? '<div class="blog-detail-hero" style="background-image:url(\'' + post.image + '\')"></div>' : '';
    wrap.innerHTML = hero +
      '<div class="blog-detail-body">' +
        (post.dateLabel ? '<div class="blog-detail-date">' + post.dateLabel + '</div>' : '') +
        '<div class="blog-detail-title">' + post.title + '</div>' +
        '<div class="blog-detail-text">' + post.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
      '</div>';
  }

  function blogOpenPost(slug) {
    const post = BLOG_POSTS.find(function (p) { return p.slug === slug && !p.draft; });
    if (!post) return;
    blogRenderDetail(post);
    const listSection = document.getElementById('blogListSection');
    const detailSection = document.getElementById('blogDetailSection');
    if (listSection) listSection.style.display = 'none';
    if (detailSection) detailSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function blogShowGrid() {
    const listSection = document.getElementById('blogListSection');
    const detailSection = document.getElementById('blogDetailSection');
    if (listSection) listSection.style.display = 'block';
    if (detailSection) detailSection.style.display = 'none';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  function blogRenderAll() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return; // sadece blog.html'de çalışır

    blogRenderGrid();

    const backBtn = document.getElementById('blogBackBtn');
    if (backBtn) backBtn.addEventListener('click', blogShowGrid);

    grid.addEventListener('click', function (e) {
      const card = e.target.closest('.blog-card');
      if (!card || card.classList.contains('blog-card-draft')) return;
      const slug = card.dataset.slug;
      history.replaceState(null, '', '#' + slug);
      blogOpenPost(slug);
    });

    // Doğrudan #slug ile paylaşılan bir link varsa yazıyı direkt aç
    if (location.hash) {
      const slug = location.hash.slice(1);
      if (BLOG_POSTS.some(function (p) { return p.slug === slug && !p.draft; })) blogOpenPost(slug);
    }
  }

  blogRenderAll();
