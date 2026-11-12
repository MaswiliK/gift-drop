// Flow controller: ENTRANCE → GIFT → TEDDY → LETTER → HEARTS → REPLAY
(() => {
  const $ = s => document.querySelector(s);
  const screens = { entrance: $('#s-entrance'), gift: $('#s-gift'), letter: $('#s-letter') };
  const prompt = $('#prompt'), box = $('#box'), teddy = $('#teddy'), cta = $('#toLetter'),
        letter = $('#letter'), sig2 = $('#sig2'), end = $('#letterEnd'), replay = $('#replay'),
        soundBtn = $('#sound');

  let run = 0, locked = true, step = 'gate', observer = null, finished = false;

  // timers die with the current run, so Replay can never be haunted by old animations
  const later = (fn, ms) => { const r = run; setTimeout(() => { if (r === run) fn(); }, ms); };
  const show = n => Object.entries(screens).forEach(([k, el]) => el.classList.toggle('active', k === n));
  const setPrompt = (txt, on) => { if (txt) prompt.textContent = txt; prompt.classList.toggle('on', on); };

  function renderLetter() {
    const fill = t => t.replace(/\{name\}/g, recipientName);
    const body = $('#letterBody');
    body.innerHTML = '';
    const add = (cls, text) => { const p = document.createElement('p'); if (cls) p.className = cls; p.textContent = fill(text); body.appendChild(p); };
    add('greeting', letterContent.greeting);
    letterContent.paragraphs.forEach(t => add('', t));
    add('closing', letterContent.closing);
  }

  function start() {
    run++; locked = true; step = 'gate'; finished = false;
    if (observer) observer.disconnect();
    FX.clear();
    screens.entrance.classList.remove('msg', 'sigon');
    screens.gift.classList.remove('ready', 'revealed');
    box.classList.remove('opening'); teddy.classList.remove('pop', 'settled'); cta.classList.remove('show');
    sig2.classList.remove('show'); replay.classList.remove('show');
    letter.scrollTop = 0;
    renderLetter();
    setPrompt('Tap to open', false);
    show('entrance');
    later(() => { setPrompt('Tap to open', true); locked = false; }, 2200);
  }

  /* ---- 1. entrance ---- */
  screens.entrance.addEventListener('click', () => {
    if (locked) return;
    Sfx.init();
    locked = true;
    if (step === 'gate') {
      Sfx.chime();
      setPrompt('', false);
      screens.entrance.classList.add('msg');
      later(() => screens.entrance.classList.add('sigon'), 2200);
      later(() => { step = 'ready'; setPrompt('Tap to continue', true); locked = false; }, 3800);
    } else {
      setPrompt('', false);
      enterGift();
    }
  });

  /* ---- 2. gift box ---- */
  function enterGift() {
    step = 'gift';
    show('gift');
    later(() => screens.gift.classList.add('ready'), 900);
    later(() => { locked = false; }, 1400);
  }

  box.addEventListener('mouseenter', () => {
    if (locked || step !== 'gift' || !matchMedia('(hover:hover)').matches) return;
    Sfx.sparkle(); FX.sparkle(box);
  });

  box.addEventListener('click', () => {
    if (locked || step !== 'gift') return;
    locked = true; step = 'opening';
    Sfx.init(); Sfx.whoosh();
    screens.gift.classList.add('revealed');
    box.classList.add('opening');
    // 3. reveal: box finishes → confetti → teddy pops → settles → button
    const rect = box.getBoundingClientRect();
    later(() => FX.confetti(rect), 1100);
    later(() => { teddy.classList.add('pop'); Sfx.pop(); }, 1350);
    later(() => { teddy.classList.remove('pop'); teddy.classList.add('settled'); }, 2200);
    later(() => { cta.classList.add('show'); step = 'teddy'; locked = false; }, 2800);
  });

  /* ---- 4. letter ---- */
  cta.addEventListener('click', () => {
    if (locked || step !== 'teddy') return;
    locked = true; step = 'letter';
    Sfx.rustle();
    show('letter');
    later(watchReading, 1500);
  });

  function watchReading() {
    if (letter.scrollHeight <= letter.clientHeight + 4) { later(finish, 3000); return; } // short letter fallback
    observer = new IntersectionObserver(es => { if (es[0].isIntersecting) finish(); }, { root: letter, threshold: 0 });
    observer.observe(end);
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (observer) observer.disconnect();
    Sfx.notify();
    sig2.classList.add('show');
    later(FX.hearts, 1300);
    later(() => { replay.classList.add('show'); locked = false; }, 2600);
  }

  /* ---- replay + sound ---- */
  replay.addEventListener('click', () => { if (!locked) start(); });

  soundBtn.addEventListener('click', () => {
    const next = !Sfx.isOn();
    Sfx.setOn(next);
    soundBtn.setAttribute('aria-pressed', next);
    soundBtn.setAttribute('aria-label', next ? 'Sound on' : 'Sound off');
    soundBtn.textContent = next ? '🔊' : '🔇';
  });

  start();
})();
