/* ============ textures.js — procedural canvas textures & cached materials =
   Everything is generated at runtime: fur, greasy skin, rust, stained
   concrete, dirty fabric, yellowed teeth, bloodshot eyes, neon text.
   Materials are cached by key so they can be shared / never disposed. */
(function () {
  const RC = window.RC;

  function cv(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    draw(g, size);
    return c;
  }
  function tex(canvas, repeat) {
    const t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
    return t;
  }
  const T = RC.textures = {};
  const M = RC.materials = {};
  const matCache = {};

  /* small noise helper: scatter translucent dots */
  function speckle(g, s, n, rMin, rMax, color, aMin, aMax) {
    for (let i = 0; i < n; i++) {
      g.globalAlpha = RC.rand(aMin, aMax);
      g.fillStyle = color;
      const r = RC.rand(rMin, rMax);
      g.beginPath();
      g.arc(RC.rand(0, s), RC.rand(0, s), r, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;
  }
  function grimeBlots(g, s, n, color) {
    for (let i = 0; i < n; i++) {
      const x = RC.rand(0, s), y = RC.rand(0, s), r = RC.rand(s * .04, s * .22);
      const gr = g.createRadialGradient(x, y, 1, x, y, r);
      gr.addColorStop(0, color + '55');
      gr.addColorStop(.75, color + '22');
      gr.addColorStop(1, color + '00');
      g.globalAlpha = 1;
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function hexRGB(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, f) {
    const [r, g, b] = hexRGB(hex);
    const s = v => RC.clamp(Math.round(v * f), 0, 255);
    return `rgb(${s(r)},${s(g)},${s(b)})`;
  }

  /* ---------------- DIRTY FUR ---------------- */
  T.fur = function (base) {
    return cv(256, (g, s) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      const dark = shade(base, .55), light = shade(base, 1.35);
      for (let i = 0; i < 1400; i++) {         // oil streaks
        g.globalAlpha = RC.rand(.02, .09);
        g.fillStyle = Math.random() < .6 ? dark : light;
        const x = RC.rand(0, s), y = RC.rand(0, s), len = RC.rand(6, 40);
        g.save(); g.translate(x, y); g.rotate(RC.rand(0, Math.PI));
        g.fillRect(-len / 2, -1, len, 2); g.restore();
      }
      for (let i = 0; i < 2600; i++) {         // hair shafts
        g.globalAlpha = RC.rand(.12, .5);
        g.strokeStyle = Math.random() < .5 ? dark : light;
        g.lineWidth = RC.rand(.6, 1.4);
        const x = RC.rand(0, s), y = RC.rand(0, s);
        g.beginPath(); g.moveTo(x, y);
        g.lineTo(x + RC.rand(-4, 4), y + RC.rand(-6, 6)); g.stroke();
      }
      g.globalAlpha = 1;
      grimeBlots(g, s, 10, '#1c150d');         // greasy spots
      speckle(g, s, 90, .5, 1.8, '#0e0b07', .15, .5);  // fleas/dirt
      speckle(g, s, 24, .8, 2.2, '#2f4a1e', .2, .5);   // sewer moss
    });
  };

  /* ---------------- SICK SKIN ---------------- */
  T.skin = function (base) {
    return cv(128, (g, s) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      const dark = shade(base, .7), red = '#8a3f3a';
      speckle(g, s, 450, .4, 1.4, dark, .1, .35);
      speckle(g, s, 60, .6, 2.2, red, .08, .28);      // burst capillaries
      speckle(g, s, 26, .5, 1.6, '#6b5a20', .1, .3);  // jaundice
      grimeBlots(g, s, 5, '#3a2c1c');
    });
  };

  /* ---------------- PATCHY FUR (big skin-colored loss zones) --------- */
  T.furPatchy = function (base, skinHex) {
    return cv(256, (g, s) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      const dark = shade(base, .55), light = shade(base, 1.35);
      for (let i = 0; i < 1100; i++) {         // hair shafts
        g.globalAlpha = RC.rand(.12, .42);
        g.strokeStyle = Math.random() < .5 ? dark : light;
        g.lineWidth = RC.rand(.6, 1.3);
        const x = RC.rand(0, s), y = RC.rand(0, s);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + RC.rand(-4, 4), y + RC.rand(-6, 6)); g.stroke();
      }
      g.globalAlpha = 1;
      grimeBlots(g, s, 8, '#1c150d');
      /* raw pink bald continents */
      for (let i = 0; i < 9; i++) {
        const x = RC.rand(0, s), y = RC.rand(0, s), r = RC.rand(s * .09, s * .26);
        g.globalAlpha = RC.rand(.85, 1);
        g.fillStyle = skinHex;
        g.beginPath(); g.ellipse(x, y, r, r * RC.rand(.55, 1), RC.rand(0, Math.PI), 0, 7); g.fill();
        g.globalAlpha = RC.rand(.15, .4); g.fillStyle = '#b8625a';
        g.beginPath(); g.ellipse(x, y, r * .8, r * .6, 0, 0, 7); g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = '#2a2018'; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(x, y, r, r * .7, 0, 0, 7); g.stroke();
      }
      speckle(g, s, 70, .5, 1.6, '#0e0b07', .15, .5);
    });
  };

  /* ---------------- ALMOST HAIRLESS PINK SKIN ------------------------ */
  T.furHairless = function () {
    return cv(256, (g, s) => {
      const gr = g.createLinearGradient(0, 0, 0, s);
      gr.addColorStop(0, '#d9a48e'); gr.addColorStop(.5, '#c98f7c'); gr.addColorStop(1, '#b57e70');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      speckle(g, s, 300, .4, 1.4, '#a06a5c', .15, .4);   // pink blotching
      speckle(g, s, 60, .5, 1.8, '#8a4a44', .1, .35);    // raw patches
      grimeBlots(g, s, 6, '#5c3a34');
      /* a few sad remaining hairs, wrongly distributed */
      g.strokeStyle = '#3a2c20'; g.lineWidth = 1;
      for (let i = 0; i < 55; i++) {
        const x = RC.rand(0, s), y = RC.rand(0, s);
        g.globalAlpha = RC.rand(.2, .55);
        g.beginPath(); g.moveTo(x, y);
        g.lineTo(x + RC.rand(-3, 3), y + RC.rand(4, 11)); g.stroke();
      }
      g.globalAlpha = 1;
    });
  };

  /* ---------------- HEAVY BLOODSHOT EYE ------------------------------- */
  T.eyeBlood = function () {
    return cv(64, (g, s) => {
      const gr = g.createRadialGradient(s / 2, s / 2, 3, s / 2, s / 2, s / 2);
      gr.addColorStop(0, '#f6d8c4'); gr.addColorStop(.6, '#eba892'); gr.addColorStop(1, '#dd8f80');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      g.strokeStyle = '#b02018'; g.lineWidth = 1.1;
      for (let i = 0; i < 30; i++) {
        g.globalAlpha = RC.rand(.4, .95);
        const a = RC.rand(0, Math.PI * 2), r0 = s * .14;
        g.beginPath();
        g.moveTo(s / 2 + Math.cos(a) * r0, s / 2 + Math.sin(a) * r0);
        g.lineTo(s / 2 + Math.cos(a) * (s * .48), s / 2 + Math.sin(a) * (s * .48 + RC.rand(0, 4)));
        g.stroke();
      }
      g.globalAlpha = .6; g.fillStyle = '#c8402a';
      for (let i = 0; i < 8; i++) {
        g.beginPath(); g.arc(s / 2 + RC.rand(-14, 14), s / 2 + RC.rand(-14, 14), RC.rand(1.2, 3), 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    });
  };

  /* ---------------- ROT (dark rotten teeth) --------------------------- */
  T.teethRot = function () {
    return cv(64, (g, s) => {
      g.fillStyle = '#7a6420'; g.fillRect(0, 0, s, s);
      speckle(g, s, 140, .5, 2.4, '#3c2e0c', .2, .55);
      speckle(g, s, 90, .5, 2, '#4a5218', .15, .5);       // rot-green
      speckle(g, s, 40, .5, 2.2, '#1a140a', .25, .6);     // cavities
      speckle(g, s, 24, .4, 1.4, '#6a4a2a', .3, .6);      // plaque
      grimeBlots(g, s, 8, '#20180a');
    });
  };

  /* ---------------- RUST ---------------- */
  T.rust = function () {
    return cv(256, (g, s) => {
      g.fillStyle = '#6e4a2e'; g.fillRect(0, 0, s, s);
      speckle(g, s, 700, 1, 5, '#8c5524', .15, .5);
      speckle(g, s, 500, .5, 3, '#3c2a1a', .2, .55);
      speckle(g, s, 300, .5, 2.5, '#b26a35', .1, .4);
      speckle(g, s, 120, .5, 1.4, '#d8d3c8', .06, .2);  // scratches
      grimeBlots(g, s, 14, '#241505');
      grimeBlots(g, s, 6, '#2b4a17');
    });
  };

  /* ---------------- STAINED CONCRETE ---------------- */
  T.concrete = function () {
    return cv(256, (g, s) => {
      g.fillStyle = '#4d4a46'; g.fillRect(0, 0, s, s);
      speckle(g, s, 2400, .4, 1.6, '#2c2a27', .12, .4);
      speckle(g, s, 1400, .4, 1.2, '#6a665f', .08, .3);
      grimeBlots(g, s, 16, '#191a14');
      grimeBlots(g, s, 8, '#4a3a1a');
      grimeBlots(g, s, 5, '#3c2020');
      // cracks
      g.strokeStyle = '#1f1d1a'; g.lineWidth = 1.4;
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        let x = RC.rand(0, s), y = RC.rand(0, s);
        g.moveTo(x, y);
        for (let j = 0; j < 6; j++) { x += RC.rand(-24, 24); y += RC.rand(6, 26); g.lineTo(x, y); }
        g.stroke();
      }
    });
  };

  /* ---------------- DIRTY FABRIC ---------------- */
  T.fabric = function (base, woven = true) {
    return cv(256, (g, s) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      const dark = shade(base, .6), light = shade(base, 1.25);
      if (woven) {
        g.globalAlpha = .25; g.strokeStyle = dark; g.lineWidth = 1;
        for (let i = 0; i < s; i += 4) { g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke(); }
        for (let i = 0; i < s; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke(); }
        g.globalAlpha = 1;
      } else {
        speckle(g, s, 900, .4, 1.4, dark, .1, .3);      // latex grain
        speckle(g, s, 200, .3, .9, '#ffffff', .02, .10); // shine flecks
      }
      grimeBlots(g, s, 10, '#1f1608');                  // filth
      grimeBlots(g, s, 4, '#3a2410');                   // rust rub
      for (let i = 0; i < (woven ? 5 : 2); i++) {       // tears / holes
        const x = RC.rand(0, s), y = RC.rand(0, s), r = RC.rand(3, 9);
        g.fillStyle = '#100e0b'; g.globalAlpha = .9;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        g.globalAlpha = 1;
      }
    });
  };

  /* ---------------- YELLOWED TEETH ---------------- */
  T.teeth = function () {
    return cv(64, (g, s) => {
      g.fillStyle = '#d6be62'; g.fillRect(0, 0, s, s);
      speckle(g, s, 120, .5, 2, '#8f6c22', .15, .45);
      grimeBlots(g, s, 6, '#4a3a10');
      g.fillStyle = '#5c4514';
      for (let i = 0; i < 8; i++) {
        g.globalAlpha = RC.rand(.3, .7);
        g.beginPath(); g.arc(RC.rand(0, s), RC.rand(0, s), RC.rand(.7, 2.4), 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    });
  };

  /* ---------------- BLOODSHOT EYE ---------------- */
  T.eye = function () {
    return cv(64, (g, s) => {
      const gr = g.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
      gr.addColorStop(0, '#f3e9d8'); gr.addColorStop(.8, '#e8d7bd'); gr.addColorStop(1, '#d8b28f');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      g.strokeStyle = '#a03028'; g.lineWidth = .8;
      for (let i = 0; i < 14; i++) {
        g.globalAlpha = RC.rand(.3, .8);
        const a = RC.rand(0, Math.PI * 2), r0 = s * .22, r1 = s * .48;
        g.beginPath();
        g.moveTo(s / 2 + Math.cos(a) * r0, s / 2 + Math.sin(a) * r0);
        g.lineTo(s / 2 + Math.cos(a) * (r1 + RC.rand(0, 4)), s / 2 + Math.sin(a) * (r1 + RC.rand(0, 4)));
        g.stroke();
      }
      g.globalAlpha = 1;
    });
  };

  /* ---------------- NEON SIGN TEXT ---------------- */
  T.neon = function (text, color, font = 'bold 100px Impact, sans-serif') {
    return tex(cv(1024, (g, s) => {
      g.clearRect(0, 0, s, s);
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      const w = g.measureText(text).width;
      const scale = Math.min(1, (s * .92) / w);
      g.save();
      g.translate(s / 2, s / 2);
      g.scale(scale, 1);
      g.shadowColor = color; g.shadowBlur = 42; g.fillStyle = '#ffffff';
      g.fillText(text, 0, 6);
      g.shadowBlur = 16; g.fillStyle = color;
      g.fillText(text, 0, 6);
      g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = .85;
      g.fillText(text, 0, 6);
      g.restore();
    }));
  };

  /* ---------------- PLATE LABEL (desk signs, name plates) ---------------- */
  T.plate = function (text, fg = '#d9cba8') {
    return tex(cv(256, (g, s) => {
      g.fillStyle = '#1b1917'; g.fillRect(0, 0, s, s);
      speckle(g, s, 60, .4, 1.4, '#000', .2, .5);
      g.font = 'bold 30px Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      // wrap to 2 lines if needed
      const words = text.split(' ');
      const lines = [];
      let cur = '';
      words.forEach(w => {
        if (g.measureText((cur + ' ' + w).trim()).width > s * .85 && cur) { lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
      });
      if (cur) lines.push(cur);
      const lh = 34, y0 = s / 2 - (lines.length - 1) * lh / 2;
      lines.forEach((l, i) => { g.fillStyle = fg; g.fillText(l, s / 2, y0 + i * lh); });
    }));
  };

  /* ================= CACHED MATERIAL FACTORY ================= */
  function cached(key, build) {
    if (!matCache[key]) matCache[key] = build();
    return matCache[key];
  }

  M.fur = function (hex) {
    return cached('fur' + hex, () => new THREE.MeshStandardMaterial({
      map: tex(T.fur(hex), 2), color: 0xffffff, roughness: .95, metalness: 0
    }));
  };
  M.skin = function (hex) {
    return cached('skin' + hex, () => new THREE.MeshStandardMaterial({
      map: tex(T.skin(hex)), roughness: .65, metalness: .02
    }));
  };
  M.fabric = function (hex, opt = {}) {
    const key = 'fab' + hex + (opt.smooth ? 's' : '') + (opt.repeat || 1) + (opt.metal ? 'm' : '');
    return cached(key, () => new THREE.MeshStandardMaterial({
      map: tex(T.fabric(hex, !opt.smooth), opt.repeat || 1),
      color: 0xffffff, roughness: opt.metal ? .5 : .9,
      metalness: opt.metal ? .45 : 0
    }));
  };
  M.latex = function (hex) {
    return cached('lat' + hex, () => new THREE.MeshStandardMaterial({
      map: tex(T.fabric(hex, false), 1), roughness: .28, metalness: .15
    }));
  };
  M.rust = function (repeat = 2) {
    return cached('rust' + repeat, () => new THREE.MeshStandardMaterial({
      map: tex(T.rust(), repeat), roughness: .8, metalness: .55
    }));
  };
  M.concrete = function (repeat = 4) {
    return cached('con' + repeat, () => new THREE.MeshStandardMaterial({
      map: tex(T.concrete(), repeat), roughness: .95, metalness: 0
    }));
  };
  M.concreteGloss = function (repeat = 3) {
    return cached('cong' + repeat, () => new THREE.MeshStandardMaterial({
      map: tex(T.concrete(), repeat), roughness: .18, metalness: .25
    }));
  };
  M.teeth = function () {
    return cached('teeth', () => new THREE.MeshStandardMaterial({
      map: tex(T.teeth()), roughness: .3, metalness: .05
    }));
  };
  M.eye = function () {
    return cached('eye', () => new THREE.MeshStandardMaterial({
      map: tex(T.eye()), roughness: .25, metalness: .1
    }));
  };
  M.eyeBlood = function () {
    return cached('eyeBlood', () => new THREE.MeshStandardMaterial({
      map: tex(T.eyeBlood()), roughness: .22, metalness: .05
    }));
  };
  M.teethRot = function () {
    return cached('teethRot', () => new THREE.MeshStandardMaterial({
      map: tex(T.teethRot()), roughness: .45, metalness: 0
    }));
  };
  M.furPatchy = function (hex, skinHex) {
    return cached('furP' + hex + skinHex, () => new THREE.MeshStandardMaterial({
      map: tex(T.furPatchy(hex, skinHex), 2), color: 0xffffff, roughness: .95, metalness: 0
    }));
  };
  M.furHairless = function () {
    return cached('furH', () => new THREE.MeshStandardMaterial({
      map: tex(T.furHairless(), 2), color: 0xffffff, roughness: .7, metalness: 0
    }));
  };
  M.gum = function () {
    return cached('gum', () => new THREE.MeshStandardMaterial({ color: 0x6e3a45, roughness: .7 }));
  };
  M.nose = function () {
    return cached('nose', () => new THREE.MeshStandardMaterial({ color: 0x2b2126, roughness: .5 }));
  };
  M.innerEar = function () {
    return cached('ear', () => new THREE.MeshStandardMaterial({ color: 0x8f5560, roughness: .8 }));
  };
  M.black = function (rough = .6, metal = .3) {
    return cached('blk' + rough + metal, () => new THREE.MeshStandardMaterial({ color: 0x14120f, roughness: rough, metalness: metal }));
  };
  M.chip = function (hex) {
    return cached('chip' + hex, () => new THREE.MeshStandardMaterial({ color: hex, roughness: .5, metalness: .2 }));
  };
  M.emissive = function (hex, inten = 2, rough = .4) {
    return cached('emi' + hex + inten, () => new THREE.MeshStandardMaterial({
      color: 0x111111, emissive: hex, emissiveIntensity: inten, roughness: rough
    }));
  };
  M.wire = function (hex = 0x443c2a) {
    return cached('wire' + hex, () => new THREE.MeshStandardMaterial({ color: hex, roughness: .7, metalness: .4 }));
  };
  M.bone = function () {
    return cached('bone', () => new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: .8, metalness: 0 }));
  };
})();
