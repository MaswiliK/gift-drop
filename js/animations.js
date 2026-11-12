// Visual effects (Web Animations API, no libraries).
const FX = (() => {
  const layer = () => document.getElementById('fx');
  const r = (a, b) => a + Math.random() * (b - a);

  function confetti(rect) {
    const L = layer(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const cols = ['#ff4fa3', '#ff9ccf', '#ffd166', '#fff4e0', '#c1121f'];
    for (let i = 0; i < 48; i++) {
      const p = document.createElement('i'), s = r(6, 11);
      p.className = 'confetti';
      p.style.cssText = `left:${cx}px;top:${cy}px;width:${s}px;height:${s * r(.4, 1)}px;background:${cols[i % 5]}`;
      L.appendChild(p);
      const a = r(0, Math.PI * 2), d = r(80, 230), dx = Math.cos(a) * d, dy = Math.sin(a) * d - 60;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${r(180, 540)}deg)`, opacity: 1, offset: .45 },
        { transform: `translate(${dx * 1.1}px,${dy + 220}px) rotate(${r(540, 900)}deg)`, opacity: 0 }
      ], { duration: r(1300, 2000), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' })
        .onfinish = () => p.remove();
    }
  }

  function sparkle(el) {
    const b = el.getBoundingClientRect(), L = layer();
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle'; s.textContent = '✦';
      s.style.cssText = `left:${b.left + r(0, b.width)}px;top:${b.top + r(0, b.height)}px;font-size:${r(10, 20)}px`;
      L.appendChild(s);
      s.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1) rotate(60deg)', offset: .4 },
                 { opacity: 0, transform: 'scale(.3) rotate(120deg)' }],
                { duration: r(600, 1000), delay: i * 70, fill: 'both' }).onfinish = () => s.remove();
    }
  }

  function hearts() {
    const L = layer(), W = innerWidth, H = innerHeight, cols = ['#ff4fa3', '#ff9ccf', '#c1121f', '#ff6f91'];
    for (let i = 0; i < 14; i++) {
      const h = document.createElement('span');
      h.className = 'heart'; h.textContent = '❤';
      h.style.cssText = `left:${r(8, 92)}%;font-size:${r(16, 34)}px;color:${cols[i % 4]}`;
      L.appendChild(h);
      const sway = r(-30, 30);
      h.animate([
        { transform: 'translate(0,0) scale(.5)', opacity: 0 },
        { transform: `translate(${sway}px,${-H * .25}px) scale(1)`, opacity: .9, offset: .25 },
        { transform: `translate(${-sway}px,${-H * .85}px) scale(1.1)`, opacity: 0 }
      ], { duration: r(3200, 4800), delay: i * 220, easing: 'ease-out', fill: 'both' })
        .onfinish = () => h.remove();
    }
  }

  return { confetti, sparkle, hearts, clear: () => { layer().innerHTML = ''; } };
})();
