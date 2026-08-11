# Almanya Paneli — Arka Plan Slayt Gösterisi — Durum Özeti

Bu dosya, token limiti nedeniyle sohbet yarıda kalırsa yeni bir sohbette
Claude'un (veya sana) neyi neden yaptığımızı hızlıca anlatması için hazırlandı.
Bu dosyayı + ilgili ekran görüntüsünü/dosyaları yeni sohbete yükleyip
"kaldığımız yerden devam" dersen yeterli olur.

## NE YAPIYORUZ (hedef)

Sitedeki (almanya-paneli) sabit arka plan fotoğrafı yerine, **11 kale
fotoğrafının sırayla, otomatik olarak, hiçbir efekt (blur/karartma
gradyanı/saydamlık) olmadan** döngüyle değiştiği bir arka plan istendi.
Bu özellik **tüm sayfalarda** (sistem/almanca/yks/finans/evrak/blog) aynı
şekilde çalışmalı.

## NASIL ÇÖZÜLDÜ (teknik yaklaşım)

- JS'e gerek kalmadan, **saf CSS `@keyframes` animasyonu** ile çözüldü.
- `core.css` içine `castleSlideshow` adında tek bir keyframe animasyonu
  eklendi. 11 fotoğrafı sırayla gösterir, her biri ~8 saniye
  (`--slide-duration: 88s` değişkeniyle tek yerden ayarlanabilir).
- Bu animasyon **hem `body::before` (genel sayfa zemini) hem `header::before`
  (üst hero bandı)** için kullanılıyor → ikisi her zaman birebir SENKRON,
  aynı anda aynı kaleyi gösteriyor.
- `core.css` her sayfada zaten yükleniyor (core.css → core.js gibi ortak
  dosya), bu yüzden slayt gösterisi otomatik olarak TÜM sayfalarda çalışıyor.
- Eski `filter: blur(...) saturate(...) brightness(...)` ve karartma
  `linear-gradient(...)` overlay'leri tamamen KALDIRILDI — foto ham haliyle
  gösteriliyor, hiçbir efekt yok.
