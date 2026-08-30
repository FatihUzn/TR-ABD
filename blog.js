// ============================================================
// blog.js — foto-öncelikli kart grid + tek yazı detay şablonu,
// ve "hafıza genişletmesi" (geçmişle karşılaştırma, fotoğraf zaman
// tüneli, haftalık kendine mektup, zaman kapsülü).
// Sadece blog.html'de yüklenir. core.js'in ÖNCE yüklenmiş olması gerekir.
//
// NOT: motivationRenderCompare/PhotoTimeline/WeeklyLetter/TimeCapsule
// fonksiyonları şu an blog.html'de karşılık gelen container'ları
// BULAMIYOR (compareBody, photoTunnel, weeklyLetter*, capsule* id'leri
// henüz sayfada yok) — yani bu blok şu anda hiçbir şey render etmiyor,
// sessizce çıkıyor. Kod duruyor çünkü ileride blog.html'e bu
// container'lar eklenirse hazır olsun; istersen bunu tamamen
// kaldırabiliriz de.
// ============================================================

  const BLOG_POSTS = [
    {
      slug: 'plan-degisti',
      draft: false,
      date: '2026-08-30',
      dateLabel: '30 Ağustos 2026',
      title: 'Plan Değişti',
      excerpt: "Almanya kapısı kapandı, ama hedef değişmedi — sadece ona giden yol yeniden çizildi: YKS, Koç Endüstri, sonra ABD.",
      image: null,
      paragraphs: [
        "Almanya planı bu ay iptal oldu. Beklediğim iki haber daha var ama ikisi de düşük ihtimalli; artık o kapıya bakarak plan yapmıyorum.",
        "İlk tepkim hayal kırıklığıydı, ama oturup baktığımda şunu gördüm: Almanya zaten nihai hedef değildi, sadece bir ara basamaktı. Nihai hedef ABD'de İktisat/İşletme yüksek lisansı — ve oraya giden başka, hatta daha kısa bir yol var.",
        "Yeni plan: bir yıl YKS'ye çalışıp Koç Üniversitesi Endüstri Mühendisliği'ne burslu yerleşmek, yaz okullarıyla iki yılda bitirmek, sonra ABD'ye başvurmak. Öğrenci işleriyle konuştum, derslerin sayılmasıyla iki yıl mümkün görünüyor. 2026'da 1.5 aylık çalışmayla 28.000 yapmıştım; taban sağlam, mesafe uzun ama ölçülebilir.",
        "Bu paneli de yeni plana göre baştan kurdum. Vize, evrak, Almanca sayfaları gitti; yerlerine YKS kaynakları, günlük rutin ve gelişim yol haritası geldi. Bu yılın tek işi sınav — spor, beslenme ve düzen onun altyapısı, kod ve dil ise sınavdan sonrasına hazırlık.",
        "Kimseye bel bağlamadan, kendi başarımla. Bu bir yıllık boşluğun hayatımı değiştirmesi lazım."
      ]
    },
    {
      slug: 'taslak-yazi',
      draft: true,
      date: '',
      dateLabel: 'TASLAK',
      title: 'Bir sonraki not',
      excerpt: "Buraya yeni bir yazı eklemek için blog.js dosyasındaki BLOG_POSTS dizisine yeni bir obje ekle.",
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
    const toolsSection = document.getElementById('blogToolsSection');
    const detailSection = document.getElementById('blogDetailSection');
    if (toolsSection) toolsSection.style.display = 'none';
    if (detailSection) detailSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function blogShowGrid() {
    const toolsSection = document.getElementById('blogToolsSection');
    const detailSection = document.getElementById('blogDetailSection');
    if (toolsSection) toolsSection.style.display = 'block';
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

  // --- 4. Geçmişle karşılaştırma, fotoğraf zaman tüneli, haftalık mektup, zaman kapsülü ---
  // --- 4. Geçmişle karşılaştırma: ~30 gün önceki en yakın kayıt ile bugünü kıyaslar ---
  function motivationFindPastSnapshot(daysAgo) {
    const state = motivationLoadState();
    const snapshots = state.snapshots || {};
    const keys = Object.keys(snapshots).sort();
    if (!keys.length) return null;
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    const targetKey = target.toISOString().slice(0, 10);
    let best = null;
    keys.forEach(function (k) { if (k <= targetKey) best = k; });
    if (!best) best = keys[0];
    return { date: best, data: snapshots[best] };
  }

  function compareStatHTML(label, thenVal, nowVal, unit) {
    const delta = nowVal - thenVal;
    const deltaCls = delta > 0 ? 'up' : 'flat';
    const deltaTxt = delta > 0 ? ('+' + delta + unit) : (delta < 0 ? (delta + unit) : '± 0' + unit);
    return '<div class="compare-stat">' +
      '<div class="compare-stat-label">' + label + '</div>' +
      '<div class="compare-stat-row">' +
        '<span class="compare-stat-then">' + thenVal + unit + '</span>' +
        '<span class="compare-stat-arrow">→</span>' +
        '<span class="compare-stat-now">' + nowVal + unit + '</span>' +
      '</div>' +
      '<div class="compare-stat-delta ' + deltaCls + '">' + deltaTxt + '</div>' +
    '</div>';
  }

  function motivationRenderCompare() {
    const body = document.getElementById('compareBody');
    if (!body) return;
    const state = motivationLoadState();
    const snapshots = state.snapshots || {};
    const keys = Object.keys(snapshots).sort();
    if (keys.length < 2) {
      body.innerHTML = '<div class="compare-empty">Karşılaştırma için henüz yeterli geçmiş veri yok. Panel her gün otomatik bir anlık görüntü kaydediyor — birkaç gün sonra burada geçmişle bugünü yan yana görebileceksin.</div>';
      return;
    }
    const past = motivationFindPastSnapshot(30);
    const nowCtx = motivationBuildProofContext();
    const yksNow = nowCtx.yksTotal > 0 ? Math.round((nowCtx.yksDone / nowCtx.yksTotal) * 100) : 0;
    const evrakTotalNow = nowCtx.evrakTrTotal + nowCtx.evrakDeTotal;
    const evrakDoneNow = nowCtx.evrakTrDone + nowCtx.evrakDeDone;
    const evrakNow = evrakTotalNow > 0 ? Math.round((evrakDoneNow / evrakTotalNow) * 100) : 0;
    const d = new Date(past.date);
    const dLabel = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const isEarliest = past.date === keys[0] && (new Date() - d) < 30 * 86400000;
    body.innerHTML =
      '<div class="compare-meta">' + (isEarliest ? dLabel + ' (ilk kayıt)' : dLabel + ' · yaklaşık 30 gün önce') + ' → bugün</div>' +
      '<div class="compare-grid">' +
        compareStatHTML('Check-in', past.data.checkins, nowCtx.totalCheckins, '') +
        compareStatHTML('Seri', past.data.streak, nowCtx.streak, 'g') +
        compareStatHTML('YKS', past.data.yksPct, yksNow, '%') +
        compareStatHTML('Evrak', past.data.evrakPct, evrakNow, '%') +
      '</div>';
  }

  // --- 13. Fotoğraf zaman tüneli: görseli olan yazıları kronolojik sırayla gösterir ---
  function motivationRenderPhotoTimeline() {
    const wrap = document.getElementById('photoTunnel');
    if (!wrap) return;
    const withPhotos = BLOG_POSTS.filter(function (p) { return !p.draft && p.image; })
      .slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!withPhotos.length) {
      wrap.innerHTML = '<div class="photo-tunnel-empty">Henüz fotoğraflı bir yazı yok — yeni bir blog yazısı görsel eklendiğinde burada zaman çizelgesine eklenir.</div>';
      return;
    }
    wrap.innerHTML = withPhotos.map(function (p) {
      return '<button type="button" class="tunnel-item" data-slug="' + p.slug + '">' +
        '<div class="tunnel-thumb" style="background-image:url(\'' + p.image + '\')"></div>' +
        '<div class="tunnel-date">' + p.dateLabel + '</div>' +
        '<div class="tunnel-title">' + p.title + '</div>' +
      '</button>';
    }).join('');
    wrap.addEventListener('click', function (e) {
      const item = e.target.closest('.tunnel-item');
      if (!item) return;
      history.replaceState(null, '', '#' + item.dataset.slug);
      blogOpenPost(item.dataset.slug);
    });
  }

  // --- 10. Haftalık kendine mektup ---
  function motivationWeekStart(d) {
    d = new Date(d);
    const day = (d.getDay() + 6) % 7; // Pazartesi = 0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  }
  function motivationWeekKey(d) {
    return motivationWeekStart(d).toISOString().slice(0, 10);
  }

  function motivationRenderWeeklyLetter() {
    const input = document.getElementById('weeklyLetterInput');
    const archive = document.getElementById('weeklyLetterArchive');
    const cap = document.getElementById('weeklyLetterCap');
    if (!input || !archive) return;
    const state = motivationLoadState();
    const letters = state.weeklyLetters || {};
    const weekKey = motivationWeekKey(new Date());
    const weekStartLabel = new Date(weekKey).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    if (cap) cap.textContent = 'Bu haftanın mektubu · ' + weekStartLabel + ' haftası';
    input.value = letters[weekKey] ? letters[weekKey].text : '';

    const pastKeys = Object.keys(letters).filter(function (k) { return k !== weekKey; }).sort().reverse();
    if (!pastKeys.length) {
      archive.innerHTML = '<div class="letter-archive-empty">Geçmiş hafta mektupların burada birikecek.</div>';
    } else {
      archive.innerHTML = pastKeys.map(function (k) {
        const label = new Date(k).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return '<div class="letter-archive-item">' +
          '<div class="letter-archive-date">' + label + ' haftası</div>' +
          '<div class="letter-archive-text">' + letters[k].text.replace(/</g, '&lt;') + '</div>' +
        '</div>';
      }).join('');
    }
  }

  function motivationSaveWeeklyLetter() {
    const input = document.getElementById('weeklyLetterInput');
    const note = document.getElementById('weeklyLetterSavedNote');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const state = motivationLoadState();
    const letters = state.weeklyLetters || {};
    const weekKey = motivationWeekKey(new Date());
    const isFirst = !letters[weekKey];
    letters[weekKey] = { text: text, savedAt: Date.now() };
    state.weeklyLetters = letters;
    motivationSaveState(state);
    if (isFirst) motivationLogEvent('✉️ Haftalık kendine mektup yazıldı.');
    if (note) {
      note.textContent = 'Kaydedildi ✓';
      note.classList.add('show');
      setTimeout(function () { note.classList.remove('show'); }, 2200);
    }
  }

  // --- 19. Bir yıl sonra okuyacağın mektup (zaman kapsülü) ---
  function motivationRenderTimeCapsule() {
    const body = document.getElementById('timeCapsuleBody');
    if (!body) return;
    const state = motivationLoadState();
    const capsule = state.timeCapsule;

    if (!capsule) {
      body.innerHTML =
        '<div class="capsule-card">' +
          '<div class="letter-card-cap">Bugün bir mektup yaz, bir yıl sonra tekrar aç</div>' +
          '<textarea class="letter-textarea" id="capsuleInput" placeholder="Bir yıl sonraki sana ne söylemek istersin? Şu an neler hissediyorsun, neyi merak ediyorsun?" rows="6"></textarea>' +
          '<div class="letter-actions">' +
            '<button type="button" class="letter-save-btn" id="capsuleSealBtn">Mühürle ve bir yıl sonra aç</button>' +
          '</div>' +
        '</div>';
      const sealBtn = document.getElementById('capsuleSealBtn');
      if (sealBtn) sealBtn.addEventListener('click', motivationSealTimeCapsule);
      return;
    }

    const unlockDate = new Date(capsule.unlockDate);
    const now = new Date();
    const writtenLabel = new Date(capsule.writtenDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const unlockLabel = unlockDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (capsule.opened) {
      body.innerHTML =
        '<div class="capsule-card">' +
          '<div class="capsule-locked-title">📬 AÇILDI</div>' +
          '<div class="capsule-text">' + capsule.text.replace(/</g, '&lt;') + '</div>' +
          '<div class="capsule-meta">' + writtenLabel + ' tarihinde yazıldı · ' + unlockLabel + ' tarihinde açıldı</div>' +
          '<button type="button" class="capsule-new-btn" id="capsuleNewBtn">Yeni bir kapsül başlat</button>' +
        '</div>';
      const newBtn = document.getElementById('capsuleNewBtn');
      if (newBtn) newBtn.addEventListener('click', function () {
        const st = motivationLoadState();
        delete st.timeCapsule;
        motivationSaveState(st);
        motivationRenderTimeCapsule();
      });
      return;
    }

    if (now >= unlockDate) {
      body.innerHTML =
        '<div class="capsule-card">' +
          '<div class="capsule-locked-icon">🔓</div>' +
          '<div class="capsule-locked-title">MEKTUP AÇILMAYA HAZIR</div>' +
          '<div class="capsule-locked-sub">' + writtenLabel + ' tarihinde kendine yazdığın mektubun kilidi açıldı.</div>' +
          '<button type="button" class="capsule-open-btn" id="capsuleOpenBtn">Mektubu Aç</button>' +
        '</div>';
      const openBtn = document.getElementById('capsuleOpenBtn');
      if (openBtn) openBtn.addEventListener('click', function () {
        const st = motivationLoadState();
        st.timeCapsule.opened = true;
        motivationSaveState(st);
        motivationLogEvent('📬 Bir yıl önce yazılan mektup açıldı.');
        motivationRenderTimeCapsule();
      });
      return;
    }

    const daysLeft = Math.ceil((unlockDate - now) / 86400000);
    body.innerHTML =
      '<div class="capsule-card">' +
        '<div class="capsule-locked-icon">🔒</div>' +
        '<div class="capsule-locked-title">MÜHÜRLÜ</div>' +
        '<div class="capsule-locked-sub">' + writtenLabel + ' tarihinde kendine bir mektup yazdın. ' + unlockLabel + ' tarihinde açılacak.</div>' +
        '<div class="capsule-countdown">' + daysLeft + ' gün kaldı</div>' +
        '<button type="button" class="capsule-open-btn" disabled>Henüz açılamaz</button>' +
      '</div>';
  }

  function motivationSealTimeCapsule() {
    const input = document.getElementById('capsuleInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const now = new Date();
    const unlock = new Date(now);
    unlock.setFullYear(unlock.getFullYear() + 1);
    const state = motivationLoadState();
    state.timeCapsule = {
      text: text,
      writtenDate: now.toISOString(),
      unlockDate: unlock.toISOString(),
      opened: false
    };
    motivationSaveState(state);
    motivationLogEvent('🔒 Bir yıl sonra okunacak mektup mühürlendi.');
    motivationRenderTimeCapsule();
  }

  function motivationInitStage4() {
    motivationTakeDailySnapshot();

    // Bu fonksiyonlar sadece blog.html'de gerekli container'ları bulur, diğer sayfalarda sessizce çıkar.
    motivationRenderCompare();
    motivationRenderPhotoTimeline();
    motivationRenderWeeklyLetter();
    motivationRenderTimeCapsule();

    const saveBtn = document.getElementById('weeklyLetterSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', motivationSaveWeeklyLetter);
  }

  motivationRenderCompare();
  motivationRenderPhotoTimeline();
  motivationRenderWeeklyLetter();
  motivationRenderTimeCapsule();

  const _weeklyLetterSaveBtn = document.getElementById('weeklyLetterSaveBtn');
  if (_weeklyLetterSaveBtn) _weeklyLetterSaveBtn.addEventListener('click', motivationSaveWeeklyLetter);
