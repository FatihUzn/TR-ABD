// ============================================================
// evrak.js — Almanya/Türkiye evrak checklist + form bilgileri.
// Sadece evrak.html'de yüklenir. core.js'in ÖNCE yüklenmiş olması
// gerekir (EVRAK_CHECKLIST ve motivationLogEvent/motivationCheckBadges için).
// TASLAK LİSTE: bu maddeler tahmini olarak kondu, sen düzelteceksin.
// ============================================================

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
    if (e.target.checked) {
      const itemName = e.target.closest('.yks-topic-row')?.querySelector('.yks-topic-name')?.textContent?.trim();
      motivationLogEvent('📋 Evrak tamamlandı' + (itemName ? ': ' + itemName : '.'));
      motivationCheckBadges();
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
