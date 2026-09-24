// Offerteformulier: controleert de velden en opent een ingevuld e-mailbericht.
// Geen server nodig; bij oplevering eventueel vervangen door een formulierdienst.
(function () {
  var form = document.getElementById('offerte');
  if (!form) return;

  var TO = 'info@huttinga-allroundservice.nl';
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorEl, show) {
    errorEl.hidden = !show;
    [].concat(input).forEach(function (el) {
      el.setAttribute('aria-invalid', show ? 'true' : 'false');
      if (show) el.setAttribute('aria-describedby', errorEl.id);
      else el.removeAttribute('aria-describedby');
    });
  }

  function validate() {
    var naam = form.naam, tel = form.telefoon, mail = form.email, bericht = form.bericht;
    var naamOk = naam.value.trim() !== '';
    var mailVal = mail.value.trim();
    var contactOk = tel.value.trim().replace(/\D/g, '').length >= 10 || emailPattern.test(mailVal);
    var berichtOk = bericht.value.trim() !== '';

    setError(naam, document.getElementById('e-naam'), !naamOk);
    setError([tel, mail], document.getElementById('e-contact'), !contactOk);
    setError(bericht, document.getElementById('e-bericht'), !berichtOk);

    var firstInvalid = !naamOk ? naam : !contactOk ? tel : !berichtOk ? bericht : null;
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var f = form;
    var subject = 'Offerteaanvraag: ' + f.soort.value;
    var body = [
      'Naam: ' + f.naam.value.trim(),
      'Telefoon: ' + (f.telefoon.value.trim() || '-'),
      'E-mail: ' + (f.email.value.trim() || '-'),
      'Soort werk: ' + f.soort.value,
      'Plaats van het werk: ' + (f.plaats.value.trim() || '-'),
      '',
      f.bericht.value.trim()
    ].join('\n');

    window.location.href = 'mailto:' + TO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    var status = document.getElementById('form-status');
    if (status) { status.hidden = false; status.focus(); }
  });

  // Foutmelding verdwijnt zodra het veld is aangepast
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute('aria-invalid') !== 'true') return;
    if (t === form.naam && t.value.trim()) setError(t, document.getElementById('e-naam'), false);
    if (t === form.bericht && t.value.trim()) setError(t, document.getElementById('e-bericht'), false);
    if ((t === form.telefoon || t === form.email) &&
        (form.telefoon.value.replace(/\D/g, '').length >= 10 || emailPattern.test(form.email.value.trim()))) {
      setError([form.telefoon, form.email], document.getElementById('e-contact'), false);
    }
  });
})();

// Header wordt compacter na het scrollen
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var onScroll = function () { header.classList.toggle('is-compact', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Diensten: de vaste foto (desktop) volgt de dienst die in beeld is
(function () {
  var rows = [].slice.call(document.querySelectorAll('.svc'));
  var imgs = [].slice.call(document.querySelectorAll('.svc-visual img'));
  var num = document.querySelector('.svc-visual-num');
  var notes = [].slice.call(document.querySelectorAll('.svc-visual .photo-note'));
  if (!rows.length || !imgs.length) return;

  function setActive(i) {
    rows.forEach(function (r, n) { r.classList.toggle('is-active', n === i); });
    imgs.forEach(function (img, n) { img.classList.toggle('is-active', n === i); });
    notes.forEach(function (note, n) { note.classList.toggle('is-active', n === i); });
    if (num) num.textContent = '0' + (i + 1);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(Number(e.target.dataset.index));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { io.observe(r); });
  }
  rows.forEach(function (r) {
    r.addEventListener('mouseenter', function () { setActive(Number(r.dataset.index)); });
  });
})();

// Doorsnede: lagen bouwen op van onder naar boven zodra de tekening in beeld komt
(function () {
  var sheet = document.getElementById('doorsnede');
  if (!sheet) return;
  if (!('IntersectionObserver' in window)) { sheet.classList.add('is-built'); return; }
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { sheet.classList.add('is-built'); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(sheet);
})();

// Mobiel menu
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  if (!header || !toggle || !nav) return;

  var label = toggle.querySelector('.menu-text');
  function setOpen(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Sluiten' : 'Menu';
  }
  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
  });
})();

// Fotoplekken aan/uit: toont waar eigen foto's van Huttinga komen
(function () {
  var toggle = document.querySelector('.slots-toggle');
  if (!toggle) return;
  var root = document.documentElement;
  var state = toggle.querySelector('.slots-state');

  function render() {
    var on = !root.classList.contains('photo-slots-off');
    toggle.setAttribute('aria-pressed', String(on));
    if (state) state.textContent = on ? 'aan' : 'uit';
  }
  toggle.addEventListener('click', function () {
    root.classList.toggle('photo-slots-off');
    render();
  });
  render();
})();
