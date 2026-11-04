/* ============ creator.js — STEP 2: CHARACTER CREATION SYSTEM ==========
   Bio-assembly wing: dark industrial photo studio platform + panel UI.
   Gender, 8 body morphs, 8 fur coats, face feature sets, combinable
   gross defects, orbit/zoom camera views, CREATE RANDOM FREAK, name,
   and ENTER THE FILTHY RUNWAY (saves the whole configuration).       */
(function () {
  const RC = window.RC, THREE = window.THREE, M = RC.materials, T = RC.textures;
  const $ = id => document.getElementById(id);

  /* ================= option tables ================= */
  const GENDERS = [
    { id: 'male', name: 'MALE RAT HUMAN', sub: 'testosterone & gutter grit' },
    { id: 'female', name: 'FEMALE RAT HUMAN', sub: 'claws out, litters behind her' },
  ];

  const BODIES = [
    { id: 'skinny', name: 'EXTREMELY SKINNY', sub: 'bones with a rumor of meat', spec: { width: .72, belly: .8, limbRA: .78, limbRL: .78, chestB: .86 } },
    { id: 'fatround', name: 'FAT AND ROUND', sub: 'a sphere of vermin', spec: { width: 1.28, belly: 1.25, shoulderW: .3, limbRA: 1.15, limbRL: 1.2, chestB: 1.05 } },
    { id: 'muscle', name: 'MUSCULAR', sub: 'trained lifting junk in the drain', spec: { width: 1.16, belly: .95, limbRA: 1.6, limbRL: 1.3, chestB: 1.32, shoulderW: .28 } },
    { id: 'tall', name: 'TALL AND SKINNY', sub: 'stretched on a sewage rack', spec: { width: .8, belly: .84, legScale: 1.3, torsoY: 1.18, limbRA: .85, limbRL: .85, chestB: .9 } },
    { id: 'short', name: 'SHORT AND DEFORMED', sub: 'assembled badly, quickly', spec: { scale: .8, legScale: .72, torsoY: .95, sideHump: true, torsoTwist: .16, droop: .8 } },
    { id: 'hunched', name: 'HUNCHED AND CROOKED', sub: 'apologizes with its spine', spec: { hunch: .52, width: 1.02, belly: 1.05, torsoTwist: .07 } },
    { id: 'obese', name: 'OBESE', sub: 'the gravitational final form', spec: { width: 1.4, belly: 1.55, shoulderW: .31, legScale: .9, limbRA: 1.3, limbRL: 1.4, chestB: 1.15 } },
    { id: 'asym', name: 'ASYMMETRICAL MUTANT', sub: 'drafted by two arguing committees', spec: { width: 1.0, belly: 1.1, asym: true } },
  ];

  const FURS = [
    { id: 'grey', name: 'DIRTY GREY', sub: 'the classic sewer overcoat', hex: '#57514a' },
    { id: 'brown', name: 'DARK BROWN', sub: 'mud, aged politely', hex: '#4a3524' },
    { id: 'black', name: 'BLACK', sub: 'oiled, menacing, flaky', hex: '#26211d' },
    { id: 'white', name: 'DIRTY WHITE', sub: 'was a lab rat, is not anymore', hex: '#ac9f8d' },
    { id: 'beige', name: 'YELLOWISH BEIGE', sub: 'nicotine-stained couture', hex: '#a8945e' },
    { id: 'red', name: 'REDDISH BROWN', sub: 'copper with transmission fluid', hex: '#6e3a22' },
    { id: 'patchy', name: 'PATCHY MIXED FUR', sub: 'molt in several acts', special: 'patchy' },
    { id: 'hairless', name: 'ALMOST HAIRLESS PINK', sub: 'embarrassing and very warm', special: 'hairless' },
  ];

  const EYES = [
    { id: 'normal', name: 'STANDARD SUNKEN', sub: 'barely open, always judging' },
    { id: 'small', name: 'SMALL EYES', sub: 'two pinpricks of suspicion', spec: { eyeScale: .58 } },
    { id: 'huge', name: 'HUGE BULGING EYES', sub: 'targeted by every bird above', spec: { eyeScale: 2.0 } },
    { id: 'cross', name: 'CROSS-EYED', sub: 'both eyes report to one nostril', spec: { eyeCross: true, eyeScale: 1.1 } },
    { id: 'droopy', name: 'DROOPY EYES', sub: 'exhausted since the litter box', spec: { droop: 1.5 } },
    { id: 'bloodshot', name: 'BLOODSHOT EYES', sub: 'a_custom map of burst veins', spec: { eyeBlood: true, eyeScale: 1.2, droop: .8 } },
  ];

  const TEETH = [
    { id: 'normal', name: 'STANDARD STAIN', sub: 'gutter yellow, poetically' },
    { id: 'bigcrook', name: 'LARGE CROOKED FRONT TEETH', sub: 'chalk for the ghetto', spec: { teethBigCrook: true, teethSize: 1.5 } },
    { id: 'missing', name: 'MISSING TEETH', sub: 'whistling S sounds since 2011', spec: { teethMissing: true } },
    { id: 'rotten', name: 'YELLOW ROTTEN TEETH', sub: 'advanced floral decay', spec: { teethRotten: true } },
  ];

  const EARS = [
    { id: 'normal', name: 'STANDARD DISHED', sub: 'picks up everything, understands little' },
    { id: 'huge', name: 'EXTREMELY LARGE EARS', sub: 'satellite dishes for whispers', spec: { earSize: 1.95 } },
    { id: 'torn', name: 'TORN EARS', sub: 'a history of small brutal arguments', spec: { earTorn: true } },
  ];

  const SNOUTS = [
    { id: 'normal', name: 'STANDARD SNIFFER', sub: 'knows where the trash day is' },
    { id: 'long', name: 'LONG RAT SNOUT', sub: 'reaches places manners forbid', spec: { snoutLen: .40 } },
    { id: 'short', name: 'SHORT DEFORMED SNOUT', sub: 'crushed at the alley Olympics', spec: { snoutLen: .07, snoutShort: true } },
    { id: 'bent', name: 'BENT NOSE', sub: 'points slightly left of reality', spec: { snoutLen: .2, snoutBent: .5 } },
    { id: 'bulb', name: 'BULBOUS NOSE', sub: 'a thyroid with a nose on it', spec: { snoutLen: .2, bulb: true } },
  ];

  const DETAILS = [
    { id: 'warts', name: 'WARTS', sub: 'radar bumps' },
    { id: 'pimples', name: 'PIMPLES', sub: 'tender and glossy' },
    { id: 'scars', name: 'SCARS', sub: 'invoices from alley life' },
    { id: 'baldp', name: 'BALD PATCHES', sub: 'stress made visible' },
    { id: 'whisk', name: 'DIRTY WHISKERS', sub: 'greased to a shine' },
    { id: 'blemish', name: 'SKIN BLEMISHES', sub: 'gravel coffee spots' },
    { id: 'jaw', name: 'CROOKED JAW', sub: 'one argument left unhealed' },
    { id: 'uneven', name: 'UNEVEN EARS', sub: 'wound up different lengths' },
    { id: 'patches', name: 'MISSING FUR PATCHES', sub: 'molting zones, legal tender' },
  ];

  /* ================= config ================= */
  const DEFAULT_CFG = {
    gender: 'male', body: 'fatround', fur: 'grey',
    eyes: 'normal', teeth: 'normal', ears: 'normal', snout: 'long',
    details: [], name: '',
  };

  function strHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* run fn with a deterministic RNG swapped into RC helpers so rebuilds
     don't reshuffle wart placement etc. every selection click */
  function withSeed(seed, fn) {
    let s = (seed || 1) >>> 0;
    const rr = (a = 0, b = 1) => {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return a + (s / 4294967296) * (b - a);
    };
    const or = RC.rand, oi = RC.ri, op = RC.pick, os = RC.shuffled;
    RC.rand = (a, b) => rr(a, b);
    RC.ri = (a, b) => Math.floor(rr(a, b + 1));
    RC.pick = arr => arr[Math.floor(rr(0, arr.length))];
    RC.shuffled = arr => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rr(0, i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    };
    try { return fn(); } finally { RC.rand = or; RC.ri = oi; RC.pick = op; RC.shuffled = os; }
  }

  const SKINS = [0xcdb59b, 0xa8a6a0, 0xb6c1a8, 0xc4a688, 0xb59b8f, 0xd9a48e];
  const IRISES = [0x2a6d5c, 0x50421f, 0x3a4b6d, 0x6d2a2a, 0x1f1f1f];

  /* config -> buildRat spec. Deterministic per config content. */
  RC.specFromConfig = function (cfg) {
    cfg = cfg || DEFAULT_CFG;
    const body = BODIES.find(b => b.id === cfg.body) || BODIES[0];
    const fur = FURS.find(f => f.id === cfg.fur) || FURS[0];
    const eyes = EYES.find(o => o.id === cfg.eyes);
    const teeth = TEETH.find(o => o.id === cfg.teeth);
    const ears = EARS.find(o => o.id === cfg.ears);
    const snout = SNOUTS.find(o => o.id === cfg.snout);
    const lookKey = JSON.stringify({ g: cfg.gender, b: cfg.body, f: cfg.fur, y: cfg.eyes, t: cfg.teeth, e: cfg.ears, s: cfg.snout, d: cfg.details });

    return withSeed(strHash(lookKey + '::v1'), () => {
      const S = {
        gender: cfg.gender,
        fur: fur.hex ? parseInt(fur.hex.slice(1), 16) : 0x4a3b2a,
        skin: RC.pick(SKINS),
        iris: RC.pick(IRISES),
        hairStyle: cfg.gender === 'female' ? RC.pick(['messy', 'pigtails', 'scrags']) : RC.pick(['bald', 'messy', 'scrags', 'mohawk']),
        hairColor: RC.pick([0x181310, 0x2b1f12, 0x54431f, 0x0d0d0d, 0x6a2f18]),
        earSize: RC.rand(.88, 1.15),
        snoutLen: RC.rand(.15, .24),
        teethSize: RC.rand(.85, 1.1),
        hunch: RC.rand(.04, .12),
        scale: RC.rand(.96, 1.05),
        width: 1,
        belly: 1,
        warts: 0, scars: 0, baldPatch: 0,
        droop: RC.rand(.15, .55),
        limp: false,
        pose: RC.ri(0, 2),
      };
      if (body.spec) Object.assign(S, body.spec);
      if (body.spec && body.spec.asym) {
        S.armLenR = RC.rand(.68, 1.3);
        S.shROffset = RC.rand(-.07, .02);
        S.legLenR = RC.rand(.72, .96);
        S.hipsTilt = RC.rand(-.06, .06);
        S.limp = true;
        S.sideHump = RC.rand(0, 1) < .7;
        S.sinister = true;
        S.torsoYaw = RC.rand(-.22, .22);
        S.snoutBent = RC.rand(.15, .4);
      }
      if (cfg.gender === 'female') { S.hipsW = 1.16; S.shoulderW = .215; S.scale = (S.scale || 1) * .97; }
      else S.shoulderW = .27;
      [eyes, teeth, ears, snout].forEach(o => { if (o && o.spec) Object.assign(S, o.spec); });
      const d = cfg.details || [];
      if (d.includes('warts')) { S.warts = 10; S.wartsBody = true; }
      if (d.includes('pimples')) S.pimples = true;
      if (d.includes('scars')) { S.scars = 4; S.scarsBody = true; }
      if (d.includes('baldp')) { S.baldPatch = 1.25; }
      if (d.includes('whisk')) S.dirtyWhisk = true;
      if (d.includes('blemish')) S.blemish = true;
      if (d.includes('jaw')) S.jawCrook = true;
      if (d.includes('uneven')) S.unevenEars = true;
      if (d.includes('patches')) S.furPatches = true;
      if (fur.special) S.furSpecial = fur.special;
      return S;
    });
  };

  /* ================= studio stage ================= */
  const stage = new THREE.Group();
  let open = false, preview = null, scene = null;
  const orbit = { yaw: 2.6, dist: 4.6, hOff: 0, auto: true, lookY: 1.22 };

  RC.creatorOpen = false;   /* mirrored state for main */

  function buildStage() {
    /* floor + round concrete pedestal */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.concrete(16));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    stage.add(floor);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, .14, 36), M.concreteGloss(3));
    ped.position.y = .07;
    ped.receiveShadow = true;
    stage.add(ped);
    const grimeRing = new THREE.Mesh(new THREE.RingGeometry(2.35, 3.1, 40), M.rust(2));
    grimeRing.rotation.x = -Math.PI / 2;
    grimeRing.position.y = .004;
    stage.add(grimeRing);

    /* rusted corrugated backdrop, slightly arced */
    const wall = M.concrete(6);
    [[-4.6, 8, .55], [0, 9.6, 0], [4.6, 8, -.55]].forEach(([x, w, ry], i) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(w, 11, .5), i === 2 ? M.rust(5) : wall);
      p.position.set(x, 4.2, -7.0 - Math.abs(ry) * 2.6);
      p.rotation.y = ry;
      p.receiveShadow = true;
      stage.add(p);
      for (let q = 0; q < 3; q++) {
        const girder = new THREE.Mesh(new THREE.BoxGeometry(.22, 11, .28), M.rust(4));
        girder.position.set(x + RC.rand(-w / 2 + .6, w / 2 - .6), 4.2, -6.4 - Math.abs(ry) * 2.6);
        stage.add(girder);
      }
    });

    /* hanging cage key lamp above the subject */
    const lampG = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, 4.6, 4), M.black(.9));
    cord.position.y = 5.6; lampG.add(cord);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(.2, .13, .24, 8, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x2a2018, wireframe: true }));
    cage.position.y = 3.28; lampG.add(cage);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), M.emissive(0xffdf9e, 3.2));
    bulb.position.y = 3.2; lampG.add(bulb);
    lampG.position.set(0, 0, .5);
    stage.add(lampG);

    /* two studio tripods w/ rim lights (props) */
    [[-2.9, -1.9, 0x5a4426], [3.05, -.8, 0x33402a]].forEach(([x, z, c], i) => {
      const tri = new THREE.Group();
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, 1.9, 6), M.black(.8, .5));
      stand.position.y = .95; tri.add(stand);
      for (let l = 0; l < 3; l++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.15, 5), M.black(.8, .5));
        leg.position.y = .48;
        const a = l / 3 * Math.PI * 2;
        leg.position.set(Math.cos(a) * .3, 0, Math.sin(a) * .3);
        leg.rotation.z = Math.cos(a) * .3; leg.rotation.x = -Math.sin(a) * .3;
        tri.add(leg);
      }
      const head = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .3, 10), M.black(.6, .6));
      head.position.y = 2.0; head.rotation.x = -.5; tri.add(head);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(.14, 12), M.emissive(0xfff2d0, 1.6));
      lens.position.set(0, 1.9, .18); lens.rotation.x = -.4; tri.add(lens);
      tri.position.set(x, .14, z);
      tri.rotation.y = i ? -.9 : .9;
      stage.add(tri);
    });

    /* signage: acid-green lab labels on the back wall */
    function sign(text, color, w, h, pos, rotY) {
      const mat = new THREE.MeshBasicMaterial({
        map: T.neon(text, color, 'bold 110px Impact, sans-serif'),
        transparent: true, side: THREE.DoubleSide, depthWrite: false
      });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      s.position.copy(pos); s.rotation.y = rotY;
      stage.add(s);
      const glow = new THREE.PointLight(color, 1.1, 9);
      glow.position.copy(pos); glow.position.z += .7;
      stage.add(glow);
      return s;
    }
    sign('BIO-ASSEMBLY', 0x9dff2a, 5.2, 1.3, new THREE.Vector3(-1.8, 7.2, -6.2), .3);
    sign('FREAK WING / 04', 0xe8ff2a, 4.2, 1.05, new THREE.Vector3(2.9, 5.4, -6.25), -.28);

    /* ================= photography lighting =================
       (decay-2 physical falloff: place lamps close & punchy)  */
    const fill = new THREE.HemisphereLight(0x414b58, 0x0a0a0c, .5);
    stage.add(fill);

    const key = new THREE.SpotLight(0xffe9cf, 7.2, 30, .6, .55, 1);
    key.position.set(0, 6.6, 3.7);
    const keyTgt = new THREE.Object3D(); keyTgt.position.set(0, 1.2, 0);
    stage.add(keyTgt); key.target = keyTgt;
    key.castShadow = true;
    stage.add(key);

    /* acid-green rim from back-left, toxic yellow kiss from back-right */
    const rimA = new THREE.SpotLight(0x9dff2a, 2.9, 24, .8, .6, 1.3);
    rimA.position.set(-4.6, 2.9, -3.7);
    rimA.target = keyTgt; stage.add(rimA);
    const rimB = new THREE.SpotLight(0xe8ff2a, 2.3, 24, .85, .65, 1.4);
    rimB.position.set(4.8, 2.4, -2.2);
    rimB.target = keyTgt; stage.add(rimB);

    /* soft bounce */
    const bounce = new THREE.PointLight(0x9aa6c0, .45, 14);
    bounce.position.set(2.2, 1.9, 3.4);
    stage.add(bounce);

    scene.add(stage);
  }

  /* ================= preview rebuild ================= */
  function rebuild() {
    if (!open) return;
    if (preview) {
      RC.disposeTree(preview.group);
      preview = null;
    }
    const spec = RC.specFromConfig(cfg);
    preview = RC.buildRat(spec);
    preview.group.position.set(0, .14, 0);
    preview.group.rotation.y = 0;
    preview.anim.mode = 'idle';
    preview.anim.speed = 0;
    stage.add(preview.group);
  }

  /* ================= ================= UI ================= */
  let cfg = null, tab = 'flesh';
  let onConfirm = null;
  RC.creatorSfx = null;   /* assigned by main: (kind) => sound */

  function loadCfg() {
    try {
      const raw = localStorage.getItem('RC_char_v1');
      if (raw) {
        const c = JSON.parse(raw);
        if (c && GENDERS.some(g => g.id === c.gender)) return Object.assign({}, DEFAULT_CFG, c);
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_CFG);
  }
  function saveCfg() {
    try { localStorage.setItem('RC_char_v1', JSON.stringify(cfg)); } catch (e) {}
  }

  function optionCard(selected, name, sub, onclick, warn) {
    const el = document.createElement('div');
    el.className = 'cCard' + (selected ? ' sel' : '') + (warn ? ' warn' : '');
    el.innerHTML = `<h4>${name}</h4>${sub ? `<div class="fl">${sub}</div>` : ''}`;
    el.onclick = () => { RC.creatorSfx && RC.creatorSfx('click'); onclick(); };
    return el;
  }

  function render() {
    /* tabs */
    const tabs = [['flesh', 'FLESH'], ['fur', 'FUR COAT'], ['face', 'FACE'], ['defects', 'GROSS DEFECTS'], ['pose', 'INSPECT']];
    const tWrap = $('creatorTabs');
    tWrap.innerHTML = '';
    tabs.forEach(([id, label]) => {
      const el = document.createElement('div');
      el.className = 'catTab' + (id === tab ? ' active' : '');
      el.textContent = label;
      el.onclick = () => { tab = id; render(); };
      tWrap.appendChild(el);
    });

    const grid = $('creatorOpts');
    grid.innerHTML = '';
    grid.className = tab === 'defects' ? 'multi' : '';

    if (tab === 'flesh') {
      grid.className = 'twoCol';
      const gLabel = document.createElement('div'); gLabel.className = 'secLabel'; gLabel.textContent = '01 / SEX OF THE VERMIN';
      grid.appendChild(gLabel);
      GENDERS.forEach(op => grid.appendChild(optionCard(cfg.gender === op.id, op.name, op.sub, () => {
        cfg.gender = op.id; saveCfg(); render(); rebuild(); swoosh();
      })));
      const bLabel = document.createElement('div'); bLabel.className = 'secLabel'; bLabel.textContent = '02 / BODY PLAN';
      grid.appendChild(bLabel);
      BODIES.forEach(op => grid.appendChild(optionCard(cfg.body === op.id, op.name, op.sub, () => {
        cfg.body = op.id; saveCfg(); render(); rebuild(); swoosh();
      })));
    } else if (tab === 'fur') {
      FURS.forEach(op => grid.appendChild(optionCard(cfg.fur === op.id, op.name, op.sub, () => {
        cfg.fur = op.id; saveCfg(); render(); rebuild(); swoosh();
      })));
    } else if (tab === 'face') {
      [
        ['EYES', EYES, 'eyes'],
        ['TEETH', TEETH, 'teeth'],
        ['EARS', EARS, 'ears'],
        ['SNOUT', SNOUTS, 'snout'],
      ].forEach(([label, list, key]) => {
        const sLabel = document.createElement('div'); sLabel.className = 'secLabel'; sLabel.textContent = label;
        grid.appendChild(sLabel);
        list.forEach(op => grid.appendChild(optionCard(cfg[key] === op.id, op.name, op.sub, () => {
          cfg[key] = op.id; saveCfg(); render(); rebuild(); swoosh();
        })));
      });
    } else if (tab === 'defects') {
      const hint = document.createElement('div'); hint.className = 'secLabel';
      hint.textContent = 'STACK AS MANY AS YOU CAN CARRY —';
      grid.appendChild(hint);
      DETAILS.forEach(op => {
        const on = cfg.details.includes(op.id);
        const el = document.createElement('div');
        el.className = 'cCard multi' + (on ? ' sel' : '');
        el.innerHTML = `<h4>${op.name}</h4><div class="fl">${op.sub}</div><div class="tog">${on ? 'ON' : 'OFF'}</div>`;
        el.onclick = () => {
          const i = cfg.details.indexOf(op.id);
          if (i >= 0) cfg.details.splice(i, 1); else cfg.details.push(op.id);
          saveCfg(); render(); rebuild(); swoosh();
        };
        grid.appendChild(el);
      });
    } else {
      /* INSPECT tab: portrait buttons */
      const tip = document.createElement('div'); tip.className = 'secLabel';
      tip.textContent = 'DRAG THE SUBJECT TO SPIN. SCROLL TO LENS IN.';
      grid.appendChild(tip);
      [[0, 'FRONT'], [.65, 'THREE-QUARTER'], [Math.PI / 2, 'SIDE'], [Math.PI, 'BACK'], [-Math.PI / 2, 'OTHER SIDE']].forEach(([yaw, label]) => {
        const b = document.createElement('button');
        b.className = 'rbtn viewBtn';
        b.textContent = label;
        b.onclick = () => setView(yaw);
        grid.appendChild(b);
      });
    }

    $('viewerLbl').textContent = `SUBJECT ${cfg.name || 'UNNAMED'} — ${cfg.gender.toUpperCase()} FRAME`;
  }

  function swoosh() {
    /* little camera kick on every selection: breathe out, settle back */
    const base = RC.clamp(orbit.dist, 2.2, 8.5);
    orbit.dist = Math.min(base * 1.12, 9);
    RC.Tweens.add({
      dur: .45, ease: RC.smooth,
      onUpdate: k => { orbit.dist = RC.lerp(base * 1.12, base, k); },
    });
  }

  function setView(yaw) {
    const from = orbit.yaw;
    let delta = yaw - from;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));  /* shortest spin */
    RC.Tweens.add({
      dur: .55, ease: RC.smooth,
      onUpdate: k => {
        orbit.yaw = from + delta * k;
        orbit.auto = false;
      },
    });
  }

  function setSpinAuto() {
    orbit.auto = !orbit.auto;
    $('btnSpin').classList.toggle('on', orbit.auto);
  }

  /* ================= random freak ================= */
  function randomFreak() {
    const nDetails = RC.ri(0, 4);
    cfg = {
      gender: RC.pick(GENDERS).id,
      body: RC.pick(BODIES).id,
      fur: RC.pick(FURS).id,
      eyes: RC.pick(EYES).id,
      teeth: RC.pick(TEETH).id,
      ears: RC.pick(EARS).id,
      snout: RC.pick(SNOUTS).id,
      details: RC.shuffled(DETAILS).slice(0, nDetails).map(d => d.id),
      name: cfg && cfg.name ? cfg.name : '',
    };
    saveCfg(); render(); rebuild();
    $('viewerLbl').textContent = 'RANDOM FREAK COMPILED — REGRETTABLE, STUNNING';
  }

  /* ================= init / open / close ================= */
  RC.creatorBoot = function (theScene) {
    scene = theScene;
    buildStage();
    cfg = loadCfg();

    $('btnSpin').onclick = () => { setSpinAuto(); };
    $('btnLens').onclick = () => { RC.creatorSfx('click'); RC.creatorResetLens(); };
    $('btnFreak').onclick = () => { randomFreak(); RC.creatorSfx && RC.creatorSfx('thud'); };
    $('btnConfirm').onclick = () => {
      cfg.name = $('ratName').value.trim() || 'UNNAMED FREAK';
      saveCfg();
      const saved = JSON.parse(JSON.stringify(cfg));
      close();
      onConfirm && onConfirm(saved);
    };
    /* name field live-updates the viewer label */
    $('ratName').addEventListener('input', () => {
      cfg.name = $('ratName').value;
      $('viewerLbl').textContent = `SUBJECT ${cfg.name.toUpperCase() || 'UNNAMED'} — ${cfg.gender.toUpperCase()} FRAME`;
    });
  };

  RC.creatorOnConfirm = fn => { onConfirm = fn; };

  RC.creatorOpenScreen = function () {
    open = true; RC.creatorOpen = true;
    stage.visible = true;
    $('creator').classList.remove('hidden');
    $('btnSpin').classList.toggle('on', orbit.auto);
    orbit.yaw = 2.6; orbit.dist = 4.6; orbit.hOff = 0;
    $('ratName').value = cfg.name || '';
    rebuild();
    render();
    if (RC.creatorSetMode) RC.creatorSetMode('creator');
  };

  function close() {
    open = false; RC.creatorOpen = false;
    stage.visible = false;
    $('creator').classList.add('hidden');
    if (preview) { RC.disposeTree(preview.group); preview = null; }
    if (RC.creatorSetMode) RC.creatorSetMode('title');
  }
  RC.creatorClose = close;

  /* orbit drag / zoom (called from main's canvas handlers) */
  RC.creatorOrbit = function (dx, dy) {
    if (!open) return;
    orbit.yaw -= dx * .008;
    orbit.hOff = RC.clamp(orbit.hOff + dy * .004, -1, 1.4);
    orbit.auto = false;
    $('btnSpin').classList.remove('on');
  };
  RC.creatorZoom = function (dy) {
    if (!open) return;
    orbit.dist = RC.clamp(orbit.dist * (1 + dy * .0012), 1.8, 8.5);
  };
  /* reset to the money shot */
  RC.creatorResetLens = function () {
    if (!open) return;
    const d0 = orbit.dist, h0 = orbit.hOff;
    RC.Tweens.add({
      dur: .4, ease: RC.smooth,
      onUpdate: k => {
        orbit.dist = RC.lerp(d0, 4.6, k);
        orbit.hOff = RC.lerp(h0, 0, k);
      },
    });
  };

  /* per-frame: auto-orbit + idle animation */
  RC.creatorTick = function (dt) {
    if (!open) return;
    if (orbit.auto) orbit.yaw += dt * .45;
    if (preview) RC.animateRat(preview, dt);
  };

  /* pose consumed by the camera director in main.js */
  RC.creatorPose = null;   /* assigned when in use (documented below) */

  /* main asks for pose each frame while mode === 'creator':
     RC.creatorPoseUpdate(pos, look) -> true when the creator owns the shot */
  RC.creatorPoseUpdate = function (pos, look) {
    if (!open) return false;
    const baseH = RC.clamp(1.0 + orbit.dist * .2 + orbit.hOff, .45, 5.4);
    pos.set(Math.sin(orbit.yaw) * orbit.dist, baseH, Math.cos(orbit.yaw) * orbit.dist);
    look.set(0, orbit.lookY, 0);
    return true;
  };
})();
