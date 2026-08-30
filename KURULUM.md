# TR → ABD Paneli · REV 11.0

Tek sayfalık operasyon paneli. Bağımlılık yok, derleme yok, sunucu yok —
düz statik dosyalar. GitHub Pages'te olduğu gibi çalışır.

## Tasarım fikri

Siyah uzay, kocaman tipografi, kırmızıdan maviye giden bir yol.

Kahraman şeridin altındaki yay süs değil, panelin verisi:

- Yay soldan (TR) sağa (ABD) uzanıyor.
- Parlak kısım geçen zaman kadar; kırmızıdan maviye dönüyor.
- Yay üzerindeki ışıklı noktalar **işaretlediğin günler.** Her check-in
  bir ışık daha ekliyor.
- Baştaki beyaz nokta bugünkü konumun, nabız gibi atıyor.

Yıldızlar tüm sayfayı kaplıyor; kaydırdıkça hafif paralaksla akıyorlar.
Kartlar saydam, uzay içlerinden görünüyor.

Kütüphane yok, üçüncü parti yok — saf canvas, birkaç kilobayt. Sekme
arkadayken, yol ekrandan çıktığında ve "hareketi azalt" açıkken çizim
durur.

## Renk kuralı

Nerede hangi renk, ne oranda:

| Oran | Ne | Nerede |
|---|---|---|
| ~70% | Nötr | Siyah zemin, beyaz başlık, gri ikincil metin |
| ~20% | Sekme rengi | Başlık çubuğu, alt başlıklar, halka, yüzde, kart çizgisi, kutucuklar, aktif sekme, düğme |
| ~10% | Gradyan | Sadece zamanla ilgili şeyler: yol, ilerleme çubukları, yıl ızgarası, geri sayım, logo |

**Sekme rengi yolun neresinde olduğunu gösteriyor.** Soldan sağa
gezinirken renk kırmızıdan maviye yürüyor:

| Sekme | Renk |
|---|---|
| Bugün | `#ff2d55` kırmızı |
| YKS | `#f5479b` pembe |
| Rutin | `#c65cd8` mor |
| Gelişim | `#8a6ff0` menekşe |
| Kitaplar | `#5c7fff` mavi-mor |
| Yedek | `#3d8bff` mavi |

Etiketler (YKS / SPOR / TEMEL) kendi anlamlarını koruyor ama sessiz:
içi boş, ince kenarlı. Yüksek sesle konuşan tek renk sekmenin rengi
olsun ki göz nereye bakacağını bilsin.

Kırmızı = asıl iş · mavi = yatırım (spor, dil, kültür) · gri = altyapı.

Varsayılan tema siyah. Açık tema düğmesi duruyor ve aynı yürüyüşü
koyulaştırılmış tonlarla yapıyor.

## Arka plan fotoğrafı

Klasöre **`arka.jpg`** adında bir görsel koyarsan canvas'ın altına
girer, sönük ve gri tonlu bir katman olarak. Dosya yoksa şerit saf
siyah kalır.

Telifli bir fotoğrafı (üniversite tanıtım görselleri dahil) herkese açık
bir depoya koymak hak ihlali olur — kendi çektiğin ya da lisansı uygun
bir görsel kullan.

## Nasıl çalışır

Sayfa **sekmeli**: Bugün · YKS · Rutin · Gelişim · Kitaplar · Yedek.
Sekmeler sayfanın en üstünde, marka satırının altında sabit duruyor —
nereye kaydırırsan kaydır elinin altında.

Panel her açıldığında Bugün gelir; günlük iş orası. Sekme
rozetleri (%8, %32, 2/21) o bölümün durumunu girmeden gösterir.

**Her sekme kendi sayfası gibi:** kendi numarası ve üst yazısı
(01 GÜNLÜK KONTROL, 02 ASIL İŞ, 03 GÜNÜN İSKELETİ…), kendi rengi ve
kendi üç rakamlık özet şeridi var. Sekme değişince sayfanın tamamı —
başlıklar, halkalar, kutucuklar, arka plan ışıltısı — o renge geçiyor.

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
