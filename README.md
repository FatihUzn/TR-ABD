# TR → ABD Paneli · REV 13.0

Tek sayfalık operasyon paneli. Bağımlılık yok, derleme yok, sunucu yok —
düz statik dosyalar. GitHub Pages'te olduğu gibi çalışır.

## Tasarım fikri

Açık zemin, boydan boya arka plan görseli, kutusuz düzen.

Zemindeki görsel `assets/arka.svg` — kendi çizdiğim bir sahne: gökyüzü, uzak
şehir silueti ve önde kubbeli, sütunlu bir üniversite binası. Hedefin
kendisi arka planda duruyor. Telifi yok.

**Kendi fotoğrafını koymak için:** klasöre `arka.jpg` bırak, panel
onu bulur ve zemin olarak kullanır. Üstündeki beyaz perde sayesinde
hangi fotoğrafı koyarsan koy yazılar okunur kalır. Silersen çizim
geri gelir.

Kart, çerçeve ve gölge yok. Ayırıcı olarak sadece saç teli çizgiler
ve boşluk var, böylece arka plan görseli baştan sona görünüyor.

Kahraman alandaki yol yine panelin verisi: soldan (TR) sağa (ABD)
uzanan yay, parlak kısmı geçen zaman kadar, üzerindeki noktalar
işaretlediğin günler.

## Renk kuralı

Nerede hangi renk, ne oranda:

| Oran | Ne | Nerede |
|---|---|---|
| ~70% | Nötr | Açık zemin, koyu lacivert metin, gri ikincil metin |
| ~20% | Sekme rengi | Başlık çubuğu, alt başlıklar, halka, yüzde, kart çizgisi, kutucuklar, aktif sekme, düğme |
| ~10% | Gradyan | Sadece zamanla ilgili şeyler: yol, ilerleme çubukları, yıl ızgarası, geri sayım, logo |

**Mavi taşıyıcı, kırmızı vurgu.** Kırmızı büyük ve kalın olduğu yerde
kullanılıyor: ana başlıklar, rakamlar, ilerleme, ok. Gövde metni koyu
lacivert — kırmızı 13 punto metinde göz yorar ve bu panel bir yıl
okunacak.

**Sekme rengi yolun neresinde olduğunu gösteriyor.** Soldan sağa
gezinirken renk kırmızıdan maviye yürüyor:

| Sekme | Renk |
|---|---|
| Bugün | `#c8102e` kırmızı |
| YKS | `#b01050` bordo-pembe |
| Rutin | `#8a1a86` mor |
| Gelişim | `#5b2aa8` menekşe |
| Kitaplar | `#2a3fb4` lacivert |
| Yedek | `#0a4fb4` mavi |

Etiketler (YKS / SPOR / TEMEL) kendi anlamlarını koruyor ama sessiz:
içi boş, ince kenarlı. Yüksek sesle konuşan tek renk sekmenin rengi
olsun ki göz nereye bakacağını bilsin.

Kırmızı = asıl iş · mavi = yatırım (spor, dil, kültür) · gri = altyapı.

Varsayılan tema açık. Açık tema düğmesi duruyor ve aynı yürüyüşü
koyulaştırılmış tonlarla yapıyor.

## Arka plan fotoğrafı

Zemindeki görsel: **`assets/arka.jpg`**

Şu an oradaki görsel geçici bir yer tutucu — kırmızıdan maviye giden
yumuşak bir renk geçişi. Beğendiğin bir fotoğraf bulduğunda **o dosyanın
üzerine yaz, adını `arka.jpg` olarak bırak.** Başka hiçbir şey
değiştirmen gerekmiyor, panel açılışta onu kullanır.

Öneriler:
- En az 2000 piksel genişlik, yatay (16:9 ya da daha geniş)
- Üst tarafı sade olsun — başlık ve rakamlar oraya oturuyor
- 1 MB'ın altında tut, yoksa telefonda açılış yavaşlar

Üstündeki beyaz perde sayesinde hangi fotoğrafı koyarsan koy yazılar
okunur kalır; perde yukarıda ince, aşağı indikçe kalınlaşıyor.

Fotoğrafın telifine dikkat: depo herkese açık, oraya koyduğun her dosyayı
isteyen indirebilir. Kendi çektiğin ya da lisansı uygun bir görsel kullan.

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
