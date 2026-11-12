// All sounds are synthesized with the Web Audio API — no files, no libraries.
const Sfx = (() => {
  let ctx, noiseBuf, on = true;

  const init = () => {               // call from a user gesture
    try {
      if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        ctx = new C();
        const n = ctx.sampleRate * 1.5;
        noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  };
  const ok = () => on && ctx && ctx.state !== 'closed';
  const env = (g, t, a, peak, d) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };
  const tone = (f, at, d, peak = .12, f2) => {
    if (!ok()) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    env(g, t, .01, peak, d);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + d + .1);
  };
  const noise = (at, d, f1, f2, peak, q = 1) => {
    if (!ok()) return;
    const t = ctx.currentTime + at, s = ctx.createBufferSource(),
          fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = 'bandpass'; fl.Q.value = q;
    fl.frequency.setValueAtTime(f1, t);
    fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    env(g, t, d * .4, peak, d * .6);
    s.connect(fl).connect(g).connect(ctx.destination);
    s.start(t, Math.random() * .4, d + .1);
  };

  return {
    init,
    isOn: () => on,
    setOn(v) { on = v; if (v) init(); },
    chime()   { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * .18, 1.8, .07)); tone(261.6, 0, 2.4, .05); },
    sparkle() { for (let i = 0; i < 4; i++) tone(2200 + Math.random() * 2200, i * .05, .2, .035); },
    whoosh()  { noise(0, .85, 300, 3400, .28, .8); tone(220, 0, .7, .05, 880); },
    pop()     { tone(380, 0, .14, .2, 900); [1319, 1760, 2349].forEach((f, i) => tone(f, .1 + i * .07, .4, .06)); },
    rustle()  { for (let i = 0; i < 6; i++) noise(i * .09 + Math.random() * .04, .1, 3500, 5500, .13, .5); },
    notify()  { tone(880, 0, .5, .1); tone(1318.5, .14, .9, .1); }
  };
})();
