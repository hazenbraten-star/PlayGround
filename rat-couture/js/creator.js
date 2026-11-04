/* ================= creator.js — STEP 2: CHARACTER CREATION SYSTEM =====
   Casting lab: gender (morphed anatomy), 8 body types, fur coats with
   procedural strands/patches, full face work, combinable gross details,
   orbiting studio preview (drag/zoom/front-side-back), random freak
   generator, name plate, confirm -> saves RC.PLAYER_CONFIG.            */
(function () {
  const RC = window.RC, M = RC.materials, THREE = window.THREE;
  const $ = id => document.getElementById(id);

  /* ------------------------------------------------ data tables ------- */
  RC.CREATOR = {
    genders: [
      { id: 'male', name: 'MALE RAT HUMAN', sub: 'broad brute, heavy shoulders' },
      { id: 'female', name: 'FEMALE RAT HUMAN', sub: 'wide-hipped, feral' },
    ],
    bodies: [
      { id: 'skinny', name: 'EXTREMELY SKINNY', sub: 'a skeleton with ambitions', width: .72, belly: .5, hunch: .1, scale: 1 },
      { id: 'fatround', name: 'FAT AND ROUND', sub: 'jolly, in a threatening way', width: 1.22, belly: 1.9, hunch: .2, scale: .98 },
      { id: 'muscular', name: 'MUSCULAR', sub: 'lifts dumpsters recreationally', width: 1.16, belly: .85, hunch: .14, scale: 1.08, muscle: 1 },
      { id: 'tallskinny', name: 'TALL AND SKINNY', sub: 'used to be one rat, now a pole', width: .78, belly: .6, hunch: .14, scale: 1.28 },
      { id: 'shortdef', name: 'SHORT AND DEFORMED', sub: 'sincerely tried its best', width: 1.05, belly: 1.05, hunch: .44, scale: .74, limp: true, deform: 1 },
      { id: 'hunched', name: 'HUNCHED AND CROOKED', sub: 'spine: negotiable', width: .95, belly: .95, hunch: .6, scale: .95, crookedJaw: 1 },
      { id: 'obese', name: 'OBESE', sub: 'built like a load-bearing bin', width: 1.42, belly: 2.75, hunch: .24, scale: 1.04 },
      { id: 'mutant', name: 'ASYMMETRICAL MUTANT BODY', sub: 'one half argued with the other', width: 1.05, belly: 1.15, hunch: .34, scale: .98, asym: 1, limp: true },
    ],
    furs: [
      { id: 'dirtygrey', name: 'DIRTY GREY', hex: 0x58514a },
      { id: 'darkbrown', name: 'DARK BROWN', hex: 0x3a2b1c },
      { id: 'black', name: 'BLACK', hex: 0x26211d },
      { id: 'dirtywhite', name: 'DIRTY WHITE', hex: 0x9a938a },
      { id: 'beige', name: 'YELLOWISH BEIGE', hex: 0x8a7a4a },
      { id: 'redbrown', name: 'REDDISH BROWN', hex: 0x5e3a22 },
      { id: 'patchy', name: 'PATCHY MIXED FUR', hex: 0x4a3b2a, patch: [0x6a5a40, 0x2b2118, 0x8a7a4a] },
      { id: 'hairless', name: 'ALMOST HAIRLESS PINK SKIN', hex: 0xd8a596, skin: 0xe8b8a8, hairless: true },
    ],
    eyes: [
      { id: 'small', name: 'SMALL EYES', eyeScale: .58 },
      { id: 'huge', name: 'HUGE BULGING EYES', eyeScale: 1.75, bulge: 1 },
      { id: 'crossed', name: 'CROSS-EYED', crossed: 1, eyeScale: 1.05 },
      { id: 'droopy', name: 'DROOPY EYES', droop: 1.9, eyeScale: 1 },
      { id: 'bloodshot', name: 'BLOODSHOT EYES', bloodshot: 1, eyeScale: 1.15 },
    ],
    teeth: [
      { id: 'stock', name: 'CROOKED YELLOW (STOCK)', teethSize: 1.15 },
      { id: 'bigcrooked', name: 'LARGE CROOKED FRONT TEETH', teethSize: 2.4, crooked: 1 },
      { id: 'missing', name: 'MISSING TEETH', missing: 1, teethSize: .9 },
      { id: 'rotten', name: 'YELLOW ROTTEN TEETH', rotten: 1, teethSize: .95 },
    ],
    ears: [
      { id: 'stock', name: 'LARGE (STOCK)', earSize: 1.0 },
      { id: 'huge', name: 'EXTREMELY LARGE RAT EARS', earSize: 2.35 },
      { id: 'torn', name: 'TORN EARS', torn: 1, earSize: 1.3 },
    ],
    snouts: [
      { id: 'stock', name: 'CLEAN SNOUT (STOCK)', snoutLen: .2 },
      { id: 'long', name: 'LONG RAT SNOUT', snoutLen: .45 },
      { id: 'short', name: 'SHORT DEFORMED SNOUT', snoutLen: .05, squash: 1 },
      { id: 'bent', name: 'BENT NOSE', bent: 1, snoutLen: .22 },
      { id: 'bulbous', name: 'BULBOUS NOSE', bulb: 1, snoutLen: .18 },
    ],
    details: [
      { id: 'warts', name: 'WARTS' },
      { id: 'pimples', name: 'PIMPLES' },
      { id: 'scars', name: 'SCARS' },
      { id: 'baldpatches', name: 'BALD PATCHES' },
      { id: 'whiskers', name: 'DIRTY WHISKERS' },
      { id: 'blemishes', name: 'SKIN BLEMISHES' },
      { id: 'crookedjaw', name: 'CROOKED JAW' },
      { id: 'uneveyears', name: 'UNEVEN EARS' },
      { id: 'missingfur', name: 'MISSING FUR PATCHES' },
    ],
  };

  /* ------------------------------------------------ small helpers ----- */
  const localMats = {};
  function lmat(key, build) { if (!localMats[key]) localMats[key] = build(); return localMats[key]; }

  function blob(parent, mat, w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  /* random points on an ellipsoid surface, flattened blobs or aligned strands */
  function surfaceStuff(parent, cx, cy, cz, rx, ry, rz, n, make) {
    for (let i = 0; i < n; i++) {
      const a = RC.rand(0, Math.PI * 2), u = RC.rand(-1, 1), r = Math.sqrt(1 - u * u);
      const dx = Math.cos(a) * r, dy = u, dz = Math.sin(a) * r;
      make(
        parent,
        cx + dx * rx, cy + dy * ry, cz + dz * rz,
        dx * rx, dy * ry, dz * rz
      );
    }
  }
  function patchOn(parent, mat, cx, cy, cz, rx, ry, rz, n, s0, s1) {
    surfaceStuff(parent, cx, cy, cz, rx, ry, rz, n, (p, x, y, z) => {
      const s = RC.rand(s0, s1);
      const m = blob(p, mat, s, s * .45, s, x, y, z);
      m.rotation.set(RC.rand(0, 3), RC.rand(0, 3), RC.rand(0, 3));
    });
  }
  function strandOn(parent, mat, cx, cy, cz, rx, ry, rz, n, l0, l1) {
    const up = new THREE.Vector3(0, 1, 0);
    surfaceStuff(parent, cx, cy, cz, rx, ry, rz, n, (p, x, y, z) => {
      const dir = new THREE.Vector3(x, y, z).normalize();
      const len = RC.rand(l0, l1);
      const s = new THREE.Mesh(new THREE.CylinderGeometry(.0008, .0038, len, 4), mat);
      s.quaternion.setFromUnitVectors(up, dir);
      s.position.set(x, y, z);
      p.add(s);
    });
  }

  /* ------------------------------------------------ random config ----- */
  RC.randomCreatorConfig = function (opts = {}) {
    const C = RC.CREATOR;
    const cfg = {
      gender: RC.pick(C.genders).id,
      body: RC.pick(C.bodies).id,
      fur: RC.pick(C.furs).id,
      eyes: RC.pick(C.eyes).id,
      teeth: RC.pick(C.teeth).id,
      ears: RC.pick(C.ears).id,
      snout: RC.pick(C.snouts).id,
      details: C.details.filter(() => Math.random() < .25).map(d => d.id),
    };
    if (opts.gender) cfg.gender = opts.gender;
    if (!cfg.details.length) cfg.details = [RC.pick(C.details).id];
    return cfg;
  };

  /* ------------------------------------------------ spec resolution --- */
  RC.resolveSpec = function (cfg) {
    const C = RC.CREATOR;
    const base = (cfg._base = cfg._base || RC.randomRatSpec());
    const cat = (arr, id) => arr.find(x => x.id === id) || arr[0];
    const furDef = cat(C.furs, cfg.fur);
    const body = cat(C.bodies, cfg.body);
    const eyeDef = cat(C.eyes, cfg.eyes);
    const teethDef = cat(C.teeth, cfg.teeth);
    const earDef = cat(C.ears, cfg.ears);
    const snoutDef = cat(C.snouts, cfg.snout);
    const has = d => cfg.details.indexOf(d) >= 0;

    const spec = {
      fur: furDef.hex,
      skin: furDef.skin || base.skin,
      iris: base.iris,
      hairStyle: cfg.hairStyle || base.hairStyle,
      hairColor: base.hairColor,
      earSize: earDef.earSize,
      snoutLen: snoutDef.snoutLen,
      teethSize: teethDef.teethSize,
      hunch: body.hunch,
      scale: body.scale,
      width: body.width,
      belly: body.belly,
      droop: eyeDef.droop != null ? eyeDef.droop : base.droop * .3,
      warts: has('warts') ? RC.ri(4, 7) : 0,
      scars: has('scars') ? RC.ri(2, 4) : 0,
      limp: !!body.limp,
      baldPatch: furDef.hairless ? 1 : (has('baldpatches') ? .8 : 0),
      pose: base.pose,
      furDefId: furDef.id,
      faceFlags: {
        eyeScale: eyeDef.eyeScale,
        bulge: !!eyeDef.bulge,
        crossed: !!eyeDef.crossed,
        bloodshot: !!eyeDef.bloodshot,
        missing: !!teethDef.missing,
        rotten: !!teethDef.rotten,
        crooked: !!teethDef.crooked,
        torn: !!earDef.torn,
        bentNose: !!snoutDef.bent,
        bulbNose: !!snoutDef.bulb,
        snoutSquash: !!snoutDef.squash,
        unevenEars: has('uneveyears'),
      },
      bodyFlags: {
        muscle: !!body.muscle,
        asym: !!body.asym,
        deform: !!body.deform,
        crookedJaw: !!body.crookedJaw || has('crookedjaw'),
      },
    };
    return spec;
  };

  /* ================================================== MORPHS ========= */
  function morphGender(chr, gender) {
    const R = chr.refs, B = chr.bones, W = chr.spec.width;
    if (gender === 'female') {
      R.shL.position.x *= .86; R.shR.position.x *= .86;
      R.shL.scale.multiplyScalar(.9); R.shR.scale.multiplyScalar(.9);
      B.hips.scale.x *= 1.2;
      B.torso.children.forEach(c => { if (c === chr.refs.belly) c.scale.x *= .93; });
      /* heavy anatomy */
      [-1, 1].forEach(sx => blob(B.torso, chr.mats.skin, .08 * W, .085, .068, .085 * W * sx, .43, .14));
    } else {
      R.shL.position.x *= 1.2; R.shR.position.x *= 1.2;
      R.shL.scale.set(1.18, 1.08, 1.18); R.shR.scale.set(1.18, 1.08, 1.18);
      B.hips.scale.x *= .9;
      /* throat wattle (adam's apple, greasy) */
      blob(B.head, chr.mats.skin, .045, .055, .045, 0, .075, .05);
      /* heavier brow ridge */
      B.head.children.forEach(c => { if (c.geometry && c.geometry.type === 'BoxGeometry' && c.scale && Math.abs(c.position.y - .225) < .01) c.scale.y = 1.7; });
    }
  }

  function morphBody(chr, spec) {
    const F = spec.bodyFlags, R = chr.refs;
    if (F.muscle) {
      R.shL.scale.set(1.25 + .18, 1.12, 1.25 + .18); R.shR.scale.set(1.43, 1.12, 1.43);
      blob(chr.bones.torso, chr.mats.fur, .13, .07, .08, -.16, .38, .1);  // pec L
      blob(chr.bones.torso, chr.mats.fur, .13, .07, .08, .16, .38, .1);   // pec R
    }
    if (F.asym) {
      R.shR.position.y += .05;
      R.shR.scale.multiplyScalar(1.3);
      R.thR.scale.set(1.22, 1.05, 1.22);
      R.thL.scale.set(.85, .95, .85);
      chr.bones.skull.rotation.z = .14;
    }
    if (F.deform) {
      chr.bones.skull.scale.multiplyScalar(1.5);          // bulbous oversized head
      chr.bones.teeth.position.z += .012;
    }
  }

  function morphFace(chr, spec) {
    const F = spec.faceFlags, B = chr.bones, head = B.head;
    /* ---- eyes ---- */
    ['eyeL', 'eyeR'].forEach((k, i) => {
      const e = B[k];
      if (!e) return;
      const side = i === 0 ? -1 : 1;
      const sc = F.eyeScale || 1;
      if (Math.abs(sc - 1) > .02) e.scale.setScalar(sc);
      if (F.bulge) {
        const lid = e.children.find(c => c.name === 'lid');
        if (lid) lid.scale.set(.8, .55, 1);
      }
      if (F.crossed) ['iris', 'pupil'].forEach(nm => {
        const c = e.children.find(ch => ch.name === nm);
        if (c) c.position.x = -.013 * side;
      });
      if (F.bloodshot) {
        const bm = lmat('blood', () => new THREE.MeshStandardMaterial({ color: 0x9a1a10, roughness: .5 }));
        for (let q = 0; q < 5; q++) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(.035, .002, .002), bm);
          s.position.set(RC.rand(-.015, .015), RC.rand(-.015, .015), .027);
          s.rotation.z = RC.rand(0, Math.PI);
          e.add(s);
        }
      }
    });
    /* ---- teeth ---- */
    const toothIdx = { t1: null, t2: null, lower: null };
    toothIdx.t1 = B.teeth.children.find(c => c.name === 't1');
    toothIdx.t2 = B.teeth.children.find(c => c.name === 't2');
    toothIdx.lower = B.teeth.children.find(c => c.name === 'lower');
    if (F.missing) {
      if (toothIdx.t1) toothIdx.t1.visible = false;
      if (toothIdx.lower) { toothIdx.lower.scale.set(.55, .3, .55); toothIdx.lower.position.x += .02; }
    }
    if (F.rotten) {
      const rm = lmat('rotTeeth', () => new THREE.MeshStandardMaterial({ color: 0x8f7a24, roughness: .55 }));
      [toothIdx.t1, toothIdx.t2, toothIdx.lower].forEach(m => { if (m) m.material = rm; });
      const cav = lmat('cavity', () => new THREE.MeshStandardMaterial({ color: 0x3a2e10, roughness: .9 }));
      [toothIdx.t1, toothIdx.t2].forEach(m => { if (m && m.visible) blob(B.teeth, cav, .005, .008, .004, m.position.x + RC.rand(-.004, .004), -.02 + RC.rand(-.01, .01), .008); });
    }
    if (F.crooked) {
      if (toothIdx.t1) { toothIdx.t1.rotation.z += .18; toothIdx.t1.position.y += .01; }
      if (toothIdx.t2) { toothIdx.t2.rotation.z -= .14; toothIdx.t2.position.y -= .012; }
    }
    /* ---- nose / snout ---- */
    const noseTip = head.getObjectByName('noseTip');
    if (F.bentNose && noseTip) { noseTip.rotation.z = .5; noseTip.rotation.x = .18; }
    if (F.bulbNose && noseTip) {
      noseTip.scale.multiplyScalar(1.85);
      blob(head, M.nose(), .042, .042, .042, 0, .1, .115);
    }
    if (F.snoutSquash) { B.snout.scale.x *= 1.22; B.snout.scale.y *= .8; B.snout.rotation.z = .14; }
    /* ---- ears ---- */
    ['earL', 'earR'].forEach((k, i) => {
      const e = B[k];
      if (!e) return;
      if (F.unevenEars) e.scale.multiplyScalar(i === 0 ? .72 : 1.45);
      if (F.torn) {
        const outer = e.children[0], inner = e.children[1];
        if (outer) outer.scale.set(outer.scale.x * .82, outer.scale.y * .68, outer.scale.z);
        const tear = lmat('tear', () => new THREE.MeshStandardMaterial({ color: 0x5a2320, roughness: .7 }));
        blob(e, tear, .012, .022, .012, .05, .075, 0);
        blob(e, tear, .008, .016, .008, -.055, .05, .01);
      }
    });
  }

  function morphDetails(chr, spec, cfg) {
    const B = chr.bones, W = chr.spec.width, skin = chr.mats.skin;
    const has = d => cfg.details.indexOf(d) >= 0;
    const patchy = RC.CREATOR.furs.find(f => f.id === 'patchy');
    /* patchy mixed fur: alternate-color clumps over torso & skull */
    if (spec.fur === patchy.hex && patchy.patch) {
      patchy.patch.forEach(hex => {
        const mat = M.fur('#' + hex.toString(16).padStart(6, '0'));
        patchOn(B.torso, mat, 0, .2, .02, .24 * W, .3, .2 * W, 4, .05, .1);
        patchOn(B.head, mat, 0, .17, .02, .12, .11, .11, 2, .04, .07);
      });
    }
    /* almost hairless: big raw skin zones */
    if (RC.CREATOR.furs.find(f => f.id === 'hairless') && spec.furDefId === 'hairless') {
      patchOn(B.torso, skin, 0, .2, .02, .26 * W, .32, .22 * W, 9, .1, .17);
      patchOn(B.head, skin, 0, .17, .02, .125, .12, .12, 5, .06, .1);
    }
    /* bald patches on the pate */
    if (has('baldpatches')) patchOn(B.head, skin, 0, .27, -.02, .09, .05, .08, 4, .03, .06);
    /* missing fur patches on the pelt */
    if (has('missingfur')) patchOn(B.torso, skin, 0, .18, .02, .26 * W, .32, .22 * W, 8, .05, .11);
    /* pimples: shiny angry red, face + shoulders */
    if (has('pimples')) {
      const pm = lmat('pimple', () => new THREE.MeshStandardMaterial({ color: 0xc4553f, roughness: .2, metalness: .05 }));
      patchOn(B.head, pm, 0, .17, .06, .1, .08, .08, 6, .006, .011);
      patchOn(B.torso, pm, 0, .38, .05, .2 * W, .14, .12 * W, 4, .012, .02);
    }
    /* skin blemishes: jaundice + rot tones */
    if (has('blemishes')) {
      [0x6a6a20, 0x7a5a3a, 0x5a7a2a].forEach(hex => {
        const mat = lmat('blem' + hex, () => new THREE.MeshStandardMaterial({ color: hex, roughness: .85 }));
        patchOn(B.head, mat, 0, .17, .04, .12, .1, .1, 2, .012, .024);
        patchOn(B.torso, mat, 0, .2, .02, .24 * W, .3, .2 * W, 3, .03, .06);
      });
    }
    /* dirty whiskers: greasy extra-long sprouts */
    if (has('whiskers')) {
      const wm = M.chip(0x87744a);
      const wGeo = new THREE.CylinderGeometry(.0018, .0007, .17, 4);
      [-1, 1].forEach(side => {
        for (let i = 0; i < 4; i++) {
          const w = new THREE.Mesh(wGeo, wm);
          w.position.set(.022 * side, .075 + i * .014, .07 + .4 * spec.snoutLen);
          w.rotation.z = Math.PI / 2 + side * RC.rand(-.15, .15);
          w.rotation.x = .45 * side;
          w.rotation.y = side * RC.rand(.5, .95);
          B.head.add(w);
        }
      });
    }
    /* crooked jaw */
    if (spec.bodyFlags.crookedJaw) {
      B.teeth.rotation.z = .18;
      const lower = B.teeth.children.find(c => c.name === 'lower');
      if (lower) lower.position.x += .045;
      B.snout && (B.snout.rotation.z += .07);
      chr.bones.skull.rotation.z += .08;
    }
  }

  /* realistic 3D fur strands on skull, chest, belly */
  function morphStrands(chr, spec) {
    if (spec.furDefId === 'hairless') return;
    const key = 'strand' + spec.fur;
    const mat = lmat(key, () => new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.fur).multiplyScalar(.55), roughness: .9,
    }));
    const W = chr.spec.width;
    strandOn(chr.bones.head, mat, 0, .17, .02, .125, .12, .12, 22, .05, .11);
    strandOn(chr.bones.torso, mat, 0, .36, 0, .235 * W, .2, .17 * W, 18, .05, .12);
    strandOn(chr.bones.torso, mat, 0, .16, .03, .2 * W, .23, .19 * W, 14, .04, .1);
  }

  /* --------------------------------------------- final character build */
  RC.buildCharacter = function (cfg) {
    const spec = RC.resolveSpec(cfg);
    const chr = RC.buildRat(spec);
    morphFace(chr, spec);
    morphBody(chr, spec);
    morphGender(chr, cfg.gender || 'male');
    morphDetails(chr, spec, cfg);
    morphStrands(chr, spec);
    return chr;
  };

  /* ================================================== STUDIO SET ===== */
  const S = {
    scene: null, char: null, cfg: null, lights: null,
    orbit: { theta: .4, phi: .1, dist: 5, targetTheta: null, target: new THREE.Vector3(0, 1.02, 42) },
    idleT: 0, dragging: false, onConfirm: null, _setCam: null,
  };
  const STUDIO_POS = new THREE.Vector3(0, 0, 42);

  function buildStudio(scene) {
    const grp = new THREE.Group();
    grp.position.copy(STUDIO_POS);
    scene.add(grp);

    /* seamless cyc wall ring */
    const cyc = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 11, 36, 1, true),
      lmat('cyc', () => new THREE.MeshStandardMaterial({ color: 0x191512, roughness: .95, side: THREE.BackSide }))
    );
    cyc.position.y = 5.5;
    grp.add(cyc);

    /* floor + pedestal */
    const floor = new THREE.Mesh(new THREE.CircleGeometry(8.2, 40), lmat('stfloor', () => new THREE.MeshStandardMaterial({ color: 0x100e0c, roughness: .9 })));
    floor.rotation.x = -Math.PI / 2; floor.position.y = .01;
    floor.receiveShadow = true;
    grp.add(floor);

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, .06, 40), lmat('stDisc', () => new THREE.MeshStandardMaterial({ color: 0x1c1a16, roughness: .6, metalness: .3 })));
    disc.position.y = .03; disc.receiveShadow = true;
    grp.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, .02, 8, 48), M.emissive(0x9dff2a, 1.2));
    ring.rotation.x = Math.PI / 2; ring.position.y = .07;
    grp.add(ring);

    /* light rig silhouette */
    [-1, 1].forEach(sx => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 8.2, 8), M.rust(1));
      pole.position.set(3.4 * sx, 4.1, 1.5);
      pole.castShadow = true;
      grp.add(pole);
    });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(7.2, .16, .16), M.rust(2));
    bar.position.set(0, 8.1, 1.5);
    grp.add(bar);
    /* rigged lamp props */
    for (let i = -2; i <= 2; i++) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, .3, 10), M.black(.7, .3));
      lamp.position.set(i * 1.6, 7.85, 1.5);
      grp.add(lamp);
    }

    /* hazard poster on the back cyc */
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.25),
      new THREE.MeshBasicMaterial({ map: RC.textures.plate('THE CASTING LAB / SPECIMEN PROTOCOL 7'), transparent: true, side: THREE.DoubleSide })
    );
    poster.position.set(0, 3.4, -5.6);
    poster.rotation.y = Math.PI;   // canvas prints mirrored on front face; expose clean side
    grp.add(poster);

    /* ------- dramatic dirty fashion lighting ------- */
    const keyT = new THREE.Object3D(); keyT.position.set(0, 1.05, 0); grp.add(keyT);
    const key = new THREE.SpotLight(0xffe6c2, 1.55, 45, .52, .5, 1);
    key.position.set(2.4, 8.2, 5.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -.0005;
    key.target = keyT;
    grp.add(key);

    const rimA = new THREE.PointLight(0x9dff2a, .85, 14);   // acid green rim
    rimA.position.set(-4.6, 4.6, -5.2);
    grp.add(rimA);
    const rimB = new THREE.PointLight(0xd8e828, .6, 13);   // toxic yellow rim
    rimB.position.set(4.6, 3.4, -5.4);
    grp.add(rimB);
    const fill = new THREE.PointLight(0x6a3a42, .55, 26);    // pink filth fill
    fill.position.set(0, 2.2, 7.5);
    grp.add(fill);

    S.lights = { key, rimA, rimB, fill };
  }

  /* ================================================== RENDER LOGIC === */
  function rebuild() {
    if (S.char) RC.disposeTree(S.char.group);
    S.char = RC.buildCharacter(S.cfg);
    S.char.group.position.copy(STUDIO_POS);
    S.char.anim.mode = 'idle';
    S.char.anim.speed = 0;
    S.scene.add(S.char.group);
  }

  /* ================================================== UI ============= */
  function addHead(root, txt) {
    const d = document.createElement('div');
    d.className = 'secHead';
    d.textContent = txt;
    root.appendChild(d);
  }
  function addSub(root, txt) {
    const d = document.createElement('div');
    d.className = 'subHead';
    d.textContent = txt;
    root.appendChild(d);
  }

  function hexCss(hex) { return '#' + hex.toString(16).padStart(6, '0'); }

  function buildPanel() {
    const C = RC.CREATOR, root = $('creatorPanel');
    root.innerHTML = '';
    /* --- 01 gender --- */
    addHead(root, '01 / SPECIES & SEX');
    const gGrid = document.createElement('div');
    gGrid.className = 'optGrid';
    C.genders.forEach(g => {
      const b = document.createElement('button');
      b.className = 'optBtn' + (S.cfg.gender === g.id ? ' sel' : '');
      b.innerHTML = `${g.name}<small>${g.sub}</small>`;
      b.onclick = () => { pick('gender', g.id); };
      gGrid.appendChild(b);
    });
    root.appendChild(gGrid);

    /* --- 02 body --- */
    addHead(root, '02 / BODY TYPES');
    const bGrid = document.createElement('div');
    bGrid.className = 'optGrid';
    C.bodies.forEach(b2 => {
      const b = document.createElement('button');
      b.className = 'optBtn' + (S.cfg.body === b2.id ? ' sel' : '');
      b.innerHTML = `${b2.name}<small>${b2.sub}</small>`;
      b.onclick = () => { pick('body', b2.id); };
      bGrid.appendChild(b);
    });
    root.appendChild(bGrid);

    /* --- 03 fur --- */
    addHead(root, '03 / FUR COAT');
    const fGrid = document.createElement('div');
    fGrid.className = 'optGrid';
    C.furs.forEach(f => {
      const b = document.createElement('button');
      b.className = 'optBtn' + (S.cfg.fur === f.id ? ' sel' : '');
      const sw = document.createElement('span');
      sw.className = 'sw';
      sw.style.background = f.patch
        ? `linear-gradient(105deg, ${hexCss(f.hex)} 0 38%, ${hexCss(f.patch[0])} 38% 62%, ${hexCss(f.patch[1])} 62% 82%, ${hexCss(f.patch[2])} 82% 100%)`
        : hexCss(f.hex);
      b.appendChild(sw);
      const nm = document.createElement('span');
      nm.innerHTML = f.name;
      b.appendChild(nm);
      b.onclick = () => { pick('fur', f.id); };
      fGrid.appendChild(b);
    });
    root.appendChild(fGrid);

    /* --- 04 face --- */
    addHead(root, '04 / FACE WORK');
    const faceRows = [
      ['EYES', C.eyes, 'eyes'],
      ['TEETH', C.teeth, 'teeth'],
      ['EARS', C.ears, 'ears'],
      ['SNOUT & NOSE', C.snouts, 'snout'],
    ];
    faceRows.forEach(([label, arr, key]) => {
      addSub(root, label);
      const row = document.createElement('div');
      row.className = 'chipRow';
      arr.forEach(o => {
        const b = document.createElement('button');
        b.className = 'chip' + (S.cfg[key] === o.id ? ' sel' : '');
        b.textContent = o.name;
        b.onclick = () => { pick(key, o.id); };
        row.appendChild(b);
      });
      root.appendChild(row);
    });

    /* --- 05 gross details --- */
    addHead(root, '05 / OPTIONAL DISFIGUREMENTS');
    addSub(root, 'COMBINE FREELY — THE JURY ADMIRE SUFFERING');
    const dRow = document.createElement('div');
    dRow.className = 'chipRow';
    C.details.forEach(d => {
      const b = document.createElement('button');
      b.className = 'chip' + (S.cfg.details.indexOf(d.id) >= 0 ? ' sel' : '');
      b.textContent = d.name;
      b.onclick = () => {
        const i = S.cfg.details.indexOf(d.id);
        if (i >= 0) S.cfg.details.splice(i, 1); else S.cfg.details.push(d.id);
        refresh(true);
      };
      dRow.appendChild(b);
    });
    root.appendChild(dRow);
  }

  function pick(key, id) {
    if (S.cfg[key] === id) return;
    S.cfg[key] = id;
    refresh(true);
  }
  function rebuildPanelOnly() { buildPanel(); }

  function refresh(rebuildModel) {
    rebuildPanelOnly();
    if (rebuildModel) rebuild();
  }

  /* ================================================== ACTIONS ======== */
  function makeFreak() {
    S.cfg = RC.randomCreatorConfig();
    refresh(true);
  }

  function randomName() {
    $('ratName').value = RC.pick(RC.RAT_NAMES);
  }

  function open(opts) {
    S.cfg = RC.PLAYER_CONFIG || RC.randomCreatorConfig();
    if (opts && opts.freak) makeFreak();
    else refresh(false);
    if (!S.char) rebuild();
    if (!$('ratName').value) $('ratName').value = S.cfg.name || RC.pick(RC.PLAYER_NAMES);
    $('titleScreen').classList.add('hidden');
    $('finale').classList.add('hidden');
    $('roundBoard').classList.add('hidden');
    $('quoteCard').classList.add('hidden');
    $('banner').classList.add('hidden');
    $('dresser').classList.add('hidden');
    $('roundInfo').classList.add('hidden');
    $('scoreboard').classList.add('hidden');
    $('outfitTags').classList.add('hidden');
    $('skipTip').classList.add('hidden');
    document.getElementById('letterbox').classList.remove('on');
    $('creator').classList.remove('hidden');
    if (S._setCam) S._setCam('creator');
  }

  function close(toTitle) {
    $('creator').classList.add('hidden');
    if (toTitle) {
      $('titleScreen').classList.remove('hidden');
      if (S._setCam) S._setCam('title');
    }
  }

  function confirm() {
    const nm = $('ratName').value.trim().toUpperCase().slice(0, 26) || 'SUBJECT: UNNAMED';
    S.cfg.name = nm;
    RC.PLAYER_CONFIG = S.cfg;
    RC.ui.setName(nm);
    $('creator').classList.add('hidden');
    S.onConfirm && S.onConfirm();
  }

  /* ================================================== ORBIT INPUT ==== */
  function bindOrbit() {
    const el = $('creatorDrag');
    const pts = new Map();          // pointerId -> {x,y}

    function pinch(a, b0, b1) {
      /* a fixed, b moved from b0 to b1: rescale orbit dist by ratio */
      const d0 = Math.hypot(a.x - b0.x, a.y - b0.y);
      const d1 = Math.hypot(a.x - b1.x, a.y - b1.y);
      if (d0 > 4 && d1 > 4) S.orbit.dist = RC.clamp(S.orbit.dist * (d0 / d1), 1.7, 9.5);
    }

    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      S.dragging = true; S.idleT = 0;
      S.orbit.targetTheta = null;
    });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      const now = { x: e.clientX, y: e.clientY };
      if (pts.size === 1) {
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        S.orbit.theta -= dx * .006;
        S.orbit.phi = RC.clamp(S.orbit.phi + dy * .004, -.18, 1.05);
      }
      pts.set(e.pointerId, now);
      if (pts.size === 2) {
        const [idA, idB] = [...pts.keys()];
        const a = pts.get(idA), bNow = pts.get(idB);
        const bPrev = e.pointerId === idB ? prev : pts.get(idA);
        pinch(a, bPrev, bNow);
      }
      S.idleT = 0;
      e.preventDefault();
    });
    function release(e) {
      pts.delete(e.pointerId);
      if (!pts.size) S.dragging = false;
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('wheel', e => {
      S.orbit.dist = RC.clamp(S.orbit.dist + e.deltaY * .0024, 1.7, 9.5);
      S.idleT = 0;
      e.preventDefault();
    }, { passive: false });

    /* view buttons */
    document.querySelectorAll('#viewCtl .vbtn[data-th]').forEach(b => {
      b.onclick = () => {
        const target = parseFloat(b.dataset.th);
        /* wrap to nearest */
        let t = S.orbit.theta % (Math.PI * 2);
        if (t > Math.PI) t -= Math.PI * 2;
        if (t < -Math.PI) t += Math.PI * 2;
        S.orbit.theta = t;
        S.orbit.targetTheta = target;
        S.idleT = 0;
      };
    });
    /* zoom buttons */
    $('zoomIn').onclick = () => { S.orbit.dist = RC.clamp(S.orbit.dist * .78, 1.7, 9.5); S.idleT = 0; };
    $('zoomOut').onclick = () => { S.orbit.dist = RC.clamp(S.orbit.dist * 1.28, 1.7, 9.5); S.idleT = 0; };

    /* arrows rotate when creator visible */
    addEventListener('keydown', e => {
      if ($('creator').classList.contains('hidden')) return;
      if (e.key === 'ArrowLeft') { S.orbit.theta += .22; S.orbit.targetTheta = null; }
      if (e.key === 'ArrowRight') { S.orbit.theta -= .22; S.orbit.targetTheta = null; }
    });
  }

  /* ================================================== BOOT =========== */
  RC.Creator = {
    orbit: S.orbit,
    get char() { return S.char; },
    init(scene, onConfirm, setCam) {
      S.scene = scene;
      S.onConfirm = onConfirm;
      S._setCam = setCam;
      buildStudio(scene);
      $('btnCreatorBack').onclick = () => close(true);
      $('btnFreak').onclick = () => makeFreak();
      $('btnNameDice').onclick = () => randomName();
      $('btnConfirm').onclick = () => confirm();
      $('ratName').addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); });
      bindOrbit();
    },
    open,
    tick(dt, t) {
      const o = S.orbit, hidden = $('creator').classList.contains('hidden');
      if (!hidden) {
        S.idleT = S.dragging ? 0 : S.idleT + dt;
        if (o.targetTheta != null) {
          const d = o.targetTheta - o.theta;
          o.theta += d * Math.min(1, dt * 7);
          if (Math.abs(d) < .004) { o.theta = o.targetTheta; o.targetTheta = null; }
        } else if (S.idleT > 2.2) {
          o.theta += dt * .22;   // lazy showroom spin when untouched
        }
      }
      /* dirty flicker on the studio key light */
      if (S.lights) {
        const k = Math.sin(t * 7.3) * .08 + Math.sin(t * 3.1) * .05;
        S.lights.key.intensity = 1.55 + k + (Math.random() < .015 ? -.6 : 0);
        S.lights.rimA.intensity = .85 + Math.sin(t * 2.7) * .15;
      }
    },
  };
})();
