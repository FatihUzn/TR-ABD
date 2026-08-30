# TR → ABD Paneli · REV 7.0

Tek sayfalık operasyon paneli. Bağımlılık yok, derleme yok, sunucu yok —
düz statik dosyalar. GitHub Pages'te olduğu gibi çalışır.

## Tasarım fikri

Panelin tek cümlesi var: kırmızıdan maviye gitmek. Kırmızı (Dark Cherry)
Türkiye, mavi (Light Blue) ABD. Her ilerleme çubuğu, yıl ızgarasındaki
her kare kırmızıdan başlayıp maviye gidiyor — renk dekor değil, yön.
Palet iPhone 18 Pro bitişlerinden alındı.

Etiketler de gökkuşağı değil, üç anlam katmanı:
kiraz = asıl iş (YKS) · mavi = yatırım (spor, dil, kültür) ·
gümüş = altyapı (uyku, beslenme, temel).

## Nasıl çalışır

Sayfa **sekmeli**: Bugün · YKS · Rutin · Gelişim · Kitaplar · Yedek.
Panel her açıldığında Bugün gelir — günlük iş orası. Sekme başlıklarındaki
küçük rozetler o bölümün durumunu sekmeye girmeden gösterir.
Sık bakılmayan içerik (kaynaklar, denemeler, hedef tabloları) YKS
sekmesinde kapalı akordiyonların içinde.


- **Bilgisayarda:** `index.html` dosyasını çift tıkla.
- **Telefonda:** GitHub Pages adresini aç, tarayıcı menüsünden
  "Ana ekrana ekle" de. Uygulama gibi açılır, ilk açılıştan sonra
  çevrimdışı da çalışır.

Her iki yerde de panel tam çalışır: işaretlersin, sayar, seri tutar.

## Şu an senkron yok

Veri tarayıcının localStorage'ında durduğu için **her cihaz kendi kaydını
tutar.** Bilgisayarda işaretlediğin telefona gelmez, telefonda
işaretlediğin bilgisayara gelmez.

Şimdilik çözüm: **Yedekleme → Yedek al** ile JSON indir, öbür cihazda
**Yedekten geri yükle** ile aç. Kalıcı senkron sonra kurulacak.

## Yedekleme

Panel 30 gün yedek alınmazsa Bugün bölümünde uyarır.
Tarayıcı verisini temizlemek bir yıllık kaydı siler — yedeği ciddiye al.

## Yayınlamak

`yayinla.bat` dosyasını çift tıkla. Değişiklikleri commit'leyip GitHub'a
gönderir; site birkaç dakika içinde güncellenir.

**Önemli:** panelde değişiklik yapıp yayınlarken `sw.js` içindeki `SURUM`
sabitini bir artır. Yoksa telefon eski sürümü önbellekten göstermeye
devam eder.

## Dosyalar

| Dosya | İşi |
|---|---|
| `index.html` | Sayfa iskeleti ve tüm sabit metin (TR + ES) |
| `style.css` | Tasarım sistemi, açık/koyu tema |
| `app.js` | Veri (YKS konuları, rutin, kitaplar), durum, çizim |
| `sw.js` | Çevrimdışı çalışma — değişiklikte `SURUM`'u artır |
| `manifest.webmanifest` | Telefona kurulum bilgisi |
| `fonts/` | Inter + JetBrains Mono (yerel, internet gerekmez) |
| `yayinla.bat` | Tek tıkla GitHub'a gönderme |

## Sabitler (`app.js` başı)

- `START` — sayacın başlangıcı (29 Temmuz 2026)
- `EXAM` — sınav (19 Haziran 2027, 10:15)
- `DAY_BOUNDARY` — gün 04:00'te biter
- `RUTIN_ESIK` — günün seriye sayılması için gereken yüzde (70)

localStorage anahtarları eski panelden korundu; işaretlemeler taşındı.
