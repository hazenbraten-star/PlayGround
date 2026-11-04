/* ================= creator.js — STEP 2 · THE FLESH ATELIER ============
   Character creation screen: own dark-industrial studio scene rendered in
   place of the runway, drag-rotate / zoom / FRONT-SIDE-BACK views, data-
   driven gender / body / fur / face / gross-details options that rebuild
   the 3D rat-human instantly, CREATE RANDOM FREAK, name input, and a
   confirm that saves the full config for the runway.                    */
(function () {
  const RC = window.RC, M = RC.materials;
  const THREE = window.THREE;
  if (!window.THREE) return;

  const $ = id => document.getElementById(id);

  /* ================================================================ *
   *  DATA — every wardrobe of flesh is data-driven, like the game     *
   * ================================================================ */
  const GENDERS = [
    { id: 'm', name: 'MALE RAT HUMAN', sub: 'squared skull. heavy brow. marketing his own stench.' },
    { id: 'f', name: 'FEMALE RAT HUMAN', sub: 'narrower frame, wider haunches. prettier menace.' },
  ];

  const BODY_TYPES = [
    { id: 'skinny',  name: 'EXTREMELY SKINNY',   flavor: 'spoon-thin. ribs like sewer celery.',              geo: { width: .66, belly: .72, hunch: .08, scale: 1.02, legLen: 1.05, armLen: 1.05, shoulderW: .94 } },
    { id: 'round',   name: 'FAT AND ROUND',      flavor: 'a rat that rolled somewhere scenic.',              geo: { width: 1.12, belly: 1.55, hunch: .12, scale: .98, hipW: 1.15 } },
    { id: 'muscle',  name: 'MUSCULAR',           flavor: 'lifted the wrong pump. kept the pump.',            geo: { width: 1.06, belly: .92, hunch: .06, scale: 1.05, shoulderW: 1.34, armThick: 1.4 } },
    { id: 'tall',    name: 'TALL AND SKINNY',    flavor: 'grew downward through the drainpipe.',             geo: { width: .72, belly: .8, hunch: .06, scale: 1.17, legLen: 1.16, armLen: 1.1 } },
    { id: 'short',   name: 'SHORT AND DEFORMED', flavor: 'the mold got there first. it won.',                geo: { width: 1.05, belly: 1.12, hunch: .27, scale: .78, legLen: .66, armLen: .82 } },
    { id: 'hunched', name: 'HUNCHED AND CROOKED',flavor: 'apologizes with posture. constantly.',             geo: { width: .95, belly: 1.05, hunch: .6, scale: .96, torsoTilt: .14, armLen: .92 } },
    { id: 'obese',   name: 'OBESE',              flavor: 'ate the fashion budget and the budget maker.',     geo: { width: 1.3, belly: 2.05, hunch: .2, scale: 1.0, shoulderW: 1.12, hipW: 1.3 } },
    { id: 'mutant',  name: 'ASYMMETRICAL MUTANT',flavor: 'two rats, half a plan, one good arm.',             geo: { width: .95, belly: 1.15, hunch: .3, scale: 1.0, asym: true, torsoTilt: .12 } },
  ];

  const FURS = [
    { id: 'grey',    name: 'DIRTY GREY',             hex: 0x8a8578, chip: '#8a8578', skin: 0xb59b8f },
    { id: 'brown',   name: 'DARK BROWN',             hex: 0x4a3626, chip: '#4a3626', skin: 0xb08f78 },
    { id: 'black',   name: 'BLACK',                  hex: 0x2a2624, chip: '#2a2624', skin: 0xa8917d },
    { id: 'white',   name: 'DIRTY WHITE',            hex: 0xcfc4b0, chip: '#cfc4b0', skin: 0xc2a893 },
    { id: 'beige',   name: 'YELLOWISH BEIGE',        hex: 0xb09a6a, chip: '#b09a6a', skin: 0xc4a688 },
    { id: 'reddish', name: 'REDDISH BROWN',          hex: 0x7a4a32, chip: '#7a4a32', skin: 0xb59b8f },
    { id: 'patchy',  name: 'PATCHY MIXED FUR',       hex: 0x58514a, chip: 'patchy', skin: 0xb59b8f, furPatchy: true },
    { id: 'hairless',name: 'ALMOST HAIRLESS PINK SKIN', hex: 0xc9a094, chip: '#c9a094', skin: 0xd8a8a0, strandMul: .15, baldPatches: 4 },
  ];

  const IRIS = [0x2a6d5c, 0x50421f, 0x3a4b6d, 0x6d2a2a, 0x1f1f1f, 0x7a6a2a];

  const HAIR = ['messy', 'mohawk', 'scrags', 'pigtails', 'bald'];
  const HAIR_COLORS = [0x181310, 0x2b1f12, 0x54431f, 0x0d0d0d, 0x6a2f18];

  const FACE = [
    { id: 'eyes', label: 'EYES', options: [
      { id: 'normal',  name: 'NORMAL BEADY',        apply: {} },
      { id: 'small',   name: 'SMALL EYES',          apply: { eyeSize: .6, droop: .2 } },
      { id: 'huge',    name: 'HUGE BULGING EYES',   apply: { eyeSize: 1.55, eyeBulge: true, droop: -.25 } },
      { id: 'cross',   name: 'CROSS-EYED',          apply: { crossEye: true, eyeSize: .95 } },
      { id: 'droopy',  name: 'DROOPY EYES',         apply: { droop: 1.25, eyeSize: .85 } },
      { id: 'blood',   name: 'BLOODSHOT EYES',      apply: { bloodshot: true, eyeSize: 1.15 } },
    ]},
    { id: 'teeth', label: 'TEETH', options: [
      { id: 'normal',  name: 'NORMAL YELLOW',            apply: {} },
      { id: 'crooked', name: 'LARGE CROOKED FRONT TEETH', apply: { teethStyle: 'crooked' } },
      { id: 'missing', name: 'MISSING TEETH',            apply: { teethStyle: 'missing' } },
      { id: 'rotten',  name: 'YELLOW ROTTEN TEETH',      apply: { teethStyle: 'rotten', teethSize: 1.15 } },
    ]},
    { id: 'ears', label: 'EARS', options: [
      { id: 'normal', name: 'NORMAL RAT EARS',          apply: {} },
      { id: 'huge',   name: 'EXTREMELY LARGE RAT EARS', apply: { earSize: 1.85 } },
      { id: 'torn',   name: 'TORN EARS',                apply: { tornEars: true, earSize: .95 } },
    ]},
    { id: 'snout', label: 'NOSE & SNOUT', options: [
      { id: 'normal',  name: 'NORMAL RAT SNOUT',   apply: {} },
      { id: 'bent',    name: 'BENT NOSE',          apply: { noseStyle: 'bent' } },
      { id: 'bulbous', name: 'BULBOUS NOSE',       apply: { noseStyle: 'bulbous' } },
      { id: 'long',    name: 'LONG RAT SNOUT',     apply: { snoutLen: .42 } },
      { id: 'short',   name: 'SHORT DEFORMED SNOUT', apply: { snoutLen: .1, snoutTwist: .14 } },
    ]},
  ];

  const DETAILS = [
    { id: 'warts',     name: 'WARTS',              apply: { warts: 7 } },
    { id: 'pimples',   name: 'PIMPLES',            apply: { pimples: 9 } },
    { id: 'scars',     name: 'SCARS',              apply: { scars: 4 } },
    { id: 'bald',      name: 'BALD PATCHES',       apply: { baldPatches: 6 } },
    { id: 'whiskers',  name: 'DIRTY WHISKERS',     apply: { dirtyWhiskers: true } },
    { id: 'blemish',   name: 'SKIN BLEMISHES',     apply: { blemishes: 9 } },
    { id: 'jaw',       name: 'CROOKED JAW',        apply: { crookedJaw: true } },
    { id: 'unevenears',name: 'UNEVEN EARS',        apply: { unevenEars: true } },
    { id: 'nofur',     name: 'MISSING FUR PATCHES',apply: { furPatches: 7 } },
  ];

  /* ================================================================ *
   *  STATE                                                           *
   * ================================================================ */
  const DEFAULT_STATE = {
    gender: 'm', body: 'round', fur: 'grey',
    eyes: 'normal', teeth: 'normal', ears: 'normal', snout: 'normal',
    details: ['whiskers'],
    hair: null, iris: 0, hairColor: 0,
  };
  let state = loadSaved() || JSON.parse(JSON.stringify(DEFAULT_STATE));
  let yaw = 0, yawT = 0, camDist = 4.6, camDistT = 4.6, lookY = 1.1;
  let lastPointer = 0;
  let chr = null;

  function loadSaved() {
    try {
      const raw = localStorage.getItem('rc_atelier_v1');
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.state) return null;
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), s.state);
    } catch (e) { return null; }
  }

  /* ================================================================ *
   *  SPEC BUILDER — UI state → buildRat spec (the exact adapter)      *
   * ================================================================ */
  function opt(faceId, pickId) {
    const g = FACE.find(f => f.id === faceId);
    return g.options.find(o => o.id === pickId) || g.options[0];
  }

  function specFromState(st) {
    st = st || state;
    const bodyDef = BODY_TYPES.find(b => b.id === st.body) || BODY_TYPES[0];
    const fur = FURS.find(f => f.id === st.fur) || FURS[0];
    const hair = st.hair != null ? st.hair : (st.gender === 'f' ? 'pigtails' : 'messy');
    /* baseline spec, then each picked face option overrides its field */
    const spec = {
      gender: st.gender,
      body: Object.assign({}, bodyDef.geo),
      fur: fur.hex,
      skin: fur.skin,
      strandMul: fur.strandMul == null ? 1 : fur.strandMul,
      furPatchy: !!fur.furPatchy,
      iris: IRIS[(st.iris || 0) % IRIS.length],
      hairStyle: hair,
      hairColor: HAIR_COLORS[(st.hairColor || 0) % HAIR_COLORS.length],
      earSize: 1,
      snoutLen: .22,
      teethSize: 1,
      droop: .2,
      baldPatch: .4,
      pose: RC.ri(0, 2),
      limp: false,
    };
    if (fur.baldPatches) spec.baldPatches = fur.baldPatches;
    const face = opt('eyes', st.eyes).apply || {}; Object.assign(spec, face);
    Object.assign(spec, opt('ears', st.ears).apply || {});
    Object.assign(spec, opt('snout', st.snout).apply || {});
    Object.assign(spec, opt('teeth', st.teeth).apply || {});
    /* after face application, a hairless coat re-adds its own raw patches */
    if (fur.baldPatches && !spec.baldPatches) spec.baldPatches = fur.baldPatches;
    /* gross details: combine freely, last write wins per field */
    (st.details || []).forEach(id => {
      const d = DETAILS.find(x => x.id === id);
      if (d) Object.assign(spec, d.apply);
    });
    return spec;
  }

  /* ================================================================ *
   *  THE STUDIO — dark industrial photography pit                     *
   * ================================================================ */
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x0a0908);
  studio.fog = new THREE.FogExp2(0x090807, .055);

  const cam = new THREE.PerspectiveCamera(42, 1, .1, 80);
  cam.position.set(0, 1.7, 4.6);

  const dryFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), M.concrete(12));
  dryFloor.rotation.x = -Math.PI / 2;
  dryFloor.receiveShadow = true;
  studio.add(dryFloor);

  /* radius wall: the cyc */
  const cyc = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 12, 14, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x1a1714, roughness: .92, metalness: 0, side: THREE.BackSide })
  );
  cyc.position.y = 6.5;
  studio.add(cyc);

  /* rusty turntable the freak stands on, acid ring marking the podium */
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, .12, 28), M.rust(2));
  podium.position.y = .06;
  podium.receiveShadow = true; podium.castShadow = true;
  studio.add(podium);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.82, .018, 8, 48),
    M.emissive(0x9dff2a, 1.6)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .125;
  studio.add(ring);

  /* overhead truss + hanging industrial lamps (visual dressing) */
  const trussMat = M.rust(3);
  [-2.6, 3.4].forEach((z, i) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(9, .16, .16), trussMat);
    beam.position.set(0, 6.4, z);
    studio.add(beam);
    const lampShaft = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .5, 10), M.black(.5, .6));
    lampShaft.position.set(i ? 1.2 : -1.6, 5.9, z);
    studio.add(lampShaft);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.22, 14),
      new THREE.MeshBasicMaterial({ color: i ? 0xd8ff3a : 0xffe6c0 }));
    lens.position.set(lampShaft.position.x, 5.63, z + .07);
    lens.rotation.x = -.7;
    studio.add(lens);
  });

  /* dramatic dirty fashion lighting */
  const key = new THREE.SpotLight(0xffe6c0, 2.6, 26, .55, .55, 1.1);
  key.position.set(2.8, 5.2, 4.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  studio.add(key);
  const keyTarget = new THREE.Object3D();
  keyTarget.position.set(0, 1.05, 0);
  studio.add(keyTarget); key.target = keyTarget;

  const rimAcid = new THREE.SpotLight(0x9dff2a, 2.2, 20, .7, .6, 1.3);
  rimAcid.position.set(-4.6, 3.4, -3.2);
  studio.add(rimAcid); rimAcid.target = keyTarget;

  const rimToxic = new THREE.SpotLight(0xd8ff3a, 1.5, 20, .7, .6, 1.3);
  rimToxic.position.set(4.6, 3.1, -3.6);
  studio.add(rimToxic); rimToxic.target = keyTarget;

  const faceLift = new THREE.PointLight(0xfff4e0, .35, 9);
  faceLift.position.set(0, 1.4, 3.2);
  studio.add(faceLift);

  studio.add(new THREE.HemisphereLight(0x4a453e, 0x060505, .4));

  /* drifting dust in the beam */
  const dustN = 140, dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = RC.rand(-3, 3); dustPos[i * 3 + 1] = RC.rand(.2, 6); dustPos[i * 3 + 2] = RC.rand(-2, 3);
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x9a8f7a, size: .03, transparent: true, opacity: .4 }));
  studio.add(dust);

  function fitCamera() {
    if (!chr) return;
    const bb = new THREE.Box3().setFromObject(chr.group);
    const h = Math.max(.8, bb.max.y - bb.min.y);
    lookY = Math.min(1.15, h * .52);
    camDistT = RC.clamp(2.4 + h * 1.15, 3.0, 7.0);
  }

  /* ================================================================ *
   *  PREVIEW LIFECYCLE — rebuild instantly on any selection           *
   * ================================================================ */
  function rebuild() {
    if (chr) { RC.disposeTree(chr.group); }
    chr = RC.buildRat(specFromState());
    chr.group.position.set(0, .12, 0);
    chr.anim.mode = 'idle';
    chr.anim.speed = 0;
    chr.group.rotation.y = yaw;
    studio.add(chr.group);
    fitCamera();
    refreshRecipe();
  }

  /* ================================================================ *
   *  UI PANELS                                                        *
   * ================================================================ */
  function crSec(title) {
    const d = document.createElement('div');
    d.className = 'crSec';
    const h = document.createElement('h3');
    h.textContent = title;
    d.appendChild(h);
    return d;
  }

  function buildPanels() {
    /* ---- LEFT: gender + body type ---- */
    const left = $('creatorLeft');
    left.innerHTML = '';
    const secG = crSec('01 · GENDER');
    GENDERS.forEach(gn => {
      const b = document.createElement('button');
      b.className = 'optBtn big' + (state.gender === gn.id ? ' sel' : '');
      b.dataset.gid = gn.id;
      b.innerHTML = `<span class="obName">${gn.name}</span><span class="obSub">${gn.sub}</span>`;
      b.onclick = () => { if (state.gender !== gn.id) { state.gender = gn.id; touch(); } };
      secG.appendChild(b);
    });
    left.appendChild(secG);

    const secB = crSec('02 · BODY TYPE');
    BODY_TYPES.forEach(bt => {
      const b = document.createElement('button');
      b.className = 'optBtn' + (state.body === bt.id ? ' sel' : '');
      b.dataset.bid = bt.id;
      b.innerHTML = `<span class="obName">${bt.name}</span><span class="obSub">${bt.flavor}</span>`;
      b.onclick = () => { if (state.body !== bt.id) { state.body = bt.id; touch(); } };
      secB.appendChild(b);
    });
    left.appendChild(secB);

    /* ---- RIGHT: fur / face / gross details ---- */
    const right = $('creatorRight');
    right.innerHTML = '';
    const secF = crSec('03 · FUR COLOR');
    FURS.forEach(f => {
      const b = document.createElement('button');
      b.className = 'optBtn row' + (state.fur === f.id ? ' sel' : '');
      b.dataset.fid = f.id;
      const chip = document.createElement('span');
      chip.className = 'furChip' + (f.chip === 'patchy' ? ' patchy' : '');
      if (f.chip !== 'patchy') chip.style.background = f.chip;
      const lab = document.createElement('span');
      lab.className = 'obName';
      lab.textContent = f.name;
      b.appendChild(chip); b.appendChild(lab);
      b.onclick = () => { if (state.fur !== f.id) { state.fur = f.id; touch(); } };
      secF.appendChild(b);
    });
    right.appendChild(secF);

    FACE.forEach((grp, gi) => {
      const sec = crSec(`0${gi + 4} · FACE — ${grp.label}`);
      grp.options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'optBtn mini' + (state[grp.id] === o.id ? ' sel' : '');
        b.dataset.fg = grp.id; b.dataset.oid = o.id;
        b.innerHTML = `<span class="obName">${o.name}</span>`;
        b.onclick = () => { if (state[grp.id] !== o.id) { state[grp.id] = o.id; touch(); } };
        sec.appendChild(b);
      });
      right.appendChild(sec);
    });

    const secD = crSec('08 · RANDOM GROSS DETAILS — STACK THEM');
    DETAILS.forEach(d => {
      const b = document.createElement('button');
      b.className = 'optBtn mini togg' + ((state.details || []).includes(d.id) ? ' sel' : '');
      b.dataset.did = d.id;
      b.innerHTML = `<span class="obName">${d.name}</span><span class="tglMark">☣ FILTH</span>`;
      b.onclick = () => {
        state.details = state.details || [];
        const i = state.details.indexOf(d.id);
        if (i >= 0) state.details.splice(i, 1); else state.details.push(d.id);
        touch();
      };
      secD.appendChild(b);
    });
    right.appendChild(secD);
  }

  function refresh() {
    /* re-stamp selection classes into the existing DOM */
    document.querySelectorAll('#creatorLeft .optBtn').forEach(b => {
      if (b.dataset.gid) b.classList.toggle('sel', state.gender === b.dataset.gid);
      if (b.dataset.bid) b.classList.toggle('sel', state.body === b.dataset.bid);
    });
    document.querySelectorAll('#creatorRight .optBtn').forEach(b => {
      if (b.dataset.fid) b.classList.toggle('sel', state.fur === b.dataset.fid);
      if (b.dataset.fg) b.classList.toggle('sel', state[b.dataset.fg] === b.dataset.oid);
      if (b.dataset.did) b.classList.toggle('sel', (state.details || []).includes(b.dataset.did));
    });
    refreshRecipe();
  }

  function refreshRecipe() {
    const f = FURS.find(x => x.id === state.fur);
    const b = BODY_TYPES.find(x => x.id === state.body);
    const picks = ['eyes', 'teeth', 'ears', 'snout']
      .map(g => opt(g, state[g]).name)
      .filter(n => !/normal/i.test(n));
    const det = (state.details || []).length;
    $('crRecipe').textContent =
      `${state.gender === 'm' ? 'MALE' : 'FEMALE'} · ${b ? b.name : '—'} · ${(f ? f.name : '—').split(' (')[0]}` +
      (picks.length ? ' · ' + picks.join(' / ') : '') +
      (det ? ` · ${det} FILTH DETAIL${det > 1 ? 'S' : ''}` : '');
  }

  function touch() {
    refresh();
    rebuild();
    clickFx();
  }

  function clickFx() {
    if (RC.audio && RC.audio.click) RC.audio.click();
  }

  /* ================================================================ *
   *  CONTROLS — rotate 360°, zoom, snap views                         *
   * ================================================================ */
  const canvas = $('c');

  function onViewButtons() {
    document.querySelectorAll('.vbtn').forEach(b => {
      b.onclick = () => {
        const deg = parseFloat(b.dataset.yaw);
        yawT = deg % 360 === 90 ? Math.PI / 2 : deg % 360 === 180 ? Math.PI : 0;
        lastPointer = performance.now();
        document.querySelectorAll('.vbtn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        clickFx();
      };
    });
  }

  function bindOrbit() {
    let dragging = false, lastX = 0;
    canvas.addEventListener('pointerdown', e => {
      if (!active) return;
      dragging = true; lastX = e.clientX;
      lastPointer = performance.now();
      document.querySelectorAll('.vbtn').forEach(x => x.classList.remove('active'));
    });
    addEventListener('pointermove', e => {
      if (!dragging || !active) return;
      yawT += (e.clientX - lastX) * .011;
      lastX = e.clientX;
      lastPointer = performance.now();
    });
    addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('wheel', e => {
      if (!active) return;
      e.preventDefault();
      camDistT = RC.clamp(camDistT + (e.deltaY > 0 ? .42 : -.42), 2.2, 8.5);
      lastPointer = performance.now();
    }, { passive: false });
    $('zin').onclick = () => { camDistT = RC.clamp(camDistT - .55, 2.2, 8.5); clickFx(); };
    $('zout').onclick = () => { camDistT = RC.clamp(camDistT + .55, 2.2, 8.5); clickFx(); };
  }

  /* ================================================================ *
   *  RANDOM FREAK + CONFIRM                                           *
   * ================================================================ */
  function randomFreak() {
    state.gender = RC.pick(['m', 'f']);
    state.body = RC.pick(BODY_TYPES).id;
    state.fur = RC.pick(FURS).id;
    FACE.forEach(g => { state[g.id] = RC.pick(g.options).id; });
    /* stack 0–4 gross details */
    const ds = RC.shuffled(DETAILS.map(d => d.id)).slice(0, RC.ri(0, 4));
    state.details = ds;
    state.hair = RC.pick(HAIR);
    state.iris = RC.ri(0, IRIS.length - 1);
    state.hairColor = RC.ri(0, HAIR_COLORS.length - 1);
    refresh();
    rebuild();
    if (RC.audio) RC.audio.thud();
  }

  function confirm() {
    const nameIn = $('ratName');
    const name = (nameIn.value.trim() || 'UNNAMED FREAK').toUpperCase().slice(0, 22);
    const spec = specFromState();
    RC.playerConfig = { name, spec, state: JSON.parse(JSON.stringify(state)) };
    try { localStorage.setItem('rc_atelier_v1', JSON.stringify({ state, name })); } catch (e) {}
    close();
    if (onConfirm) onConfirm();
  }

  /* ================================================================ *
   *  OPEN / CLOSE                                                     *
   * ================================================================ */
  let active = false;
  let onConfirm = null;

  function open() {
    $('creator').classList.remove('hidden');
    active = true;
    yaw = 0; yawT = 0;
    /* restore a previously named freak into the field, if any */
    try {
      const raw = localStorage.getItem('rc_atelier_v1');
      if (raw) { const s = JSON.parse(raw); if (s && s.name) $('ratName').value = s.name; }
    } catch (e) {}
    buildPanels();
    onViewButtons();
    refresh();
    rebuild();
  }

  function close() {
    $('creator').classList.add('hidden');
    active = false;
  }

  function resize() {
    const w = innerWidth, h = innerHeight;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ================================================================ *
   *  FRAME UPDATE                                                     *
   * ================================================================ */
  function update(dt, t) {
    if (!chr) return;
    RC.animateRat(chr, dt);
    /* turntable: creep back into slow rotation when the hand leaves */
    if (performance.now() - lastPointer > 4200) yawT += dt * .16;
    yaw += (yawT - yaw) * (1 - Math.exp(-dt * 6));
    chr.group.rotation.y = yaw;
    camDist += (camDistT - camDist) * (1 - Math.exp(-dt * 5));
    const sway = Math.sin(t * .4) * .05;
    cam.position.set(Math.sin(t * .17) * .3 + sway, lookY + 1.0 + Math.sin(t * .27) * .05, camDist);
    cam.lookAt(0, lookY, 0);
    /* dust drifts toward the beam */
    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - dt * .07;
      if (y < .2) y = 6;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t + i * 1.7) * dt * .03);
    }
    pos.needsUpdate = true;
  }

  function render(renderer) {
    renderer.render(studio, cam);
  }

  /* ================================================================ *
   *  WIRE                                                             *
   * ================================================================ */
  $('btnFreak').onclick = randomFreak;
  $('btnConfirm').onclick = confirm;
  $('ratName').addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); });
  bindOrbit();

  RC.creator = {
    open, close, update, render,
    get active() { return active; },
    get preview() { return chr; },
    specFromState,
    get onConfirm() { return onConfirm; },
    set onConfirm(fn) { onConfirm = fn; },
  };
})();
