// ============================================================
// yks.js — YKS konu takibi (checklist motoru). Sadece yks.html'de
// yüklenir. core.js'in ÖNCE yüklenmiş olması gerekir (YKS_DATA ve
// motivationLogEvent/motivationCheckBadges için).
// ============================================================

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
    if (e.target.checked) {
      const topicName = e.target.closest('.yks-topic-row')?.querySelector('.yks-topic-name')?.textContent?.trim();
      motivationLogEvent('📚 YKS konusu tamamlandı' + (topicName ? ': ' + topicName : '.'));
      motivationCheckBadges();
    }
  });

  yksRenderAll();