- Eskiden her sayfanın kendi ayrı fotoğrafı vardı
  (`body[data-page="almanca"]::before` gibi tek tek override'lar).
  Bunların hepsi silindi, artık tek ortak sistem var.

## DOSYA/KLASÖR YAPISI

- Fotoğraflar: `Studio/castels/` klasöründe (kullanıcı bu ismi kullanıyor,
  "castles" değil — dikkat, yazım hatası gibi görünse de KASITLI, öyle
  bırakılmalı çünkü kullanıcının gerçek klasörü bu isimde).
- Dosya adları: `castle-01-segovia.webp`, `castle-02-eltz.webp`,
  `castle-03-iasi.webp`, `castle-04-neuschwanstein-aerial.webp`,
  `castle-05-mont-saint-michel.webp`, `castle-06-neuschwanstein-wide.webp`,
  `castle-07-hohenzollern-sunset.webp`, `castle-08-neuschwanstein-autumn.webp`,
  `castle-09-san-marino.webp`, `castle-10-hohenzollern-dusk.webp`,
  `castle-11-neuschwanstein-fog.webp` (bu 11 dosya kullanıcının bilgisayarında
  zaten mevcut, tekrar üretmeye/yüklemeye GEREK YOK).

## HANGİ DOSYALAR DEĞİŞTİRİLDİ

1. **core.css** ✅ tamamlandı
   - `castleSlideshow` keyframe animasyonu eklendi
   - `body::before` ve `header::before` bu animasyona bağlandı
   - Eski sayfa-bazlı (`data-page="X"::before`) foto override'larının hepsi silindi
   - Eski blur/gradyan efektleri kaldırıldı

2. **index.html** ✅ tamamlandı
   - Önceki denemede eklenen manuel "‹ Foto Dene ›" switcher (buton+JS) TAMAMEN
     kaldırıldı (artık otomatik olduğu için gerek kalmadı)
   - `sistem.css` gerçek dosyası incelenip düzeltildiği için, index.html'e
     eklenen geçici inline `<style>` yaması da kaldırıldı (artık gereksiz)

3. **sistem.css** ✅ tamamlandı
   - `.dash-photo-band::before` kuralı (üst hero bandının fotoğrafı) düzeltildi:
     - Kırık/silinmiş `url("Studio/gallery9.webp")` referansı kaldırıldı
     - `filter: blur(8px) saturate(0.82) brightness(0.94)` kaldırıldı
     - `castleSlideshow` animasyonuna bağlandı (core.css > body/header ile senkron)

4. **blog.css, finans.css, evrak.css, almanca.css** ✅ KONTROL EDİLDİ, DOKUNULMADI
   - Bu 4 dosyada `background-image`, `url(...)`, `Studio/`, `.webp` veya
     arka-plan ile ilgili `filter: blur` YOK. Sadece o sayfaya özel bileşen
     stilleri var (kartlar, formlar, grafikler vb.)
   - **Bu dosyalarda yapılacak HİÇBİR ŞEY YOK**, temiz.
   - (blog.css'teki tek `backdrop-filter:blur(3px)` küçük bir tarih
     rozetinin arka planında — arka plan fotoğraf sistemiyle ilgisi yok,
     dokunulmadı.)

## HENÜZ GÖRÜLMEYEN / KONTROL EDİLMESİ GEREKEN DOSYALAR

Aşağıdaki `.html` dosyaları henüz Claude'a yüklenmedi. Bu sayfalarda,
sistem.css'teki gibi `.dash-photo-band` benzeri sayfa-özel bir "hero foto
bandı" varsa, o da sistem.css'e yapılan düzeltmenin AYNISI ile düzeltilmeli
(kırık `Studio/xxx.webp` referansı varsa castleSlideshow'a bağlanmalı, blur
kaldırılmalı). Kontrol edilmesi gerekenler:

- `almanca.html` (+ olası almanca.css'te olmayan ama html içinde inline
  style/hero foto olabilir — css'te YOK ama html'de <style> etiketi
  olabilir, kontrol edilmeli)
- `yks.html` + `yks.css` (yks.css hiç yüklenmedi, kontrol edilmeli)
- `finans.html` (finans.css temiz ama html'de ayrı hero olabilir)
- `evrak.html` (evrak.css temiz ama html'de ayrı hero olabilir)
- `blog.html` (blog.css temiz ama html'de ayrı hero olabilir)

**Not:** core.css'teki genel `header::before` zaten tüm `<header>` etiketi
kullanan sayfalarda otomatik çalışıyor (çünkü core.css ortak). Yani bu
sayfalarda EK bir sorun OLMAYABİLİR — sadece sistem.css'teki gibi
"sayfaya özel üst bant" (dash-photo-band gibi) varsa oraya bakmak gerekiyor.
Riskli tek nokta: silinmiş fotoğraflara (harvard1.webp, forest-light.webp,
terraces.webp, hillside-cabins.webp, settled-green.webp, river-glimpse.webp)
başka bir dosyada hardcoded referans kalmış olması.

## SONRAKİ ADIM

Kullanıcıdan şu dosyaları iste (eğer yeni sohbette bu nottan devam
ediliyorsa): `yks.css`, `almanca.html`, `yks.html`, `finans.html`,
`evrak.html`, `blog.html`. Her birinde yukarıdaki "kırık foto referansı /
blur" deseni aranıp bulunursa sistem.css'e yapılan düzeltmenin birebir aynısı
uygulanır: eski `url("Studio/....webp")` + `filter: blur(...)` satırları
silinip, yerine `background-image:url("Studio/castels/castle-01-segovia.webp");`
+ `animation: castleSlideshow var(--slide-duration) infinite;` yazılır.

## GÜNCEL, TAMAMLANMIŞ DOSYALAR (bu mesajla birlikte paylaşıldı)

- `index.html`
- `core.css`
- `sistem.css`

Bunları kullanıcı kendi projesindeki aynı isimli dosyaların ÜZERİNE
yazabilir, üçü de son haliyle hazır.
