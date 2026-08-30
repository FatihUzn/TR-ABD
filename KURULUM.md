# TR → ABD Paneli · REV 6.0

Tek sayfalık operasyon paneli. Bağımlılık yok, derleme yok.

## Nasıl kullanılır

**Bilgisayarda (tek kaynak):** `index.html` dosyasını çift tıkla.
Bütün işaretleme burada yapılır; veri bu tarayıcının hafızasında durur.

**Telefonda (ayna):** GitHub Pages adresini aç, tarayıcı menüsünden
"Ana ekrana ekle" de. Uygulama gibi açılır, çevrimdışı da çalışır.
Telefonda kutucuklar kilitlidir — sadece bakarsın.

## Telefonu güncellemek

1. Panelde **Yedekleme → Telefona gönder** düğmesine bas (`state.json` iner).
2. `senkron.bat` dosyasını çift tıkla.

Betik dosyayı İndirilenler klasöründen alır, klasöre koyar ve GitHub'a gönderir.
Birkaç dakika içinde telefondaki panel güncellenir.

## Yedekleme

**Yedekleme → Yedek al** bütün veriyi JSON olarak indirir.
30 gün geçerse panel Bugün bölümünde uyarır.
Tarayıcı verisini temizlemek bir yıllık kaydı siler — yedeği ciddiye al.

## Dosyalar

| Dosya | İşi |
|---|---|
| `index.html` | Sayfa iskeleti ve tüm sabit metin (TR + ES) |
| `style.css` | Tasarım sistemi, açık/koyu tema |
| `app.js` | Veri (YKS konuları, rutin, kitaplar), durum, çizim |
| `sw.js` | Çevrimdışı çalışma. **Panel değişince `SURUM` sabitini artır.** |
| `manifest.webmanifest` | Telefona kurulum bilgisi |
| `fonts/` | Inter + JetBrains Mono (yerel, internet gerekmez) |
| `state.json` | Telefona gönderilen durum kopyası (bilgisayarda üretilir) |
| `senkron.bat` | Tek tıkla GitHub'a gönderme |

## Sabitler (`app.js` başı)

- `START` — sayacın başlangıcı (29 Temmuz 2026)
- `EXAM` — sınav (19 Haziran 2027, 10:15)
- `DAY_BOUNDARY` — gün 04:00'te biter
- `RUTIN_ESIK` — günün seriye sayılması için gereken yüzde (70)

localStorage anahtarları eski panelden korundu; işaretlemeler taşındı.
