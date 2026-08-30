// ============================================================
// gelisim.js — Kendini Geliştirme checklist motoru (Genel Kültür /
// Kod / Siber Güvenlik / ABD YL Hazırlığı). Sadece gelisim.html'de
// yüklenir. core.js'in ÖNCE yüklenmiş olması gerekir (motivationLogEvent
// için — o yoksa da sayfa sorunsuz çalışır).
// ============================================================

  const GELISIM_DATA = [
    {
      id: 'gk', ad: 'Genel Kültür',
      aciklama: 'TYT sosyal derslerine de katkısı olan, ama asıl amacı YL sürecinde ve mülakatlarda "geniş ufuklu" bir profil çıkarmak.',
      konular: [
        { id: 'gk-gundem', ad: 'Güncel Olaylar & Ekonomi Okuryazarlığı', altKonular: [
          'Haftada en az 1 kez kaliteli bir kaynaktan gündem takibi alışkanlığı',
          'Temel makro kavramlar: enflasyon, faiz, döviz kuru, işsizlik',
          'TR ve dünya ekonomisi gündemini haftalık kısa not olarak özetleme'
        ]},
        { id: 'gk-tarih-felsefe', ad: 'Tarih & Felsefe Okumaları', altKonular: [
          'Felsefe tarihine kısa/özet bir giriş kitabı',
          'Cumhuriyet tarihi ana hatları (TYT İnkılap ile örtüşüyor)',
          'Dünya tarihinde birkaç dönüm noktasını (Sanayi Devrimi, Soğuk Savaş vb.) okuyup özümseme'
        ]},
        { id: 'gk-kitap', ad: 'Kitap / Podcast Listesi', altKonular: [
          'Ayda en az 1 kitap hedefi',
          'İktisat-işletme dünyasına erişilebilir bir giriş kitabı (ör. popüler bilim tarzı bir iktisat kitabı)',
          'Düzenli takip edilen bir ekonomi/iş dünyası podcast\'i seçme'
        ]}
      ]
    },
    {
      id: 'ispanyolca', ad: 'İspanyolca (1 Yıl · A1 → B1)',
      aciklama: 'Neden İspanyolca: ABD\'de evde İspanyolca konuşan ~45 milyon kişi var (nüfusun ~%14\'ü) ve ABD, Meksika\'dan sonra dünyanın en büyük ikinci İspanyolca konuşan ülkesi. Endüstri Mühendisliği + İspanyolca kombinasyonu ise özellikle Meksika/Latin Amerika tedarik zinciri ve üretim operasyonlarında doğrudan karşılığı olan bir ikili. Günde 30 dk ile 1 yılda gerçekçi hedef akıcılık değil, sağlam bir A2/B1 — o bile CV\'de ve mülakatta somut bir satır.',
      konular: [
        { id: 'esp-c1', ad: 'Çeyrek 1 (Ay 1–3) · A1 Temeli', altKonular: [
          'Alfabe, telaffuz ve temel selamlaşma kalıpları',
          'Ser / estar ayrımı ve şimdiki zaman (presente) çekimleri',
          'İlk 500 kelimelik temel kelime hazinesi',
          'Kendini tanıtma: basit bir paragraf kurabilme'
        ]},
        { id: 'esp-c2', ad: 'Çeyrek 2 (Ay 4–6) · A2 Geçmiş Zamanlar', altKonular: [
          'Pretérito indefinido (bitmiş geçmiş) çekimleri',
          'Pretérito imperfecto ve ikisi arasındaki fark',
          'Gelecek zaman ve temel koşul kipi',
          'Günlük diyalog: alışveriş, yol tarifi, restoran'
        ]},
        { id: 'esp-c3', ad: 'Çeyrek 3 (Ay 7–9) · B1\'e Geçiş', altKonular: [
          'Subjuntivo (dilek kipi) girişi — B1\'in eşiği burası',
          'Altyazılı dizi/film ile pasif dinleme alışkanlığı',
          'Basit haber metinlerini sözlüksüz okuyabilme',
          'Kendi cümlelerinle kısa günlük yazma pratiği'
        ]},
        { id: 'esp-c4', ad: 'Çeyrek 4 (Ay 10–12) · Konuşma & Sağlamlaştırma', altKonular: [
          'Konuşma partneri bulma (italki, Tandem vb.) — haftada en az 1 seans',
          'Altyazısız dinleme denemesi (podcast / YouTube)',
          'İş/akademik bağlamda temel kelime hazinesi',
          'Yıl sonu değerlendirmesi: seviye testi ile A2/B1 teyidi'
        ]},
        { id: 'esp-sistem', ad: 'Günlük Sistem', altKonular: [
          'Her gün 30 dk — rutin panelindeki 19:15 bloğu',
          'Kelime tekrarı için aralıklı tekrar uygulaması (Anki vb.) kurulumu',
          'Haftada 1 gün sadece dinleme/izleme (dilbilgisi yok)'
        ]}
      ]
    },
    {
      id: 'kod', ad: 'Kod',
      aciklama: 'Endüstri Mühendisliği + olası İktisat/İşletme YL pivotu için en çok karşılığı olan teknik beceri seti.',
      konular: [
        { id: 'kod-python', ad: 'Python Temelleri', altKonular: [
          'Sözdizimi ve temel veri tipleri',
          'Döngü, koşul, fonksiyonlar',
          'Liste, sözlük ve temel veri yapıları'
        ]},
        { id: 'kod-veri', ad: 'Veri Analizi Araçları', altKonular: [
          'pandas ile veri okuma/temizleme',
          'numpy ile temel sayısal işlemler',
          'matplotlib ile basit görselleştirme'
        ]},
        { id: 'kod-sql', ad: 'SQL Temelleri', altKonular: [
          'SELECT / WHERE / JOIN',
          'GROUP BY ve agregasyon fonksiyonları',
          'Basit bir veritabanı üzerinde uçtan uca pratik'
        ]},
        { id: 'kod-endustri', ad: 'Endüstri Mühendisliği\'ne Özel Araçlar', altKonular: [
          'PuLP/Gurobi ile basit bir doğrusal programlama modeli kurma',
          'Temel simülasyon mantığı (ör. kuyruk teorisi, envanter modeli)'
        ]},
        { id: 'kod-git', ad: 'Git / GitHub', altKonular: [
          'Temel commit → push → pull akışı',
          'Branch mantığı ve basit bir merge deneyimi'
        ]},
        { id: 'kod-proje', ad: 'Portföy Projesi', altKonular: [
          'Küçük bir gerçek veri seti üzerinde uçtan uca analiz projesi',
          'Projeyi GitHub\'da paylaşıp kısa bir README ile belgeleme'
        ]}
      ]
    },
    {
      id: 'siber', ad: 'Siber Güvenlik',
      aciklama: 'Mevcut ilgi alanın — YL başvurusunda zorunlu değil ama CV\'de teknik çeşitlilik ve kişisel motivasyon kanıtı olarak duruyor.',
      konular: [
        { id: 'siber-ag', ad: 'Temel Ağ Bilgisi', altKonular: [
          'TCP/IP temelleri',
          'DNS ve HTTP(S) nasıl çalışır',
          'Temel port ve protokol kavramları'
        ]},
        { id: 'siber-kali', ad: 'Kali Linux Kurulumu & Araç Tanıma', altKonular: [
          'Dual boot kurulumu',
          'nmap ile temel ağ taraması',
          'Wireshark ile paket analizi'
        ]},
        { id: 'siber-pratik', ad: 'Pratik Platformlar', altKonular: [
          'TryHackMe başlangıç seviyesi odalar',
          'HackTheBox başlangıç seviyesi makineler'
        ]},
        { id: 'siber-sertifika', ad: 'Sertifika Hedefi (opsiyonel)', altKonular: [
          'CompTIA Security+ müfredatına göz atma',
          'Karar: ciddi bir hedef mi, yoksa sadece hobi olarak mı kalacak'
        ]}
      ]
    },
    {
      id: 'yl', ad: 'ABD YL Hazırlığı',
      aciklama: 'Nihai hedef bu — diğer üç kategori buraya hizmet ediyor. Zamanı geldiğinde en çok ağırlık burada olmalı.',
      konular: [
        { id: 'yl-sinav', ad: 'Standart Sınavlar', altKonular: [
          'GRE — quant ağırlıklı bir çalışma planı',
          'GRE — verbal ve AWA (yazılı) kısmı',
          'TOEFL ya da IELTS'
        ]},
        { id: 'yl-akademik', ad: 'Akademik Profil', altKonular: [
          'GPA\'yı koruma/yükseltme takibi',
          'Bir hocayla gerçek bir araştırma/proje ilişkisi kurma',
          'Bitirme projesini (ya da bir dersi) YL hedefine yakın bir konuya yönlendirme'
        ]},
        { id: 'yl-deneyim', ad: 'Deneyim', altKonular: [
          'Veri/analiz ağırlıklı bir staj ya da yarı zamanlı iş',
          'Purdue veya Koç\'un ABD partner okuluna değişim başvurusu'
        ]},
        { id: 'yl-belge', ad: 'Başvuru Belgeleri', altKonular: [
          'SOP (niyet mektubu) ilk taslağı',
          'Akademik CV/Resume',
          '3 referans mektubu için hoca ilişkilerini erken kurma'
        ]},
        { id: 'yl-okul', ad: 'Okul Araştırması', altKonular: [
          'Hedef program listesi (Economics / Business Analytics / Operations Research MS gibi)',
          'Başvuru takvimleri ve son tarihler'
        ]},
        { id: 'yl-butce', ad: 'Bütçe & Burs Araştırması', altKonular: [
          'Fonlu (RA/TA) program arayışı',
          'Yurt dışı YL bursları (Fulbright ve benzerleri)'
        ]}
      ]
    }
  ];

  const GELISIM_STORAGE_KEY = 'gelisimChecklistState';

  function gelisimLoadState() {
    try {
      const raw = localStorage.getItem(GELISIM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Gelişim state okunamadı:', e);
      return {};
    }
  }

  function gelisimSaveState(state) {
    try {
      localStorage.setItem(GELISIM_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Gelişim state kaydedilemedi:', e);
    }
  }

  let _gelisimState = gelisimLoadState();

  function gelisimLeafIds(konu) {
    if (konu.altKonular && konu.altKonular.length) {
      return konu.altKonular.map((_, i) => konu.id + '__' + i);
    }
    return [konu.id];
  }

  function gelisimTopicRowHTML(id, ad) {
    const checked = !!_gelisimState[id];
    return '<label class="yks-topic-row' + (checked ? ' checked' : '') + '">' +
      '<input type="checkbox" class="gelisim-checkbox" data-id="' + id + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="yks-topic-name">' + ad + '</span>' +
      '</label>';
  }

  function gelisimKonuHTML(konu) {
    if (konu.altKonular && konu.altKonular.length) {
      const subRows = konu.altKonular.map((ad, i) => gelisimTopicRowHTML(konu.id + '__' + i, ad)).join('');
      return '<div class="yks-topic-group">' +
        '<div class="yks-topic-row" style="cursor:default; color:var(--text);"><span class="yks-topic-name"><b>' + konu.ad + '</b></span></div>' +
        '<div class="yks-subtopics">' + subRows + '</div>' +
        '</div>';
    }
    return gelisimTopicRowHTML(konu.id, konu.ad);
  }

  function gelisimKatProgress(kategori) {
    let done = 0, total = 0;
    kategori.konular.forEach(konu => {
      gelisimLeafIds(konu).forEach(id => {
        total++;
        if (_gelisimState[id]) done++;
      });
    });
    return { done, total };
  }

  function gelisimKatHTML(kategori) {
    const { done, total } = gelisimKatProgress(kategori);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const topicsHTML = kategori.konular.map(gelisimKonuHTML).join('');
    return '<details class="acc-section yks-subject" data-kat-id="' + kategori.id + '">' +
      '<summary class="sec-label acc-summary"><span>' + kategori.ad + '</span>' +
      '<span class="yks-subject-count" data-count-for="' + kategori.id + '">' + done + '/' + total + '</span>' +
      '<span class="acc-chevron">▾</span></summary>' +
      '<div class="acc-body">' +
      (kategori.aciklama ? '<p class="gelisim-desc">' + kategori.aciklama + '</p>' : '') +
      '<div class="hero-progress-track yks-mini-track"><div class="hero-progress-fill yks-mini-fill" data-fill-for="' + kategori.id + '" style="width:' + pct + '%;"></div></div>' +
      '<div class="yks-topic-list">' + topicsHTML + '</div>' +
      '</div></details>';
  }

  function gelisimOverallProgress(list) {
    let done = 0, total = 0;
    list.forEach(k => { const p = gelisimKatProgress(k); done += p.done; total += p.total; });
    return { done, total };
  }

  function gelisimUpdateOverallBar() {
    const { done, total } = gelisimOverallProgress(GELISIM_DATA);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const fillEl = document.getElementById('gelisimFill');
    const pctEl = document.getElementById('gelisimPct');
    const subEl = document.getElementById('gelisimSub');
    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.className = 'hero-progress-fill ' + (pct >= 66 ? 'lvl-safe' : pct >= 33 ? 'lvl-watch' : 'lvl-critical');
    }
    if (pctEl) pctEl.textContent = '%' + pct;
    if (subEl) subEl.textContent = done + ' / ' + total + ' madde';
  }

  function gelisimRenderKatBars() {
    const container = document.getElementById('gelisimKatBars');
    if (!container) return;
    container.innerHTML = GELISIM_DATA.map(kategori => {
      const { done, total } = gelisimKatProgress(kategori);
      const pct = total ? Math.round((done / total) * 100) : 0;
      return '<div class="yks-ders-bar-row">' +
        '<span class="yks-ders-bar-label">' + kategori.ad + '</span>' +
        '<div class="bar-track"><div class="bar-fill base" style="width:' + pct + '%;"></div></div>' +
        '<span class="yks-ders-bar-pct">%' + pct + '</span>' +
        '</div>';
    }).join('');
  }

  function gelisimRenderAll() {
    const container = document.getElementById('gelisimContainer');
    if (!container) return;
    container.innerHTML = GELISIM_DATA.map(gelisimKatHTML).join('');
    gelisimUpdateOverallBar();
    gelisimRenderKatBars();
  }

  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('gelisim-checkbox')) return;
    const id = e.target.dataset.id;
    _gelisimState[id] = e.target.checked;
    gelisimSaveState(_gelisimState);
    e.target.closest('.yks-topic-row')?.classList.toggle('checked', e.target.checked);

    const katEl = e.target.closest('details.yks-subject');
    if (katEl) {
      const katId = katEl.dataset.katId;
      const kat = GELISIM_DATA.find(k => k.id === katId);
      if (kat) {
        const { done, total } = gelisimKatProgress(kat);
        const pct = total ? Math.round((done / total) * 100) : 0;
        const fillEl = katEl.querySelector('[data-fill-for="' + katId + '"]');
        const countEl = katEl.querySelector('[data-count-for="' + katId + '"]');
        if (fillEl) fillEl.style.width = pct + '%';
        if (countEl) countEl.textContent = done + '/' + total;
      }
    }
    gelisimUpdateOverallBar();
    gelisimRenderKatBars();

    if (e.target.checked && typeof motivationLogEvent === 'function') {
      const topicName = e.target.closest('.yks-topic-row')?.querySelector('.yks-topic-name')?.textContent?.trim();
      motivationLogEvent('🌱 Gelişim maddesi tamamlandı' + (topicName ? ': ' + topicName : '.'));
    }
  });

  gelisimRenderAll();
