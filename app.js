// ============================================================
// app.js — TR→ABD operasyon paneli, tek sayfa.
//
// Yapı:
//   1. Sabitler ve gün hesapları
//   2. Veri (YKS konuları, gelişim, rutin, kitaplar)
//   3. Durum (localStorage) — anahtarlar eski panelden korundu
//   4-11. Render fonksiyonları
//   12. Olaylar
//   13. Başlatma
//
// Bağımlılık yok, derleme yok. Dosyayı çift tıklayıp açabilirsin.
// ============================================================
(function () {
  'use strict';

  // ============================================================
  // 1. SABİTLER
  // "Gün" gece yarısında değil 04:00'te biter: gece geç saatte
  // yapılan işaretleme hâlâ o güne yazılır.
  // ============================================================
  const DAY_BOUNDARY = 4;
  const START = new Date('2026-07-29T00:00:00');
  const EXAM  = new Date('2027-06-19T10:15:00');
  const RUTIN_ESIK = 70;

  // İlerleme halkası çevresi (r = 27)
  const RING_C = 2 * Math.PI * 28;

  // Son yedek tarihi — K sözlüğünün dışında tutuluyor ki geri yükleme
  // eski yedeğin tarihini geri getirmesin.
  const K_YEDEK = 'panel_last_backup';

  function dateKey(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function todayKey() {
    const d = new Date();
    if (d.getHours() < DAY_BOUNDARY) d.setDate(d.getDate() - 1);
    return dateKey(d);
  }

  // ============================================================
  // 2. VERİ
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
  // GELİŞİM — odak: genel kültür, dil, (düşük tempoda) siber/WSL, YL
  // Not: madde id'leri eski panelden korundu, işaretlerin kaybolmasın.
  // ============================================================
  const GELISIM_DATA = [
    {
      id: 'gk', ad: 'Genel Kültür',
      aciklama: 'Bu yılın dört odağından biri. TYT sosyal netlerine de yarıyor ama asıl işi, ileride mülakatta ve yazıda fark yaratan genişliği kurmak.',
      konular: [
        { id: 'gk-gundem', ad: 'Gündem & Ekonomi Okuryazarlığı', altKonular: [
          'Haftada en az 1 kez kaliteli bir kaynaktan gündem taraması',
          'Temel makro kavramlar: enflasyon, faiz, döviz kuru, işsizlik',
          'Haftalık gündemi 5 maddelik kısa not olarak yazma'
        ]},
        { id: 'gk-tarih-felsefe', ad: 'Tarih & Felsefe', altKonular: [
          'Felsefe tarihine giriş niteliğinde bir kitap',
          'Cumhuriyet tarihi ana hatları (TYT İnkılap ile örtüşüyor)',
          'Dünya tarihinde dönüm noktaları: Sanayi Devrimi, Soğuk Savaş'
        ]},
        { id: 'gk-kitap', ad: 'Okuma Alışkanlığı', altKonular: [
          'Ayda en az 1 kitap',
          'Günde 20 dk okuma/dinleme (rutindeki 21:00 bloğu)',
          'Bitirilen her kitap için 5 satırlık not'
        ]}
      ]
    },
    {
      id: 'ispanyolca', ad: 'İspanyolca (A1 → B1)',
      aciklama: 'ABD\'de evde İspanyolca konuşan ~45 milyon kişi var; ülke, Meksika\'dan sonra dünyanın en büyük ikinci İspanyolca konuşan ülkesi. Endüstri Mühendisliği + İspanyolca, Latin Amerika tedarik zincirinde doğrudan karşılığı olan bir ikili. Günde 30 dk ile bir yılda gerçekçi hedef akıcılık değil, sağlam bir A2/B1.',
      konular: [
        { id: 'esp-c1', ad: 'Çeyrek 1 (Ay 1–3) · A1', altKonular: [
          'Alfabe, telaffuz, selamlaşma kalıpları',
          'Ser / estar ayrımı ve presente çekimleri',
          'İlk 500 kelime',
          'Kendini tanıtan bir paragraf kurabilme'
        ]},
        { id: 'esp-c2', ad: 'Çeyrek 2 (Ay 4–6) · A2', altKonular: [
          'Pretérito indefinido',
          'Pretérito imperfecto ve ikisinin farkı',
          'Gelecek zaman ve temel koşul kipi',
          'Günlük diyalog: alışveriş, yol tarifi, restoran'
        ]},
        { id: 'esp-c3', ad: 'Çeyrek 3 (Ay 7–9) · B1 eşiği', altKonular: [
          'Subjuntivo girişi',
          'Altyazılı dizi/film ile pasif dinleme',
          'Basit haber metnini sözlüksüz okuyabilme',
          'Kısa günlük yazma pratiği'
        ]},
        { id: 'esp-c4', ad: 'Çeyrek 4 (Ay 10–12) · Konuşma', altKonular: [
          'Konuşma partneri (italki / Tandem) — haftada en az 1 seans',
          'Altyazısız dinleme denemesi',
          'Yıl sonu seviye testi ile A2/B1 teyidi'
        ]},
        { id: 'esp-sistem', ad: 'Günlük Sistem', altKonular: [
          'Her gün 30 dk — rutindeki 19:15 bloğu',
          'Anki (aralıklı tekrar) kurulumu',
          'Haftada 1 gün sadece dinleme, dilbilgisi yok',
          'Paneli ES moduna alıp arayüzden pasif maruz kalma'
        ]}
      ]
    },
    {
      id: 'siber', ad: 'Siber & WSL (düşük tempo)',
      aciklama: 'Bu yıl ana odak değil — dual boot yerine WSL üzerinden, haftada birkaç saat. Amaç uzman olmak değil, temeli kaybetmemek ve sınavdan sonra hızlı devam edebilmek.',
      konular: [
        { id: 'siber-wsl', ad: 'WSL Kurulumu & Linux Temeli', altKonular: [
          'WSL2 + Kali (veya Ubuntu) kurulumu',
          'Kabuk temelleri: dosya sistemi, izinler, paket yönetimi',
          'Windows Terminal + tmux ile rahat bir çalışma ortamı'
        ]},
        { id: 'siber-ag', ad: 'Ağ Temelleri', altKonular: [
          'TCP/IP temelleri',
          'DNS ve HTTP(S) nasıl çalışır',
          'Port ve protokol kavramları'
        ]},
        { id: 'kod-python', ad: 'Python', altKonular: [
          'Sözdizimi ve temel veri tipleri',
          'Döngü, koşul, fonksiyonlar',
          'Küçük bir otomasyon betiği yazma'
        ]},
        { id: 'siber-pratik', ad: 'Pratik', altKonular: [
          'nmap ile temel tarama (kendi ağında)',
          'TryHackMe başlangıç odaları',
          'Wireshark ile paket bakma'
        ]},
        { id: 'siber-sonra', ad: 'Sınavdan Sonrası İçin Park Edilenler', altKonular: [
          'HackTheBox makineleri',
          'CompTIA Security+ müfredatına bakma',
          'Donanım/WiFi gerektiren konular (VM ya da ayrı makine ile)'
        ]}
      ]
    },
    {
      id: 'yl', ad: 'ABD Yüksek Lisans Hazırlığı',
      aciklama: 'Nihai hedef. Bu yıl sadece zemin hazırlığı; asıl yoğunluk YKS bittikten ve lisansa geçtikten sonra.',
      konular: [
        { id: 'yl-sinav', ad: 'Standart Sınavlar', altKonular: [
          'TOEFL iBT ya da IELTS Academic',
          'GRE — quant ağırlıklı plan',
          'GRE — verbal ve AWA'
        ]},
        { id: 'yl-akademik', ad: 'Akademik Profil', altKonular: [
          'GPA\'yı koruma/yükseltme',
          'Bir hocayla gerçek proje/araştırma ilişkisi',
          'Bitirme projesini YL hedefine yakın bir konuya yönlendirme'
        ]},
        { id: 'yl-deneyim', ad: 'Deneyim', altKonular: [
          'Veri/analiz ağırlıklı staj',
          'ABD partner üniversitesine değişim başvurusu'
        ]},
        { id: 'yl-belge', ad: 'Başvuru Belgeleri', altKonular: [
          'SOP ilk taslağı',
          'Akademik CV',
          '3 referans için hoca ilişkilerini erken kurma'
        ]},
        { id: 'yl-okul', ad: 'Okul & Bütçe', altKonular: [
          'Hedef program listesi (Economics / Business Analytics / OR)',
          'Başvuru takvimleri',
          'Fonlu (RA/TA) program arayışı ve burslar'
        ]}
      ]
    }
  ];

  // ============================================================
  // KİTAPLAR — Storytel'de okunacak/dinlenecek liste
  // Kaynak: Storytel TR kataloğu (Popüler Bilim listesi ve kitap
  // sayfaları). Katalog değişebilir; bulunmayanı listeden çıkar.
  // ============================================================
  const KITAP_DATA = [
    {
      id: 'k-baslangic', ad: 'Buradan Başla (ilk 3 ay)',
      aciklama: 'Sesli kitaba ve düzenli okumaya alışma dönemi. Hepsi akıcı, hepsi Storytel TR\'de mevcut.',
      kitaplar: [
        { id: 'kb-sapiens', ad: 'Sapiens', yazar: 'Yuval Noah Harari', not: 'Genel kültürün omurgası. Tarih, antropoloji ve ekonomiyi tek anlatıda birleştirir.' },
        { id: 'kb-freakonomics', ad: 'Freakonomics', yazar: 'Levitt & Dubner', not: 'İktisadı formülle değil, merakla anlatır. YL alanına ilk kapı.' },
        { id: 'kb-astrofizik', ad: 'Acelesi Olanlar İçin Astrofizik', yazar: 'Neil deGrasse Tyson', not: 'Kısa ve keyifli. Sesli kitap alışkanlığı kurmak için ideal başlangıç.' },
        { id: 'kb-incognito', ad: 'Incognito — Beynin Gizli Hayatı', yazar: 'David Eagleman', not: 'Kendi kararlarını ve dikkatini anlamak için; sınav yılında beklenmedik ölçüde işe yarar.' }
      ]
    },
    {
      id: 'k-dusunme', ad: 'Düşünme & Karar Verme',
      aciklama: 'Bu yılın en çok işine yarayacak kategori: hem YKS\'de soru çözerken hem plan yaparken kendi hatalarını görmeni sağlar.',
      kitaplar: [
        { id: 'kb-kahneman', ad: 'Hızlı ve Yavaş Düşünme', yazar: 'Daniel Kahneman', not: 'Ağır ama karşılığı yüksek. Sistem 1/Sistem 2 ayrımı, deneme analizinde neden aynı hatayı tekrarladığını açıklar.' },
        { id: 'kb-safsata', ad: 'Safsatalar Ansiklopedisi', yazar: 'Immanuel Tolstoyevski', not: 'Mantık hatalarını tanımak — TYT Türkçe ve AYT sözel muhakemeye doğrudan katkı.' },
        { id: 'kb-cehalet', ad: 'Cehalet Bilimi', yazar: 'Tayfun Uzbay', not: 'Bilmediğini bilmek üzerine; kısa ve sarsıcı.' }
      ]
    },
    {
      id: 'k-iktisat', ad: 'İktisat & İşletme (YL yönü)',
      aciklama: 'Yüksek lisans alanına karar vermene yardım eder. Mühendislikten iktisada geçişi düşünüyorsan burası test alanın.',
      kitaplar: [
        { id: 'kb-21ders', ad: '21. Yüzyıl için 21 Ders', yazar: 'Yuval Noah Harari', not: 'İş, teknoloji, göç, otomasyon — YL başvurusundaki niyet mektubuna fikir verir.' },
        { id: 'kb-homodeus', ad: 'Homo Deus', yazar: 'Yuval Noah Harari', not: 'Sapiens\'in devamı; geleceğin ekonomisi ve otomasyon.' },
        { id: 'kb-elonmusk', ad: 'Elon Musk: Tesla, SpaceX ve Fantastik Bir Gelecek Arayışı', yazar: 'Ashlee Vance', not: 'Mühendislik + girişim kesişimi. Endüstri Mühendisliği okuyacak biri için tanıdık zemin.' },
        { id: 'kb-sistem', ad: 'Sistem', yazar: 'James Ball', not: 'İnternetin altyapısını kimin yönettiği üzerine; teknoloji-ekonomi-politika kesişimi.' }
      ]
    },
    {
      id: 'k-bilim', ad: 'Bilim & Merak',
      aciklama: 'AYT Fizik/Biyoloji ile örtüşen yerler var; ama asıl amacı çalışmaktan yorulduğunda seni kitaptan koparmadan dinlendirmek.',
      kitaplar: [
        { id: 'kb-kozmos', ad: 'Kozmos: Evrenin ve Yaşamın Sırları', yazar: 'Carl Sagan', not: 'Klasik. Uzun, ama dinlemesi en keyifli olanlardan.' },
        { id: 'kb-evrim', ad: '50 Soruda Evrim', yazar: 'Çağrı Mert Bakırcı', not: 'AYT Biyoloji ile doğrudan örtüşür.' },
        { id: 'kb-yapayzeka', ad: '50 Soruda Yapay Zeka', yazar: 'Cem Say', not: 'Türkçe kaynaklar içinde en net anlatanlardan; teknik ama okunur.' },
        { id: 'kb-bizdenonceki', ad: 'Bizden Önceki Dünya', yazar: 'Tom Higham', not: 'İnsanın kökeni; Sapiens\'i sevdiysen doğal devamı.' }
      ]
    },
    {
      id: 'k-edebiyat', ad: 'Türk Edebiyatı (TYT Türkçe için)',
      aciklama: 'Bu kategori doğrudan net getirir. TYT Türkçe\'nin 40 sorusunun büyük kısmı paragraf; paragraf netini yükselten şey soru bankası değil, düzenli nitelikli okuma. Roman dinlemek de sayılır.',
      kitaplar: [
        { id: 'kb-tutunamayanlar', ad: 'Tutunamayanlar', yazar: 'Oğuz Atay', not: 'Zor ama dil hakimiyetini en çok geliştirenlerden. Acele etme, aylara yay.' },
        { id: 'kb-sinekli', ad: 'Sinekli Bakkal', yazar: 'Halide Edib Adıvar', not: 'Klasik; hem edebiyat hem dönem bilgisi.' },
        { id: 'kb-kuyucakli', ad: 'Kuyucaklı Yusuf', yazar: 'Sabahattin Ali', not: 'Kısa, akıcı, dili berrak. Okuma alışkanlığını bozmadan sürdürmek için iyi.' },
        { id: 'kb-saatleri', ad: 'Saatleri Ayarlama Enstitüsü', yazar: 'Ahmet Hamdi Tanpınar', not: 'Türkçenin en zengin cümlelerinden; paragraf sorularına dolaylı ama güçlü katkı.' }
      ]
    },
    {
      id: 'k-sistem', ad: 'Düzen & Alışkanlık',
      aciklama: 'Bir tane yeter. Bu tür kitapların hepsini okumak, hiçbirini uygulamamanın en zarif yoludur.',
      kitaplar: [
        { id: 'kb-ifa1', ad: 'İFA: İnsanın Fabrika Ayarları — Beden', yazar: 'Sinan Canan', not: 'Uyku, beslenme, dikkat — bu yıl kuracağın rutinin arkasındaki mantık.' },
        { id: 'kb-mikrobiyota', ad: 'Mikrobiyota — Beyinde Ararken Bağırsakta Buldum', yazar: 'Serkan Karaismailoğlu', not: 'Beslenme düzeninin zihinsel performansla bağını anlatır.' }
      ]
    }
  ];


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

  const TUR_ETIKET = {
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

  // ============================================================
  // 3. DURUM — localStorage. Anahtarlar eski panelden korundu,
  // böylece işaretlediğin her şey aynen duruyor.
  // ============================================================
  const K = {
    lang: 'almanya_lang',
    motiv: 'almanya_motivation_v1',
    yks: 'yksChecklistState',
    yksHafta: 'yksWeeklyQuestionProgress',
    gelisim: 'gelisimChecklistState',
    rutin: 'rutinDailyState',
    kitap: 'kitapChecklistState'
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  let S = {
    yks: load(K.yks, {}),
    yksHafta: load(K.yksHafta, {}),
    gelisim: load(K.gelisim, {}),
    rutin: load(K.rutin, {}),
    kitap: load(K.kitap, {}),
    motiv: load(K.motiv, {})
  };

  // ============================================================
  // 3b. TEMA
  // ============================================================
  function storedTheme() {
    try { const v = localStorage.getItem('panel_theme'); return (v === 'dark' || v === 'light') ? v : null; }
    catch (e) { return null; }
  }
  // Varsayılan siyah. Panelin kimliği siyah üzerine kurulu; açık tema
  // isteyerek seçilen bir seçenek, sistemin dayattığı değil.
  function systemTheme() { return 'dark'; }
  // Başlatma bitmeden yeniden çizim yapılamaz: aşağıdaki sabitler
  // (YG_PITCH gibi) henüz tanımlı olmuyor.
  let HAZIR = false;

  function applyTheme(v) {
    document.documentElement.setAttribute('data-theme', v);
    // Yıl ızgarasının renkleri temadan geliyor; tema değişince yeniden çiz.
    if (HAZIR) renderYearGrid();
  }

  // CSS değişkeninden renk okuyup iki renk arasında karışım yapar.
  // Yıl ızgarasında her günün rengi, yolun neresinde olduğunu gösteriyor.
  function cssVar(n) {
    return getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  }
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const v = parseInt(h, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function karis(a, b, t) {
    return 'rgb(' + a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',') + ')';
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('panel_theme', next); } catch (e) {}
    applyTheme(next);
  }
  applyTheme(storedTheme() || systemTheme());
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
    });
  } catch (e) {}

  // ============================================================
  // 3c. İLERLEME HALKASI
  // ============================================================
  function setRing(id, pct) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.strokeDasharray = RING_C.toFixed(2);
    el.style.strokeDashoffset = (RING_C * (1 - (pct || 0) / 100)).toFixed(2);
  }

  // ============================================================
  // 4. DİL
  // ============================================================
  function getLang() {
    try { const l = localStorage.getItem(K.lang); return l === 'es' ? 'es' : 'tr'; }
    catch (e) { return 'tr'; }
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-tr]').forEach(el => {
      const v = el.getAttribute('data-' + lang);
      if (v === null) return;
      if (el.dataset.html === '1') el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('on', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function setLang(lang) {
    try { localStorage.setItem(K.lang, lang); } catch (e) {}
    applyLang(lang);
  }

  // Dinamik üretilen metni iki dilde işaretler.
  function t(el, tr, es, asHTML) {
    if (!el) return;
    el.setAttribute('data-tr', tr);
    el.setAttribute('data-es', es);
    if (asHTML) el.dataset.html = '1';
    const v = getLang() === 'es' ? es : tr;
    if (asHTML) el.innerHTML = v; else el.textContent = v;
  }

  // ============================================================
  // 5. GERİ SAYIM & ÜST ŞERİT
  // ============================================================
  function renderCounters() {
    const now = new Date();
    const kalan = Math.max(0, Math.ceil((EXAM - now) / 86400000));
    const gecen = Math.max(0, Math.floor((now - START) / 86400000));
    const toplam = Math.round((EXAM - START) / 86400000);
    const pct = toplam ? Math.min(100, Math.round((gecen / toplam) * 100)) : 0;

    // Geri sayım zaten kahraman alanda; bu kart yerine işaretlenen gün.
    let isaretli = 0;
    const cc = checkins();
    Object.keys(cc).forEach(function (k) { if (cc[k]) isaretli++; });
    const dI = document.getElementById('statIsaret');
    if (dI) dI.textContent = isaretli;

    const d1 = document.getElementById('statKalan');
    const d2 = document.getElementById('statGecen');
    const d3 = document.getElementById('statSeri');
    if (d1) d1.textContent = kalan;
    if (d2) d2.textContent = gecen;
    if (d3) d3.textContent = streakCount();

    const bar = document.getElementById('yilBar');
    if (bar) bar.style.width = pct + '%';
    t(document.getElementById('yilBarNot'),
      'Hazırlık süresinin %' + pct + "'i geçti · sınava " + kalan + ' gün',
      'Ha transcurrido el ' + pct + '% de la preparación · faltan ' + kalan + ' días');

    // canlı saat
    const diff = EXAM - now;
    if (diff > 0) {
      const gg = Math.floor(diff / 86400000);
      const ss = Math.floor(diff / 3600000) % 24;
      const dd = Math.floor(diff / 60000) % 60;
      const sn = Math.floor(diff / 1000) % 60;
      const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = String(v).padStart(2, '0'); };
      set('cdG', gg); set('cdS', ss); set('cdD', dd); set('cdSn', sn);
    }
  }

  // ============================================================
  // 5b. ŞU AN — rutindeki hangi bloktasın
  // Saat dizesinden ("07:30–09:30" ya da "23:00") başlangıç dakikası
  // çıkarılıp o ana denk gelen blok bulunuyor. Her saniye tazeleniyor.
  // ============================================================
  function dakikaya(saat) {
    const m = String(saat).match(/^(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  function suAnkiBlok() {
    const d = new Date();
    const su = d.getHours() * 60 + d.getMinutes();
    let bulunan = null;
    for (let i = 0; i < RUTIN_GUN.length; i++) {
      const b = dakikaya(RUTIN_GUN[i].saat);
      if (b === null) continue;
      if (b <= su) bulunan = RUTIN_GUN[i]; else break;
    }
    // Gece yarısından 06:30'a kadar: uyku bloğu
    if (!bulunan) bulunan = RUTIN_GUN[RUTIN_GUN.length - 1];
    return bulunan;
  }

  function renderSimdi() {
    const d = new Date();
    const saatEl = document.getElementById('heroSaat');
    if (saatEl) {
      saatEl.textContent = String(d.getHours()).padStart(2, '0') + ':' +
                           String(d.getMinutes()).padStart(2, '0');
    }
    t(document.getElementById('heroTarih'),
      d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
      d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));

    const b = suAnkiBlok();
    if (!b) return;
    const bitti = rutinOn(b.id);
    t(document.getElementById('simdiAd'), b.ad, b.ad);
    const sEl = document.getElementById('simdiSaat');
    if (sEl) sEl.textContent = b.saat + (bitti ? '  ✓' : '');
    const tEl = document.getElementById('simdiTur');
    if (tEl) {
      tEl.textContent = b.tur ? (TUR_ETIKET[b.tur] || b.tur) : '';
      tEl.className = 'tag' + (b.tur ? ' t-' + b.tur : '');
    }
    const kutu = document.getElementById('simdiKutu');
    if (kutu) kutu.classList.toggle('bitti', bitti);
  }

  // ============================================================
  // 6. CHECK-IN & SERİ
  // ============================================================
  function checkins() { return S.motiv.checkins || (S.motiv.checkins = {}); }

  function streakCount() {
    const c = checkins();
    let n = 0;
    const d = new Date();
    if (d.getHours() < DAY_BOUNDARY) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      if (c[dateKey(d)]) n++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function renderCheckin() {
    const done = !!checkins()[todayKey()];
    const btn = document.getElementById('checkinBtn');
    if (btn) {
      btn.classList.toggle('done', done);
      t(btn, done ? '✓ Bugün işaretlendi' : 'Bugünü işaretle',
             done ? '✓ Marcado hoy' : 'Marcar hoy');
    }
    const n = streakCount();
    t(document.getElementById('seriNot'),
      n > 0 ? n + ' gündür üst üste. Bugün de küçük bir şey yeter.'
            : 'Seri henüz başlamadı — bugün ilk adımı at.',
      n > 0 ? n + ' días seguidos. Hoy también basta con algo pequeño.'
            : 'La racha aún no ha empezado: da hoy el primer paso.');
    const d3 = document.getElementById('statSeri');
    if (d3) d3.textContent = n;
  }

  // ============================================================
  // 7. ORTAK CHECKLIST MOTORU
  // ============================================================
  function leafIds(konu) {
    return (konu.altKonular && konu.altKonular.length)
      ? konu.altKonular.map((_, i) => konu.id + '__' + i)
      : [konu.id];
  }

  function groupProgress(grup, state) {
    let done = 0, total = 0;
    (grup.konular || []).forEach(k => leafIds(k).forEach(id => {
      total++; if (state[id]) done++;
    }));
    return { done, total };
  }

  function rowHTML(id, ad, state, cls) {
    const on = !!state[id];
    return '<label class="chk' + (on ? ' on' : '') + '">' +
      '<input type="checkbox" data-box="' + cls + '" data-id="' + id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="chk-t">' + ad + '</span></label>';
  }

  function konuHTML(konu, state, cls) {
    if (konu.altKonular && konu.altKonular.length) {
      return '<div class="grp"><div class="grp-h">' + konu.ad + '</div>' +
        konu.altKonular.map((ad, i) => rowHTML(konu.id + '__' + i, ad, state, cls)).join('') +
        '</div>';
    }
    return rowHTML(konu.id, konu.ad, state, cls);
  }

  function accHTML(grup, state, cls) {
    const p = groupProgress(grup, state);
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    return '<details class="acc" data-grp="' + grup.id + '">' +
      '<summary><span class="acc-n">' + grup.ad + '</span>' +
      '<span class="acc-c" data-count="' + grup.id + '">' + p.done + '/' + p.total + '</span></summary>' +
      '<div class="acc-b">' +
      (grup.aciklama ? '<p class="note">' + grup.aciklama + '</p>' : '') +
      '<div class="bar sm"><i data-fill="' + grup.id + '" style="width:' + pct + '%"></i></div>' +
      (grup.konular || []).map(k => konuHTML(k, state, cls)).join('') +
      '</div></details>';
  }

  function barsHTML(list, state) {
    return list.map(g => {
      const p = groupProgress(g, state);
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return '<div class="brow"><span class="bk">' + g.ad + '</span>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<span class="bv">%' + pct + '</span></div>';
    }).join('');
  }

  function totalOf(list, state) {
    let done = 0, total = 0;
    list.forEach(g => { const p = groupProgress(g, state); done += p.done; total += p.total; });
    return { done, total };
  }

  // ============================================================
  // 8. YKS
  // ============================================================
  function renderYks() {
    const all = YKS_DATA.TYT.concat(YKS_DATA.AYT);
    const c1 = document.getElementById('yksTyt');
    const c2 = document.getElementById('yksAyt');
    if (c1) c1.innerHTML = YKS_DATA.TYT.map(g => accHTML(g, S.yks, 'yks')).join('');
    if (c2) c2.innerHTML = YKS_DATA.AYT.map(g => accHTML(g, S.yks, 'yks')).join('');
    const b = document.getElementById('yksBars');
    if (b) b.innerHTML = barsHTML(all, S.yks);
    const tot = totalOf(all, S.yks);
    const pct = tot.total ? Math.round((tot.done / tot.total) * 100) : 0;
    const f = document.getElementById('yksFill');
    if (f) f.style.width = pct + '%';
    const p = document.getElementById('yksPct');
    if (p) p.textContent = '%' + pct;
    setRing('yksRing', pct);
    t(document.getElementById('yksSub'),
      tot.done + ' / ' + tot.total + ' konu',
      tot.done + ' / ' + tot.total + ' temas');
  }

  function nextYksTopic() {
    const gruplar = YKS_DATA.TYT.concat(YKS_DATA.AYT);
    for (const g of gruplar) {
      for (const k of (g.konular || [])) {
        if (k.altKonular && k.altKonular.length) {
          for (let i = 0; i < k.altKonular.length; i++) {
            if (!S.yks[k.id + '__' + i]) return { ders: g.ad, konu: k.altKonular[i] };
          }
        } else if (!S.yks[k.id]) {
          return { ders: g.ad, konu: k.ad };
        }
      }
    }
    return null;
  }

  // Haftalık soru kotası
  function renderKota(force) {
    document.querySelectorAll('[data-kota]').forEach(tbody => {
      const grup = tbody.dataset.kota;
      let sv = 0, st = 0;
      tbody.querySelectorAll('tr[data-key]').forEach(tr => {
        const key = tr.dataset.key;
        const hedef = Number(tr.dataset.hedef) || 0;
        const val = Number(S.yksHafta[key]) || 0;
        sv += val; st += hedef;
        const cell = tr.querySelector('.kota-c');
        if (cell && force) { cell.dataset.ready = ''; cell.innerHTML = ''; }
        if (cell && !cell.dataset.ready) {
          cell.dataset.ready = '1';
          const pct = hedef ? Math.min(100, Math.round((val / hedef) * 100)) : 0;
          cell.innerHTML = '<input type="number" class="kota-i" min="0" step="1" data-key="' + key +
            '" value="' + (val || '') + '" placeholder="0"><div class="bar xs"><i class="' +
            (pct >= 100 ? 'ok' : '') + '" style="width:' + pct + '%"></i></div>';
        }
      });
      const tEl = tbody.querySelector('[data-kota-t]');
      if (tEl) {
        const pct = st ? Math.round((sv / st) * 100) : 0;
        tEl.textContent = sv + ' / ' + st + ' (%' + pct + ')';
      }
    });
  }

  // ============================================================
  // 9. RUTİN
  // ============================================================
  function rutinDay() {
    const k = todayKey();
    if (!S.rutin[k]) S.rutin[k] = {};
    return S.rutin[k];
  }
  function rutinOn(id) { const d = S.rutin[todayKey()]; return !!(d && d[id]); }

  function rutinPct(dayObj) {
    const ids = RUTIN_GUN.map(x => x.id).concat(BESLENME.map(x => x.id));
    let done = 0;
    ids.forEach(id => { if (dayObj && dayObj[id]) done++; });
    return { done: done, total: ids.length, pct: Math.round((done / ids.length) * 100) };
  }

  function rutinStreak() {
    let n = 0;
    const d = new Date();
    if (d.getHours() < DAY_BOUNDARY) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      const p = rutinPct(S.rutin[dateKey(d)]);
      if (p.pct >= RUTIN_ESIK) n++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function rutinRow(item, zaman) {
    const on = rutinOn(item.id);
    return '<label class="rrow' + (on ? ' on' : '') + '">' +
      '<input type="checkbox" data-box="rutin" data-id="' + item.id + '"' + (on ? ' checked' : '') + '>' +
      (zaman ? '<span class="rt">' + zaman + '</span>' : '<span class="rt"></span>') +
      '<span class="rm"><span class="rn">' + item.ad + '</span>' +
      (item.not ? '<span class="rnote">' + item.not + '</span>' : '') + '</span>' +
      (item.tur ? '<span class="tag t-' + item.tur + '">' + (TUR_ETIKET[item.tur] || item.tur) + '</span>' : '') +
      '</label>';
  }

  function renderRutin() {
    const g = document.getElementById('rutinGun');
    if (g) g.innerHTML = RUTIN_GUN.map(i => rutinRow(i, i.saat)).join('');
    const b = document.getElementById('rutinBeslenme');
    if (b) b.innerHTML = BESLENME.map(i => rutinRow(i, '')).join('');
    const s = document.getElementById('rutinSpor');
    if (s) {
      const jd = new Date().getDay();
      const idx = jd === 0 ? 6 : jd - 1;
      s.innerHTML = SPOR_HAFTA.map((x, i) => {
        const on = rutinOn(x.id);
        return '<label class="rrow' + (on ? ' on' : '') + (i === idx ? ' today' : '') + '">' +
          '<input type="checkbox" data-box="rutin" data-id="' + x.id + '"' + (on ? ' checked' : '') + '>' +
          '<span class="rt">' + x.gun + '</span>' +
          '<span class="rm"><span class="rn">' + x.detay + '</span></span>' +
          '<span class="tag t-spor">' + x.tur + '</span></label>';
      }).join('');
    }
    const p = rutinPct(S.rutin[todayKey()]);
    const f = document.getElementById('rutinFill');
    if (f) f.style.width = p.pct + '%';
    const pe = document.getElementById('rutinPct');
    if (pe) pe.textContent = '%' + p.pct;
    t(document.getElementById('rutinSub'),
      p.done + ' / ' + p.total + ' madde · gün %' + RUTIN_ESIK + ' dolunca seriye sayılır',
      p.done + ' / ' + p.total + ' puntos · cuenta para la racha al ' + RUTIN_ESIK + '%');
    setRing('rutinRing', p.pct);
    const rs = rutinStreak();
    t(document.getElementById('rutinSeri'),
      rs > 0 ? rs + ' günlük rutin serisi' : 'Rutin serisi henüz başlamadı.',
      rs > 0 ? 'Racha de rutina de ' + rs + ' días' : 'La racha de rutina aún no ha empezado.');
  }

  // ============================================================
  // 10. GELİŞİM & KİTAPLAR
  // ============================================================
  function renderGelisim() {
    const c = document.getElementById('gelisimList');
    if (c) c.innerHTML = GELISIM_DATA.map(g => accHTML(g, S.gelisim, 'gelisim')).join('');
    const b = document.getElementById('gelisimBars');
    if (b) b.innerHTML = barsHTML(GELISIM_DATA, S.gelisim);
    const tot = totalOf(GELISIM_DATA, S.gelisim);
    const pct = tot.total ? Math.round((tot.done / tot.total) * 100) : 0;
    const f = document.getElementById('gelisimFill');
    if (f) f.style.width = pct + '%';
    const p = document.getElementById('gelisimPct');
    if (p) p.textContent = '%' + pct;
    setRing('gelisimRing', pct);
    t(document.getElementById('gelisimSub'),
      tot.done + ' / ' + tot.total + ' madde', tot.done + ' / ' + tot.total + ' puntos');
  }

  function kitapCounts() {
    let done = 0, total = 0;
    KITAP_DATA.forEach(k => k.kitaplar.forEach(b => { total++; if (S.kitap[b.id]) done++; }));
    return { done, total };
  }

  function renderKitap() {
    const c = document.getElementById('kitapList');
    if (!c) return;
    c.innerHTML = KITAP_DATA.map(kat => {
      const d = kat.kitaplar.filter(b => S.kitap[b.id]).length;
      return '<details class="acc"><summary><span class="acc-n">' + kat.ad + '</span>' +
        '<span class="acc-c">' + d + '/' + kat.kitaplar.length + '</span></summary>' +
        '<div class="acc-b"><p class="note">' + kat.aciklama + '</p>' +
        kat.kitaplar.map(b => {
          const on = !!S.kitap[b.id];
          return '<label class="chk book' + (on ? ' on' : '') + '">' +
            '<input type="checkbox" data-box="kitap" data-id="' + b.id + '"' + (on ? ' checked' : '') + '>' +
            '<span class="chk-t"><b>' + b.ad + '</b> <em>' + b.yazar + '</em>' +
            '<span class="bnote">' + b.not + '</span></span></label>';
        }).join('') + '</div></details>';
    }).join('');
    const k = kitapCounts();
    t(document.getElementById('kitapSub'),
      k.done + ' / ' + k.total + ' kitap bitti', k.done + ' / ' + k.total + ' libros terminados');
  }

  // ============================================================
  // 10b. YIL IZGARASI
  // Başlangıçtan sınava kadar her gün bir kare. Sütunlar hafta,
  // satırlar Pazartesi–Pazar. Seri sayısı soyut; bu ızgara değil.
  // ============================================================
  const YG_PITCH = 14; // kare 11px + boşluk 3px

  function renderYearGrid() {
    const grid = document.getElementById('ygGrid');
    if (!grid) return;

    const c = checkins();
    const tk = todayKey();

    // Izgara Pazartesi'den başlasın
    const first = new Date(START);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));

    const days = [];
    for (let d = new Date(first); d <= EXAM; d.setDate(d.getDate() + 1)) days.push(new Date(d));

    const c1 = hex2rgb(cssVar('--cherry') || '#7a2338');
    const c2 = hex2rgb(cssVar('--blue')   || '#2b6d9e');
    const yolGun = Math.max(1, Math.round((EXAM - START) / 86400000));

    let toplam = 0, dolu = 0;
    const cells = days.map(d => {
      const k = dateKey(d);
      const cls = [];
      let stil = '';
      if (d < START) cls.push('pre');
      else {
        toplam++;
        if (c[k]) {
          cls.push('on'); dolu++;
          const t = Math.min(1, Math.max(0, (d - START) / 86400000 / yolGun));
          stil = ' style="--c:' + karis(c1, c2, t) + '"';
        } else if (k > tk) cls.push('fut');
      }
      if (k === tk) cls.push('now');
      return '<i class="' + cls.join(' ') + '"' + stil + ' title="' + k + '"></i>';
    });
    grid.innerHTML = cells.join('');

    // Ay etiketleri — her hafta sütununun ilk gününe göre grupla
    const AY = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const AY_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const haftaSayisi = Math.ceil(days.length / 7);
    const gruplar = [];
    for (let w = 0; w < haftaSayisi; w++) {
      const d = days[w * 7];
      if (!d) break;
      const m = d.getMonth();
      const son = gruplar[gruplar.length - 1];
      if (son && son.m === m) son.n++;
      else gruplar.push({ m: m, n: 1 });
    }
    const el = document.getElementById('ygAylar');
    if (el) {
      el.innerHTML = gruplar.map(g => {
        const w = ' style="width:' + (g.n * YG_PITCH) + 'px"';
        if (g.n <= 2) return '<span' + w + '></span>';
        return '<span' + w + ' data-tr="' + AY[g.m] + '" data-es="' + AY_ES[g.m] + '">' +
          AY[g.m] + '</span>';
      }).join('');
    }

    t(document.getElementById('ygSayi'),
      dolu + ' / ' + toplam + ' gün işaretlendi',
      dolu + ' / ' + toplam + ' días marcados');
  }

  // ============================================================
  // 10c. YEDEK HATIRLATICI
  // Veri sadece bu tarayıcıda. Ayda bir yedeği hatırlamaya
  // bırakmak yerine panel kendisi uyarıyor.
  // ============================================================
  function yedekTarihi() {
    try { const v = localStorage.getItem(K_YEDEK); return v ? new Date(v) : null; }
    catch (e) { return null; }
  }
  function yedekAlindi() {
    try { localStorage.setItem(K_YEDEK, new Date().toISOString()); } catch (e) {}
    renderYedek();
  }
  function renderYedek() {
    const d = yedekTarihi();
    const gun = d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;
    const alarm = document.getElementById('yedekAlarm');
    const durum = document.getElementById('yedekDurum');

    if (durum) {
      t(durum,
        d ? 'Son yedek: ' + d.toLocaleDateString('tr-TR') + ' (' + gun + ' gün önce)'
          : 'Henüz yedek alınmadı.',
        d ? 'Última copia: ' + d.toLocaleDateString('es-ES') + ' (hace ' + gun + ' días)'
          : 'Aún no hay ninguna copia.');
    }
    if (alarm) {
      const goster = (gun === null || gun >= 30);
      alarm.hidden = !goster;
      if (goster) {
        t(document.getElementById('yedekAlarmTxt'),
          gun === null
            ? '<b>Henüz hiç yedek almadın.</b> Panelin tüm verisi sadece bu tarayıcıda duruyor. Yedekleme bölümünden bir dakikada al.'
            : '<b>' + gun + ' gündür yedek alınmadı.</b> Tarayıcı verisi silinirse bu kayıt geri gelmez. Yedekleme bölümüne git.',
          gun === null
            ? '<b>Aún no has hecho ninguna copia.</b> Todos los datos están solo en este navegador. Hazla en un minuto desde la sección de copia.'
            : '<b>Hace ' + gun + ' días que no haces copia.</b> Si se borran los datos del navegador, este registro no vuelve.',
          true);
      }
    }
  }

  // ============================================================
  // 10d. DIŞA AKTARMA
  // ============================================================
  function stateObj() {
    const data = { v: 1, tarih: new Date().toISOString(), keys: {} };
    Object.values(K).forEach(key => {
      try { const v = localStorage.getItem(key); if (v !== null) data.keys[key] = v; } catch (err) {}
    });
    return data;
  }
  function indir(obj, ad) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ad;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ============================================================
  // 10e. SEKME SAYAÇLARI — hangi sekmede ne durumda olduğun
  // sekmeye tıklamadan görünsün.
  // ============================================================
  function renderTabCounts() {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };

    const yt = totalOf(YKS_DATA.TYT.concat(YKS_DATA.AYT), S.yks);
    set('tnYks', '%' + (yt.total ? Math.round((yt.done / yt.total) * 100) : 0));

    set('tnRutin', '%' + rutinPct(S.rutin[todayKey()]).pct);

    const gt = totalOf(GELISIM_DATA, S.gelisim);
    set('tnGelisim', '%' + (gt.total ? Math.round((gt.done / gt.total) * 100) : 0));

    const kc = kitapCounts();
    set('tnKitap', kc.done + '/' + kc.total);
  }

  // ============================================================
  // 10f. SEKME ÖZET ŞERİTLERİ
  // Her sekmenin kendi üç rakamı. Sekme sadece renk değiştirmiyor,
  // kendi durumunu da baştan söylüyor.
  // ============================================================
  function ps(tab, i, tr, es) {
    t(document.getElementById('ps-' + tab + '-' + i), tr, es === undefined ? tr : es);
  }

  function renderStrips() {
    const tk = todayKey();

    // --- Bugün ---
    const rp = rutinPct(S.rutin[tk]);
    ps('bugun', 1, '%' + rp.pct);
    const c = checkins();
    let isaret = 0;
    Object.keys(c).forEach(function (k) { if (c[k]) isaret++; });
    ps('bugun', 2, isaret + ' gün', isaret + ' días');
    const hafta = Math.max(0, Math.ceil((EXAM - Date.now()) / 604800000));
    ps('bugun', 3, hafta + ' hafta', hafta + ' semanas');

    // --- YKS ---
    const yt = totalOf(YKS_DATA.TYT.concat(YKS_DATA.AYT), S.yks);
    ps('yks', 1, yt.done + ' / ' + yt.total);
    let sv = 0, st = 0;
    document.querySelectorAll('tr[data-key]').forEach(function (tr2) {
      sv += Number(S.yksHafta[tr2.dataset.key]) || 0;
      st += Number(tr2.dataset.hedef) || 0;
    });
    ps('yks', 2, sv + ' / ' + st);
    const n = nextYksTopic();
    ps('yks', 3, n ? n.konu : 'Bitti', n ? n.konu : 'Hecho');

    // --- Rutin ---
    ps('rutin', 1, '%' + rp.pct);
    const rs = rutinStreak();
    ps('rutin', 2, rs + ' gün', rs + ' días');
    const jd = new Date().getDay();
    const bugunSpor = SPOR_HAFTA[jd === 0 ? 6 : jd - 1];
    ps('rutin', 3, bugunSpor ? bugunSpor.tur : '—');

    // --- Gelişim ---
    const gt = totalOf(GELISIM_DATA, S.gelisim);
    ps('gelisim', 1, gt.done + ' / ' + gt.total);
    let bitenBaslik = 0, toplamBaslik = 0, siradaki = null;
    GELISIM_DATA.forEach(function (g) {
      (g.konular || []).forEach(function (k) {
        toplamBaslik++;
        const ids = leafIds(k);
        const tam = ids.every(function (id) { return S.gelisim[id]; });
        if (tam) bitenBaslik++;
        else if (!siradaki) siradaki = g.ad;
      });
    });
    ps('gelisim', 2, bitenBaslik + ' / ' + toplamBaslik);
    ps('gelisim', 3, siradaki || 'Bitti', siradaki || 'Hecho');

    // --- Kitaplar ---
    const kc = kitapCounts();
    ps('kitap', 1, kc.done + ' / ' + kc.total);
    let bitenKat = 0, siradakiKitap = null;
    KITAP_DATA.forEach(function (kat) {
      const hepsi = kat.kitaplar.every(function (b) { return S.kitap[b.id]; });
      if (hepsi) bitenKat++;
      if (!siradakiKitap) {
        const ilk = kat.kitaplar.find(function (b) { return !S.kitap[b.id]; });
        if (ilk) siradakiKitap = ilk.ad;
      }
    });
    ps('kitap', 2, bitenKat + ' / ' + KITAP_DATA.length);
    ps('kitap', 3, siradakiKitap || 'Bitti', siradakiKitap || 'Hecho');

    // --- Yedek ---
    const yd = yedekTarihi();
    const gun = yd ? Math.floor((Date.now() - yd.getTime()) / 86400000) : null;
    ps('yedek', 1, gun === null ? 'Hiç' : (gun === 0 ? 'Bugün' : gun + ' gün önce'),
                   gun === null ? 'Nunca' : (gun === 0 ? 'Hoy' : 'hace ' + gun + ' días'));
    ps('yedek', 2, Object.keys(S.rutin).length + ' gün', Object.keys(S.rutin).length + ' días');
    let bayt = 0;
    Object.values(K).forEach(function (key) {
      try { const v = localStorage.getItem(key); if (v) bayt += v.length; } catch (e) {}
    });
    ps('yedek', 3, bayt < 1024 ? bayt + ' B' : (bayt / 1024).toFixed(1) + ' KB');
  }

  // ============================================================
  // 11. BUGÜN KARTLARI
  // ============================================================
  function renderBugun() {
    // Tarih artık kahraman alanda; buradaki rozet seriyi gösteriyor.
    const seri = streakCount();
    t(document.getElementById('seriRozet'),
      seri > 0 ? seri + ' günlük seri' : 'Seri yok',
      seri > 0 ? 'Racha de ' + seri + ' días' : 'Sin racha');

    const p = rutinPct(S.rutin[todayKey()]);
    t(document.getElementById('bRutin'), p.done + ' / ' + p.total + ' madde', p.done + ' / ' + p.total + ' puntos');
    t(document.getElementById('bRutinAlt'),
      p.pct >= RUTIN_ESIK ? 'bugün seriye sayıldı' : '%' + p.pct + ' · %' + RUTIN_ESIK + "'te sayılır",
      p.pct >= RUTIN_ESIK ? 'hoy cuenta para la racha' : p.pct + '% · cuenta al ' + RUTIN_ESIK + '%');

    const n = nextYksTopic();
    t(document.getElementById('bYks'), n ? n.konu : 'Bütün konular bitti', n ? n.konu : 'Todos los temas hechos');
    t(document.getElementById('bYksAlt'), n ? n.ders : 'tekrar zamanı', n ? n.ders : 'hora de repasar');

    const g = totalOf(GELISIM_DATA, S.gelisim);
    t(document.getElementById('bGelisim'), g.done + ' madde tamam', g.done + ' puntos hechos');
    const k = kitapCounts();
    t(document.getElementById('bGelisimAlt'),
      k.done + ' kitap bitti', k.done + ' libros terminados');

    renderTabCounts();
    renderStrips();
  }

  // ============================================================
  // 12. OLAYLAR
  // ============================================================
  // Kutucuk işaretlenince listeyi BAŞTAN ÇİZMİYORUZ — yoksa açık
  // akordiyonlar kapanır ve sayfa zıplar. Sadece etkilenen sayaç,
  // bar ve özet güncelleniyor.
  function refreshAcc(el, list, state) {
    const acc = el.closest('.acc');
    if (!acc) return;
    const gid = acc.dataset.grp;
    const grup = list.find(g => g.id === gid);
    if (!grup) return;
    const p = groupProgress(grup, state);
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    const cEl = acc.querySelector('[data-count="' + gid + '"]');
    if (cEl) cEl.textContent = p.done + '/' + p.total;
    const fEl = acc.querySelector('[data-fill="' + gid + '"]');
    if (fEl) fEl.style.width = pct + '%';
  }

  function refreshTotals(list, state, fillId, pctId, subId, barsId, birim, birimEs) {
    const tot = totalOf(list, state);
    const pct = tot.total ? Math.round((tot.done / tot.total) * 100) : 0;
    const f = document.getElementById(fillId); if (f) f.style.width = pct + '%';
    const p = document.getElementById(pctId); if (p) p.textContent = '%' + pct;
    setRing(fillId.replace('Fill', 'Ring'), pct);
    t(document.getElementById(subId),
      tot.done + ' / ' + tot.total + ' ' + birim,
      tot.done + ' / ' + tot.total + ' ' + birimEs);
    const b = document.getElementById(barsId); if (b) b.innerHTML = barsHTML(list, state);
  }

  document.addEventListener('change', function (e) {
    const el = e.target;
    if (!el.dataset || !el.dataset.box) return;
    const box = el.dataset.box, id = el.dataset.id, on = el.checked;

    if (box === 'yks') {
      if (on) S.yks[id] = true; else delete S.yks[id];
      save(K.yks, S.yks);
      refreshAcc(el, YKS_DATA.TYT.concat(YKS_DATA.AYT), S.yks);
      refreshTotals(YKS_DATA.TYT.concat(YKS_DATA.AYT), S.yks,
        'yksFill', 'yksPct', 'yksSub', 'yksBars', 'konu', 'temas');
    } else if (box === 'gelisim') {
      if (on) S.gelisim[id] = true; else delete S.gelisim[id];
      save(K.gelisim, S.gelisim);
      refreshAcc(el, GELISIM_DATA, S.gelisim);
      refreshTotals(GELISIM_DATA, S.gelisim,
        'gelisimFill', 'gelisimPct', 'gelisimSub', 'gelisimBars', 'madde', 'puntos');
    } else if (box === 'kitap') {
      if (on) S.kitap[id] = true; else delete S.kitap[id];
      save(K.kitap, S.kitap);
      const acc = el.closest('.acc');
      if (acc) {
        const kat = KITAP_DATA.find(k => k.kitaplar.some(b => b.id === id));
        const cEl = acc.querySelector('.acc-c');
        if (kat && cEl) cEl.textContent = kat.kitaplar.filter(b => S.kitap[b.id]).length + '/' + kat.kitaplar.length;
      }
      const k = kitapCounts();
      t(document.getElementById('kitapSub'),
        k.done + ' / ' + k.total + ' kitap bitti', k.done + ' / ' + k.total + ' libros terminados');
    } else if (box === 'rutin') {
      const d = rutinDay();
      if (on) d[id] = true; else delete d[id];
      save(K.rutin, S.rutin);
      const p = rutinPct(S.rutin[todayKey()]);
      const f = document.getElementById('rutinFill'); if (f) f.style.width = p.pct + '%';
      const pe = document.getElementById('rutinPct'); if (pe) pe.textContent = '%' + p.pct;
      t(document.getElementById('rutinSub'),
        p.done + ' / ' + p.total + ' madde · gün %' + RUTIN_ESIK + ' dolunca seriye sayılır',
        p.done + ' / ' + p.total + ' puntos · cuenta para la racha al ' + RUTIN_ESIK + '%');
      setRing('rutinRing', p.pct);
      const rs = rutinStreak();
      t(document.getElementById('rutinSeri'),
        rs > 0 ? rs + ' günlük rutin serisi' : 'Rutin serisi henüz başlamadı.',
        rs > 0 ? 'Racha de rutina de ' + rs + ' días' : 'La racha de rutina aún no ha empezado.');
    }

    const lbl = el.closest('label');
    if (lbl) lbl.classList.toggle('on', on);
    renderBugun();
    renderSimdi();
    applyLang(getLang());
  });

  document.addEventListener('input', function (e) {
    if (!e.target.classList || !e.target.classList.contains('kota-i')) return;
    const key = e.target.dataset.key;
    const v = Math.max(0, Number(e.target.value) || 0);
    S.yksHafta[key] = v;
    save(K.yksHafta, S.yksHafta);
    const tr = e.target.closest('tr');
    const hedef = Number(tr.dataset.hedef) || 0;
    const pct = hedef ? Math.min(100, Math.round((v / hedef) * 100)) : 0;
    const fill = tr.querySelector('.bar.xs i');
    if (fill) { fill.style.width = pct + '%'; fill.className = pct >= 100 ? 'ok' : ''; }
    const tbody = tr.closest('tbody');
    let sv = 0, st = 0;
    tbody.querySelectorAll('tr[data-key]').forEach(r => {
      sv += Number(S.yksHafta[r.dataset.key]) || 0;
      st += Number(r.dataset.hedef) || 0;
    });
    const tEl = tbody.querySelector('[data-kota-t]');
    if (tEl) tEl.textContent = sv + ' / ' + st + ' (%' + (st ? Math.round((sv / st) * 100) : 0) + ')';
  });

  document.addEventListener('click', function (e) {
    const lb = e.target.closest('.lang-btn');
    if (lb) { setLang(lb.dataset.lang); return; }

    if (e.target.closest('#checkinBtn')) {
      const c = checkins(), k = todayKey();
      if (c[k]) delete c[k]; else c[k] = true;
      save(K.motiv, S.motiv);
      renderCheckin();
      renderYearGrid();
      if (window.heroTazele) window.heroTazele();
      applyLang(getLang());
      return;
    }

    if (e.target.closest('#btnYedek')) {
      indir(stateObj(), 'panel-yedek-' + todayKey() + '.json');
      yedekAlindi();
      return;
    }

    if (e.target.closest('#themeBtn')) { toggleTheme(); return; }

    if (e.target.closest('#btnGeri')) {
      document.getElementById('fileGeri').click();
      return;
    }
  });

  const fg = document.getElementById('fileGeri');
  if (fg) fg.addEventListener('change', function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = function () {
      try {
        const d = JSON.parse(rd.result);
        if (!d || !d.keys) throw new Error('format');
        Object.keys(d.keys).forEach(k => {
          if (Object.values(K).indexOf(k) === -1) return;
          try { localStorage.setItem(k, d.keys[k]); } catch (err) {}
        });
        location.reload();
      } catch (err) {
        alert('Yedek dosyası okunamadı.');
      }
    };
    rd.readAsText(f);
  });

  // ============================================================
  // 12b. SEKMELER
  // Sayfa tek uzun kaydırma değil: her sekme ayrı bir ekran.
  // Panel her açıldığında "Bugün" gelir — günlük iş orası.
  // ============================================================
  const SEKMELER = ['bugun', 'yks', 'rutin', 'gelisim', 'kitap', 'yedek'];

  function setTab(ad, kaydir) {
    if (SEKMELER.indexOf(ad) === -1) ad = 'bugun';
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('on', p.id === 'p-' + ad);
    });
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === ad);
      b.setAttribute('aria-selected', b.dataset.tab === ad ? 'true' : 'false');
    });
    // Sekme rengi sistemi buna bakıyor: :root[data-tab="..."]
    document.documentElement.setAttribute('data-tab', ad);
    if (kaydir) window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + ad); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    const tb = e.target.closest('.tab');
    if (tb) { setTab(tb.dataset.tab, true); return; }
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); setTab(go.dataset.go, true); }
  });

  window.addEventListener('scroll', function () {
    const bar = document.getElementById('topBar');
    if (bar) bar.classList.toggle('stuck', window.scrollY > 8);
  }, { passive: true });

  // ============================================================
  // 12c. ARKA PLAN GÖRSELİ
  // Klasörde arka.jpg / arka.png varsa kahraman şeridin zemini o olur.
  // Yoksa çizilmiş kampüs cephesi (arka.svg) kalır. Fotoğraf konunca
  // üstüne kiraz-mavi duotone örtü geliyor, yazı okunur kalsın diye.
  // ============================================================
  (function arkaFoto() {
    const band = document.getElementById('heroBand');
    if (!band) return;
    // Tek dosya yokluyoruz (arka.jpg). Birden çok uzantı denemek
    // konsolu gereksiz 404'lerle dolduruyordu.
    const im = new Image();
    im.onload = function () {
      band.style.setProperty('--foto', 'url("arka.jpg")');
      band.classList.add('foto');
    };
    im.src = 'arka.jpg';
  })();

  // ============================================================
  // 12d. KAHRAMAN GÖRSELİ
  //
  // Kütüphane yok, üçüncü parti yok. Saf canvas, birkaç kilobayt,
  // sayfa açılır açılmaz çalışıyor — Lusion gibi sitelerin on saniyelik
  // yükleme ekranı olmadan.
  //
  // Çizilen şey süs değil, senin verin:
  //   · Yay soldan (Türkiye) sağa (ABD) uzanıyor.
  //   · Yayın parlak kısmı geçen zaman kadar.
  //   · Yay üzerindeki ışıklı noktalar İŞARETLEDİĞİN GÜNLER.
  //     Her check-in bir ışık daha ekliyor.
  //   · Baştaki büyük nokta bugünkü konumun; nabız gibi atıyor.
  //
  // Sekme arkadayken ve "hareketi azalt" açıkken duruyor.
  // ============================================================
  (function heroCanvas() {
    const cv = document.getElementById('heroCanvas');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');

    let W = 0, H = 0, DPR = 1;
    let yildizlar = [], gunler = [], ilerleme = 0, oran = 0;
    let calisiyor = true, t0 = performance.now();

    const azHareket = (function () {
      try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
      catch (e) { return false; }
    })();

    // Canvas artık tüm ekranı kaplıyor (position:fixed). Yıldızlar
    // her yerde, yol ise sadece kahraman şeridin bulunduğu bantta.
    let bandY = 0, bandH = 400;

    function bandiOlc() {
      const band = document.getElementById('heroBand');
      if (!band) return;
      const r = band.getBoundingClientRect();
      bandY = r.top;
      bandH = r.height;
    }

    function boyutla() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, window.innerWidth);
      H = Math.max(1, window.innerHeight);
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bandiOlc();
      yildizVer();
    }

    function yildizVer() {
      yildizlar = [];
      const n = Math.round(Math.min(190, (W * H) / 6200));
      for (let i = 0; i < n; i++) {
        yildizlar.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.25 + 0.25,
          a: Math.random() * 0.45 + 0.10,
          h: Math.random() * 0.5 + 0.25,      // faz
          v: Math.random() * 0.10 + 0.02      // sürüklenme
        });
      }
    }

    // Yol: şeridin alt bandında, içeriğin altından geçiyor.
    // Kendi alanı var ki kartların arkasında kaybolmasın.
    function P(u) {
      const taban = bandY + bandH - 34;        // yolun oturduğu çizgi
      const yay   = Math.min(96, bandH * 0.17); // kavis yüksekliği
      const x0 = W * 0.07, y0 = taban;
      const cx = W * 0.50, cy = taban - yay * 2;
      const x1 = W * 0.93, y1 = taban - yay * 0.55;
      const m = 1 - u;
      return {
        x: m * m * x0 + 2 * m * u * cx + u * u * x1,
        y: m * m * y0 + 2 * m * u * cy + u * u * y1
      };
    }

    // Panelin verisi: yılın ne kadarı geçti, hangi günler işaretli
    function veriyiAl() {
      const simdi = Date.now();
      const toplam = Math.max(1, EXAM - START);
      oran = Math.min(1, Math.max(0, (simdi - START) / toplam));

      const c = (S.motiv && S.motiv.checkins) || {};
      gunler = [];
      Object.keys(c).forEach(function (k) {
        if (!c[k]) return;
        const d = new Date(k + 'T12:00:00');
        if (isNaN(d)) return;
        const u = (d - START) / toplam;
        if (u >= 0 && u <= 1) gunler.push(u);
      });
      gunler.sort(function (a, b) { return a - b; });
    }

    function ciz(zaman) {
      const t = (zaman - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      bandiOlc();

      // 1. Yıldızlar — kaydırdıkça hafif paralaks, uzay derinlik kazansın
      const kay = (window.scrollY || 0) * 0.06;
      for (let i = 0; i < yildizlar.length; i++) {
        const s = yildizlar[i];
        const p = azHareket ? 1 : 0.55 + 0.45 * Math.sin(t * s.h + i);
        let y = s.y - kay * (0.4 + s.r * 0.5);
        y = ((y % (H + 40)) + H + 40) % (H + 40) - 20;
        ctx.globalAlpha = s.a * p;
        ctx.fillStyle = i % 7 === 0 ? '#ff5b7a' : (i % 5 === 0 ? '#6aa8ff' : '#ffffff');
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832); ctx.fill();
        if (!azHareket) { s.x += s.v; if (s.x > W + 2) s.x = -2; }
      }
      ctx.globalAlpha = 1;

      // Yol ekrandan çıktıysa çizme
      if (bandY + bandH < -40 || bandY > H + 40) {
        if (calisiyor) requestAnimationFrame(ciz);
        return;
      }

      // 2. Yayın tamamı — sönük
      ctx.beginPath();
      for (let u = 0; u <= 1.0001; u += 0.01) {
        const q = P(u);
        if (u === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([5, 7]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Geçen kısım — kırmızıdan maviye, parlak
      ilerleme += (oran - ilerleme) * 0.06;
      if (ilerleme > 0.002) {
        const a = P(0), b = P(ilerleme);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, '#ff2d55');
        g.addColorStop(1, '#3d8bff');
        ctx.beginPath();
        for (let u = 0; u <= ilerleme; u += 0.004) {
          const q = P(u);
          if (u === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255,45,85,0.85)';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 4. İşaretlenen günler — yay üzerinde ışıklar
      for (let i = 0; i < gunler.length; i++) {
        const u = gunler[i];
        if (u > ilerleme + 0.002) continue;
        const q = P(u);
        const par = azHareket ? 1 : 0.75 + 0.25 * Math.sin(t * 1.6 + i * 0.7);
        const kar = u;  // yolun neresinde: kırmızıdan maviye
        const R = Math.round(255 + (61 - 255) * kar);
        const G = Math.round(45 + (139 - 45) * kar);
        const B = Math.round(85 + (255 - 85) * kar);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2.6, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + R + ',' + G + ',' + B + ',' + (0.85 * par) + ')';
        ctx.shadowColor = 'rgb(' + R + ',' + G + ',' + B + ')';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Bugünkü konum — nabız
      if (ilerleme > 0.002) {
        const q = P(ilerleme);
        const nabiz = azHareket ? 0 : (Math.sin(t * 2.1) + 1) / 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 6 + nabiz * 9, 0, 6.2832);
        ctx.fillStyle = 'rgba(255,45,85,' + (0.16 - nabiz * 0.12) + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4.2, 0, 6.2832);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff2d55'; ctx.shadowBlur = 18;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // 6. İki uç: TR ve ABD
      const uc = [
        { p: P(0), c: '#ff2d55', ad: 'TR',  hiza: 'left'  },
        { p: P(1), c: '#3d8bff', ad: 'ABD', hiza: 'right' }
      ];
      for (let i = 0; i < uc.length; i++) {
        const e = uc[i];
        ctx.beginPath(); ctx.arc(e.p.x, e.p.y, 3.4, 0, 6.2832);
        ctx.fillStyle = e.c; ctx.shadowColor = e.c; ctx.shadowBlur = 14;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = '600 10px ui-monospace, "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.40)';
        ctx.textAlign = e.hiza === 'left' ? 'left' : 'right';
        ctx.fillText(e.ad, e.p.x + (e.hiza === 'left' ? 10 : -10), e.p.y + 3.5);
      }

      if (calisiyor) requestAnimationFrame(ciz);
    }

    function baslat() {
      boyutla(); veriyiAl();
      requestAnimationFrame(ciz);
    }

    let zamanlayici;
    window.addEventListener('resize', function () {
      clearTimeout(zamanlayici);
      zamanlayici = setTimeout(boyutla, 160);
    });

    document.addEventListener('visibilitychange', function () {
      calisiyor = !document.hidden;
      if (calisiyor) { t0 = performance.now(); requestAnimationFrame(ciz); }
    });

    // Check-in yapılınca yeni ışık hemen görünsün
    window.heroTazele = veriyiAl;

    baslat();
  })();

  // ============================================================
  // 13. BAŞLAT
  // ============================================================
  function renderAll(force) {
    renderYks();
    renderKota(force);
    renderRutin();
    renderGelisim();
    renderKitap();
    renderBugun();
    renderCheckin();
    renderCounters();
    renderYearGrid();
    renderYedek();
    renderSimdi();
    applyLang(getLang());
  }

  HAZIR = true;
  renderAll(false);
  setTab((location.hash || '').replace('#', '') || 'bugun', false);
  setInterval(function () { renderCounters(); renderSimdi(); }, 1000);

})();
