/* ================= rat.js — grotesque rat-human builder + animation ====
   Humanoid body, rat face: elongated snout, yellowed crooked teeth,
   whiskers, warts, scars, greasy fur patches, hunched posture,
   limp walk, tail chain, procedural walk/pose/idle animation.        */
(function () {
  const RC = window.RC, M = RC.materials, T = RC.textures;
  const THREE = window.THREE;

  function limb(l, r0, r1, mat) {
    const geo = new THREE.CapsuleGeometry(r0, l, 6, 10);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = -l / 2;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function blob(w, h, d, mat) {
    const geo = new THREE.SphereGeometry(1, 14, 12);
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(w, h, d);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function box(w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    return m;
  }

  /* =================== build one hideous contestant =================== */
  RC.buildRat = function (spec, opts = {}) {
    spec = Object.assign({}, spec);
    const S = spec;
    const g = new THREE.Group();
    const furMat = M.fur('#' + S.fur.toString(16).padStart(6, '0'));
    const skinMat = M.skin('#' + S.skin.toString(16).padStart(6, '0'));
    const bones = {}, refs = {};

    const GD = S.body || {};                     // body-type geometry knobs
    /* legacy speca fields are optional under the new body-type system */
    if (GD.belly != null) S.belly = GD.belly;
    if (S.belly == null) S.belly = 1;
    if (GD.hunch != null) S.hunch = GD.hunch;
    if (S.hunch == null) S.hunch = .1;
    if (GD.scale != null) S.scale = GD.scale;
    if (S.scale == null) S.scale = 1;
    if (GD.width != null) S.width = GD.width;
    if (S.width == null) S.width = 1;
    const legLen = GD.legLen || 1;
    const s = (S.scale || 1) * (opts.scale || 1); // whole-body scale (baked into group)
    g.scale.setScalar(s);
    const W = S.width;
    const shoulderW = (GD.shoulderW || 1) * (S.gender === 'f' ? .86 : 1);
    const hipW = (GD.hipW || 1) * (S.gender === 'f' ? 1.14 : 1);

    /* ---------- hips & torso ---------- */
    const hips = new THREE.Group();
    hips.position.y = .92 * legLen;
    g.add(hips); bones.hips = hips;

    const torso = new THREE.Group();
    hips.add(torso); bones.torso = torso;
    torso.rotation.x = S.hunch;
    torso.rotation.z = GD.torsoTilt || 0;

    const pelvis = blob(.19 * W * hipW, .15, .16 * W, furMat);
    pelvis.position.y = .02; torso.add(pelvis); refs.pelvis = pelvis;

    const belly = blob(.20 * W, .23, .19 * W, furMat);
    belly.position.set(0, .16, .03);
    belly.scale.multiplyScalar(S.belly);
    torso.add(belly); refs.belly = belly; bones.belly = belly;

    const chest = blob(.235 * W * shoulderW, .21, .17 * W, furMat);
    chest.position.set(0, .36, 0);
    chest.scale.multiplyScalar(1 + S.hunch * -.15);
    torso.add(chest); bones.chest = chest;

    /* female anatomy: narrower torso read + chest forms */
    if (S.gender === 'f') {
      torso.scale.x *= .9;
      [-.065, .065].forEach(x => {
        const b = blob(.075 * W, .052, .05, furMat);
        b.position.set(x, .40, .062);
        torso.add(b);
      });
    }

    /* hunchback bump */
    if (S.hunch > .22) {
      const hump = blob(.12, .12, .1, furMat);
      hump.position.set(0, .42, -.13 * (0.5 + S.hunch));
      torso.add(hump);
    }

    /* ---------- neck & head group ---------- */
    const headG = new THREE.Group();
    headG.position.set(0, .52, .02);
    torso.add(headG); bones.head = headG;
    headG.rotation.x = -.38 * S.hunch - .06;

    const neck = limb(.1, .05 * W, .05 * W, skinMat);
    neck.position.y = .04; headG.add(neck);

    /* skull */
    const skull = blob(.13, .125, .13, furMat);
    skull.position.set(0, .17, .02);
    headG.add(skull); bones.skull = skull;

    /* forehead skin facing, male-pattern loss */
    const hairG = new THREE.Group();
    skull.add(hairG); refs.hair = hairG;
    buildHair(hairG, S, furMat, skull);

    /* ears */
    const earMat = furMat, inMat = M.innerEar();
    [-1, 1].forEach(side => {
      const e = new THREE.Group();
      e.position.set(.105 * side, .23, -.015);
      e.rotation.z = side * -.35; e.rotation.y = side * .12;
      headG.add(e);
      /* uneven ears: one sad stump, one dish antenna */
      const es = S.unevenEars ? (side < 0 ? .62 : 1.42) : 1;
      const outer = blob(.075 * S.earSize * es, .095 * S.earSize * es, .022, earMat);
      e.add(outer);
      const inner = blob(.05 * S.earSize * es, .07 * S.earSize * es, .012, inMat);
      inner.position.z = .016; e.add(inner);
      if (S.tornEars) {
        /* a bite already taken: ragged notch of open skin at the rim */
        const notch = blob(.028 * es, .014 * es, .012, skinMat);
        notch.position.set(side * .02 * es, .062 * S.earSize * es, .014);
        notch.rotation.z = side * RC.rand(.5, .8);
        e.add(notch);
        const nick = blob(.014 * es, .01 * es, .01, skinMat);
        nick.position.set(-side * .024 * es, .035 * S.earSize * es, .012);
        e.add(nick);
        e.rotation.x += side * .18;
      }
      bones['ear' + (side < 0 ? 'L' : 'R')] = e;
    });

    /* snout */
    const snout = blob(.075, .068, .55 * S.snoutLen * 5, skinMat); // long scaled cap
    snout.position.set(0, .11, .075 + .28 * S.snoutLen);
    snout.rotation.z = S.snoutTwist || 0;
    headG.add(snout); bones.snout = snout;

    const bridge = blob(.085, .09, .5 * S.snoutLen * 5, furMat);
    bridge.position.set(0, .145, .05 + .22 * S.snoutLen);
    bridge.rotation.z = S.snoutTwist || 0;
    headG.add(bridge);

    /*! nostril blob */
    const noseTip = blob(.033, .028, .03, M.nose());
    noseTip.position.set(0, .125, .075 + .52 * S.snoutLen);
    headG.add(noseTip);
    if (S.noseStyle === 'bulbous') {
      noseTip.scale.set(1.9, 1.55, 1.7);
      noseTip.position.y -= .012;
    } else if (S.noseStyle === 'bent') {
      noseTip.position.x += .02;
      noseTip.rotation.z = .75;
      noseTip.scale.set(1.2, 1.05, 1.1);
    }

    /* crooked yellow teeth — styleable: normal / crooked / missing / rotten */
    const teethGroup = new THREE.Group();
    teethGroup.position.set(S.crookedJaw ? .014 : 0, .072, .075 + .42 * S.snoutLen);
    teethGroup.rotation.z = S.crookedJaw ? .32 : 0;
    headG.add(teethGroup); bones.teeth = teethGroup;
    const teethStyle = S.teethStyle || 'normal';
    const tMul = (S.teethSize || 1) * (teethStyle === 'crooked' ? 1.55 : 1);
    const tm = teethStyle === 'rotten' ? M.teethRotten() : M.teeth();
    if (teethStyle === 'missing') {
      /* a dark wet gap where dignity used to be */
      const gap = blob(.034, .035, .014, M.gum());
      gap.position.set(0, .004, -.004); teethGroup.add(gap);
      const stub = box(.017, .026, .016, tm);            // one survivor
      stub.rotation.z = RC.rand(-.4, .4);
      stub.position.set(RC.pick([-.02, .02]), .012, 0);
      teethGroup.add(stub);
    } else {
      const t1 = box(.022, .05 * tMul, .02, tm);
      t1.rotation.z = (teethStyle === 'crooked' ? RC.rand(.3, .55) : RC.rand(-.25, .25));
      t1.rotation.x = RC.rand(-.2, .1);
      t1.position.x = -.014;
      const t2 = box(.022, .045 * tMul, .02, tm);
      t2.rotation.z = (teethStyle === 'crooked' ? RC.rand(-.55, -.3) : RC.rand(-.25, .25));
      t2.rotation.x = RC.rand(-.2, .1);
      t2.position.x = .014;
      teethGroup.add(t1, t2);
      if (teethStyle === 'crooked') {                    // a third bucktooth, why not
        const t4 = box(.016, .03 * tMul, .016, tm);
        t4.rotation.z = RC.rand(-.7, .7);
        t4.position.set(.03, .01, .002);
        teethGroup.add(t4);
      }
    }
    /* lower teeth peeking */
    const t3 = box(.05, .018 * tMul, .018, tm);
    t3.position.y = -.028; teethGroup.add(t3);
    if (S.crookedJaw) {
      /* the jaw itself lost an argument */
      const jaw = blob(.05, .028, .04, skinMat);
      jaw.position.set(.02, .03, .075 + .36 * S.snoutLen);
      jaw.rotation.z = .3;
      headG.add(jaw);
    }

    /* whiskers — "dirty whiskers" option: greasy, overlong, drooping */
    const dirty = !!S.dirtyWhiskers;
    const wGeo = new THREE.CylinderGeometry(.0022, .0009, dirty ? .19 : .13, 4);
    const wMat = dirty ? M.chip(0x4a3a22) : M.black(.4, .6);
    [-1, 1].forEach(side => {
      for (let i = 0; i < (dirty ? 6 : 3); i++) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(.02 * side, .082 + i * .012, .07 + .4 * S.snoutLen);
        w.rotation.z = Math.PI / 2 + side * RC.rand(-.15, .15) + (dirty ? side * .3 : 0);
        w.rotation.y = side * RC.rand(.5, .95);
        w.rotation.x = dirty ? RC.rand(-.1, .25) : 0;
        headG.add(w);
      }
    });

    /* eyes: white + sunken + droop lid */
    const eyeS = S.eyeSize || 1;
    const eyeMat = S.bloodshot ? M.eyeBlood() : M.eye();
    const irisMat = M.chip(S.iris), lidMat = furMat;
    [-1, 1].forEach(side => {
      const e = new THREE.Group();
      e.position.set(.055 * side, .19, .085 + (S.eyeBulge ? .025 : 0));
      e.scale.set(eyeS, eyeS, eyeS * (S.eyeBulge ? 1.4 : 1));
      headG.add(e); bones['eye' + (side < 0 ? 'L' : 'R')] = e;
      const white = blob(.026, .026, .026, eyeMat);
      white.rotation.x = .35;
      e.add(white);
      const irX = S.crossEye ? -side * .012 : 0;       // both drift toward the nose
      const iris = blob(.011, .011, .006, irisMat);
      iris.position.z = .023; iris.rotation.x = .35;
      iris.position.x = irX;
      e.add(iris);
      const pupil = blob(.0052, .0052, .004, M.black(.2, .8));
      pupil.position.set(irX * 1.5, 0, .027); e.add(pupil);
      const lid = blob(.03, .014 + .01 * S.droop, .026, lidMat);
      lid.position.set(0, .02 + .012 * S.droop, .004);
      if (S.eyeBulge) lid.scale.y *= .55;              // lids can't close over the bulge
      e.add(lid);
      /* squint bags */
      const bag = blob(.024, .009, .02, skinMat);
      bag.position.set(0, -.02, .008); e.add(bag);
    });

    /* brow: male kit gets a heavy unibrow, female a fine one */
    const brow = box(.1, .012, .012, furMat);
    brow.position.set(0, .225, .095);
    brow.rotation.z = RC.rand(-.06, .06);
    if (S.gender === 'f') brow.scale.x = .8;
    headG.add(brow);
    if (S.gender === 'f') {
      /* short lashes so the gender reads at any zoom */
      [-1, 1].forEach(sd => {
        for (let i = 0; i < 3; i++) {
          const lash = box(.004, .014, .004, M.black(.35, .3));
          lash.position.set((.02 + i * .018) * sd, .212 + Math.sin(i) * .002, .103);
          lash.rotation.z = sd * -.5;
          headG.add(lash);
        }
      });
    }

    /* warts */
    const wartMat = M.chip(0x8a6a52);
    for (let i = 0; i < (S.warts || 0); i++) {
      const a = RC.rand(0, Math.PI * 2), r = RC.rand(.5, .95);
      const w = blob(.008, .008, .008, wartMat);
      w.position.set(Math.cos(a) * .12 * r * side(r), .11 + Math.sin(a) * .06 * r, .11 + Math.abs(Math.cos(a)) * .05);
      headG.add(w);
    }
    /* scars */
    const scarMat = M.chip(0x9a5f55);
    for (let i = 0; i < (S.scars || 0); i++) {
      const sc = box(.0035, RC.rand(.05, .1), .002, scarMat);
      sc.position.set(RC.rand(-.09, .09), .13, .105);
      sc.rotation.z = RC.rand(0, Math.PI);
      sc.position.z += Math.abs(sc.position.x) * .1;
      headG.add(sc);
    }
    /* pimples: angry little volcanoes with a white head of pus */
    for (let i = 0; i < (S.pimples || 0); i++) {
      const onHead = Math.random() < .75;
      const host = onHead ? headG : torso;
      const p = blob(.006, .006, .006, M.chip(0xd8836e));
      if (onHead) {
        p.position.set(RC.rand(-.11, .11), RC.rand(.09, .27), .1 + RC.rand(0, .015));
      } else {
        p.position.set(RC.rand(-.2, .2) * W, .2 + RC.rand(-.15, .2), .18);
      }
      host.add(p);
      const tip = blob(.0028, .0028, .0028, M.chip(0xe8e0d4));
      tip.position.z += .005;
      p.add(tip);
    }
    /* skin blemishes: bruised blotches on head, belly and hands */
    const blemMat = M.chip(0x6a4238);
    for (let i = 0; i < (S.blemishes || 0); i++) {
      const a = RC.rand(0, Math.PI * 2), r = RC.rand(.4, .9);
      const b = blob(.012, .012, .008, blemMat);
      b.position.set(Math.cos(a) * .12 * r, .13 + Math.sin(a) * .07 * r, .1 + Math.abs(Math.cos(a)) * .04);
      headG.add(b);
    }
    for (let i = 0; i < Math.ceil((S.blemishes || 0) / 3); i++) {
      const b = blob(.03, .02, .012, blemMat);
      b.position.set(RC.rand(-.14, .14) * W, .2 + RC.rand(-.1, .15), .19);
      torso.add(b);
    }
    /* bald patches: raw open skin where the coat gave up */
    for (let i = 0; i < (S.baldPatches || 0); i++) {
      const host = RC.pick([skull, chest, belly]);
      const p = blob(RC.rand(.022, .05), RC.rand(.02, .045), RC.rand(.022, .05), skinMat);
      const a = RC.rand(0, Math.PI * 2), e = Math.acos(RC.rand(-1, 1)) * .8 + .9;
      p.position.set(
        Math.sin(e) * Math.cos(a) * host.scale.x * .99,
        Math.cos(e) * host.scale.y * .99,
        Math.sin(e) * Math.sin(a) * host.scale.z * .99
      );
      host.add(p);
    }
    /* patchy mixed fur: clashing clumps of whatever fur was lying around */
    if (S.furPatchy) {
      const altColors = S.furAltColors || [0x26211d, 0xcfc4b0, 0x6a5a40, 0x7a4a32];
      for (let i = 0; i < 9; i++) {
        const host = RC.pick([skull, chest, belly]);
        const altColor = RC.pick(altColors);
        const altMat = M.fur('#' + altColor.toString(16).padStart(6, '0'));
        const p = blob(RC.rand(.03, .06), RC.rand(.025, .05), RC.rand(.03, .06), altMat);
        const a = RC.rand(0, Math.PI * 2), e = Math.acos(RC.rand(-1, 1)) * .8 + .9;
        p.position.set(
          Math.sin(e) * Math.cos(a) * host.scale.x * .97,
          Math.cos(e) * host.scale.y * .97,
          Math.sin(e) * Math.sin(a) * host.scale.z * .97
        );
        host.add(p);
      }
    }
    /* missing fur patches — same raw-skin look but bigger and on the body */
    for (let i = 0; i < (S.furPatches || 0); i++) {
      const host = RC.pick([chest, belly, pelvis]);
      const p = blob(RC.rand(.04, .085), RC.rand(.035, .07), RC.rand(.04, .085), skinMat);
      const a = RC.rand(0, Math.PI * 2), e = Math.acos(RC.rand(-1, 1)) * .8 + .9;
      p.position.set(
        Math.sin(e) * Math.cos(a) * host.scale.x * .99,
        Math.cos(e) * host.scale.y * .99,
        Math.sin(e) * Math.sin(a) * host.scale.z * .99
      );
      host.add(p);
    }

    /* ---------- arms ---------- */
    const armRadMult = (side) => {                     // per-side muscle mass
      if (GD.asym) return side > 0 ? .68 : 1.32;       // mutant: one withered, one swollen
      return 1;
    };
    const armLenMult = (side) => {
      if (GD.asym) return side > 0 ? RC.rand(.78, .88) : 1;
      return GD.armLen || 1;
    };
    const armThick = GD.armThick || 1;
    const shLift = (side) => GD.asym ? (side > 0 ? .055 : -.03) : 0;
    const makeArm = (sideX) => {
      const sh = new THREE.Group();
      sh.position.set(.25 * W * shoulderW * sideX, .45 + shLift(sideX), 0);
      torso.add(sh);
      const studded = blob(.055 * W * (armRadMult(sideX) > 1 ? 1.15 : 1), .07, .06, furMat);
      sh.add(studded);
      const up = new THREE.Group(); sh.add(up);
      const rm = armRadMult(sideX);
      up.add(limb(.30, .045 * W * armThick * rm, .04 * W * armThick * rm, furMat));
      const el = new THREE.Group();
      el.position.y = -.30; up.add(el);
      el.add(limb(.27, .038 * W * armThick * rm, .034 * W * armThick * rm, furMat));
      const hand = new THREE.Group();
      hand.position.y = -.27; el.add(hand);
      const palm = blob(.045, .05, .028, skinMat);
      palm.position.y = -.02; hand.add(palm);
      for (let f = 0; f < 3; f++) {
        const fg = new THREE.Mesh(new THREE.CapsuleGeometry(.008, .045, 4, 6), skinMat);
        fg.position.set((f - 1) * .02, -.06, -.004);
        fg.rotation.x = RC.rand(-.2, .2); fg.rotation.z = (f - 1) * .3;
        fg.castShadow = true;
        hand.add(fg);
      }
      up.scale.y = armLenMult(sideX);                  // stretch forearm chain too
      return [sh, up, el, hand];
    };
    [refs.shL, refs.upL, refs.elL, refs.handL] = makeArm(-1);
    [refs.shR, refs.upR, refs.elR, refs.handR] = makeArm(1);
    bones.handR = refs.handR; bones.handL = refs.handL;

    /* ---------- legs ---------- */
    const legRadMult = side => GD.asym ? (side < 0 ? .75 : 1.2) : 1;
    const makeLeg = sideX => {
      const th = new THREE.Group();
      th.position.set(.115 * W * sideX, .02, 0);
      hips.add(th);
      const rm = legRadMult(sideX);
      th.add(limb(.42, .062 * W * rm, .048 * W * rm, furMat));
      const sh = new THREE.Group();
      sh.position.y = -.42; th.add(sh);
      sh.add(limb(.4, .048 * W * rm, .038 * W * rm, furMat));
      const ft = new THREE.Group();
      ft.position.y = -.4; sh.add(ft);
      const foot = blob(.05 * W, .04, .1, skinMat);
      foot.position.set(0, -.015, .035); ft.add(foot);
      /* ratty toes */
      for (let i = 0; i < 3; i++) {
        const toe = new THREE.Mesh(new THREE.CapsuleGeometry(.009, .03, 3, 6), skinMat);
        toe.rotation.x = Math.PI / 2;
        toe.position.set((i - 1) * .02, -.028, .11);
        ft.add(toe);
      }
      th.scale.y = legLen * (GD.asym ? (sideX < 0 ? RC.rand(.8, .9) : 1) : 1);
      return [th, sh, ft];
    };
    [refs.thL, refs.shinL, refs.ftL] = makeLeg(-1);
    [refs.thR, refs.shinR, refs.ftR] = makeLeg(1);

    /* ---------- tail: chained segments ---------- */
    const tailSegs = [];
    let parent = hips, tp = new THREE.Group();
    tp.position.set(0, .02, -.14);
    hips.add(tp);
    let cur = tp;
    for (let i = 0; i < 9; i++) {
      const seg = new THREE.Group();
      seg.position.y = -i === 0 ? 0 : -.055;
      if (i !== 0) cur.add(seg);
      const tmo = new THREE.Mesh(new THREE.CapsuleGeometry(.02 * (1 - .6 * i / 9), .05, 4, 6), skinMat);
      tmo.position.y = -.028;
      tmo.rotation.x = Math.PI / 2;
      tmo.castShadow = true;
      seg.add(tmo);
      cur = seg;
      tailSegs.push(seg);
    }
    bones.tail = tailSegs;

    /* ---------- assemble character object ---------- */
    const chr = {
      spec: S, group: g, bones, refs, mats: { fur: furMat, skin: skinMat },
      anchors: {
        head: headG, skull, chest, torso, hips,
        neck: headG, handR: refs.handR, handL: refs.handL,
        shoulderR: refs.shR, shoulderL: refs.shL,
        ftR: refs.ftR, ftL: refs.ftL,
        thighR: refs.thR, thighL: refs.thL,
        upL: refs.upL, upR: refs.upR, elL: refs.elL, elR: refs.elR,
      },
      garments: {},   // slot -> group
      anim: { phase: 0, speed: 0, mode: 'idle', poseAmt: 0, poseType: S.pose, breathe: Math.random() * 7 },
      scaleAll: s,
      hipY: .92 * legLen,
    };
    chr.setGarment = RCC_setGarment(chr);
    addFurStrands(chr);
    applyLimp(chr);
    return chr;
  };

  /* =================== individual fur strands ==========================
     InstancedMesh of tiny cones glued to the coat ellipsoids, each with a
     jittered color: real strands over the procedurally dirty fur texture. */
  function addFurStrands(chr) {
    const S = chr.spec;
    const mul = S.strandMul == null ? 1 : S.strandMul;
    if (mul < .03) return;
    const base = new THREE.Color(S.fur);
    const dirt = new THREE.Color(0x2a2318);
    const mat = M.strand();
    const geo = new THREE.ConeGeometry(.0032, .075, 4);
    geo.translate(0, .038, 0);
    const dummy = new THREE.Object3D();
    const UP = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const zones = [
      { host: chr.bones.chest, n: Math.round(150 * mul), len: 1.0 },
      { host: chr.bones.belly, n: Math.round(160 * mul), len: 1.15 },
      { host: chr.anchors.skull, n: Math.round(70 * mul), len: .8 },
      { host: chr.refs.pelvis, n: Math.round(60 * mul), len: .9 },
    ];
    zones.forEach(z => {
      if (!z.host || z.n < 4) return;
      const scp = z.host.scale;                        // blob radii in local space
      const im = new THREE.InstancedMesh(geo, mat, z.n);
      for (let i = 0; i < z.n; i++) {
        dir.set(RC.rand(-1, 1), RC.rand(-1, 1), RC.rand(-1, 1));
        if (dir.lengthSq() < .01) dir.set(0, 1, 0);
        dir.normalize();
        const wob = RC.rand(.08, .3);
        dir.x *= 1 + wob; dir.y += RC.rand(-.15, .1); dir.z *= 1 + wob;
        dir.normalize();
        dummy.position.set(dir.x * scp.x * .97, dir.y * scp.y * .97, dir.z * scp.z * .97);
        dummy.quaternion.setFromUnitVectors(UP, dir);
        dummy.scale.set(1, RC.rand(.55, 1.25) * z.len, 1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        const c = base.clone().offsetHSL(RC.rand(-.02, .02), RC.rand(-.06, .1), RC.rand(-.1, .12));
        if (Math.random() < .12) c.lerp(dirt, RC.rand(.2, .5));  // grease-stained strands
        im.setColorAt(i, c);
      }
      im.instanceMatrix.needsUpdate = true;
      im.instanceColor.needsUpdate = true;
      im.castShadow = false;
      im.receiveShadow = false;
      z.host.add(im);
    });
  }

  function side(x) { return x < 0 ? -1 : 1; }

  function RCC_setGarment(chr) {
    return function (slot, group) {
      const old = chr.garments[slot];
      if (old) { RC.disposeTree(old); }
      chr.garments[slot] = group || null;
      return !!old;
    };
  }

  function applyLimp(chr) {
    if (!chr.spec.limp) { chr.limpPhase = 0; return; }
    chr.limpPhase = Math.random() * Math.PI * 2;
  }

  /* ================= hairstyle variants ================= */
  function buildHair(hairG, S, furMat, skull) {
    const hc = M.fabric('#' + S.hairColor.toString(16).padStart(6, '0'), { smooth: true });
    switch (S.hairStyle) {
      case 'mohawk': {
        for (let i = 0; i < 7; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(.012, RC.rand(.09, .17), 5), hc);
          spike.position.set(0, .27, -.045 + i * .016);
          spike.rotation.x = RC.rand(-.2, .2);
          spike.castShadow = true;
          hairG.add(spike);
        }
        break;
      }
      case 'messy': {
        for (let i = 0; i < 14; i++) {
          const b = blob(RC.rand(.02, .05), RC.rand(.02, .06), RC.rand(.02, .05), hc);
          const a = RC.rand(0, Math.PI * 2);
          b.position.set(Math.cos(a) * .1, .17 + Math.sin(a) * .1 * .7 + .09, -.02 + RC.rand(-.06, .08));
          hairG.add(b);
        }
        break;
      }
      case 'pigtails': {
        [-1, 1].forEach(sd => {
          const tail = blob(.03, .03, .03, hc);
          tail.position.set(.11 * sd, .21, -.04);
          hairG.add(tail);
          const tail2 = blob(.022, .022, .022, hc);
          tail2.position.set(.12 * sd, .16, -.05);
          hairG.add(tail2);
          const tuft = blob(.045, .04, .04, hc);
          tuft.position.set(.05 * sd, .26, -.03);
          hairG.add(tuft);
        });
        break;
      }
      case 'scrags': {
        for (let i = 0; i < 5; i++) {
          const t = new THREE.Mesh(new THREE.ConeGeometry(.008, RC.rand(.05, .11), 4), hc);
          t.position.set(RC.rand(-.08, .08), .27, RC.rand(-.04, .03));
          t.rotation.z = RC.rand(-.5, .5);
          hairG.add(t);
        }
        break;
      }
      default: { /* bald: liver spots */
        const skin = M.chip(S.skin);
        for (let i = 0; i < 5; i++) {
          const sp = blob(.02, .01, .02, M.chip(0x6a4a3a));
          sp.position.set(RC.rand(-.06, .06), .29, RC.rand(-.03, .03));
          hairG.add(sp);
        }
        break;
      }
    }
    /* bald patch sheen (greasy reflection) */
    if (S.baldPatch > .5 && S.hairStyle !== 'bald') {
      const patch = blob(.04 * S.baldPatch, .02 * S.baldPatch, .04 * S.baldPatch, M.skin('#' + S.skin.toString(16).padStart(6, '0')));
      patch.position.set(.045, .28, .01);
      hairG.add(patch);
    }
  }

  /* =================== animation =================== */
  /* modes: idle | walk | pose. dt-driven, state lives in chr.anim */
  RC.animateRat = function (chr, dt) {
    const A = chr.anim, B = chr.bones, R = chr.refs;
    const spd = A.speed;
    A.breathe += dt * 2.1;

    if (A.mode === 'walk') {
      A.phase += dt * (3.0 + spd * 5.2) + (chr.limpPhase ? chr.limpDt || 0 : 0);
      const p = A.phase;
      const limpK = chr.spec.limp ? .5 : 1;
      const w = 1;
      R.thL.rotation.x = Math.sin(p) * .62 * w * limpK;
      R.thR.rotation.x = Math.sin(p + Math.PI + (chr.spec.limp ? .5 : 0)) * .62 * w * (chr.spec.limp ? .75 : 1);
      R.shinL.rotation.x = Math.max(0, -Math.sin(p - .7)) * -1.05 * w;
      R.shinR.rotation.x = Math.max(0, -Math.sin(p + Math.PI - .7)) * -1.05 * w;
      R.upL.rotation.x = Math.sin(p + Math.PI) * .48 * w;
      R.upR.rotation.x = Math.sin(p) * .48 * w;
      R.elL.rotation.x = -.35 + Math.sin(p + Math.PI * 1.2) * .3;
      R.elR.rotation.x = -.35 + Math.sin(p + .2) * .3;
      chr.bones.hips.position.y = chr.hipY + Math.abs(Math.sin(p)) * .035 + Math.sin(p * 2) * .012;
      chr.bones.torso.rotation.z = Math.sin(p) * .06;
      chr.bones.skull.rotation.y = Math.sin(p * .5) * .12;
      /* shuffling head-bob & tail whip */
      B.tail.forEach((seg, i) => {
        seg.rotation.y = Math.sin(p * 1.6 - i * .55) * .16;
        seg.rotation.x = Math.sin(p - i * .5) * .08;
      });
      B.earL.rotation.x = Math.sin(p * 2 + 1) * .1;
      B.earR.rotation.x = Math.sin(p * 2 + 2.1) * .1;
    } else if (A.mode === 'pose') {
      A.poseT = (A.poseT || 0) + dt;
      const t = A.poseT, puff = Math.sin(t * 2.3);
      chr.bones.hips.position.y = chr.hipY + Math.sin(t * 1.8) * .01;
      const tp = A.poseType;
      if (tp === 0) {            // flex & menace
        R.upR.rotation.x = -lerpTo(-2.5, .1, t) + puff * .03;
        R.elR.rotation.x = -1.6 + Math.sin(t * 3) * .05;
        R.upL.rotation.x = .5; R.elL.rotation.x = -.2;
        chr.bones.torso.rotation.z = -.1;
        chr.bones.skull.rotation.y = .25 + puff * .04;
        chr.bones.hips.rotation.y = -.3;
      } else if (tp === 1) {     // arms wide, chin up, sucker teeth
        R.upL.rotation.z = 1.25 + puff * .03;
        R.upR.rotation.z = -1.25 - puff * .03;
        R.elL.rotation.x = -.15; R.elR.rotation.x = -.15;
        chr.bones.head.rotation.x = -.35 + Math.sin(t * 1.3) * .05;
        chr.bones.teeth.scale.y = 1 + Math.max(0, Math.sin(t * 2.6)) * .35;
        chr.bones.hips.rotation.y = .15;
      } else {                   // haughty scratch & sniff
        R.upR.rotation.x = -1.1;
        R.elR.rotation.x = -2.0 + Math.sin(t * 6) * .1;
        R.upL.rotation.x = .7;
        R.elL.rotation.x = -1.3;
        chr.bones.head.rotation.x = .25;
        chr.bones.skull.rotation.y = -.22 + Math.sin(t * 1.7) * .07;
        chr.bones.hips.rotation.y = .35;
      }
      B.tail.forEach((seg, i) => {
        seg.rotation.y = Math.sin(t * 1.5 + i * .6) * .14;
        seg.rotation.x = .1;
      });
    } else {
      /* idle: greasy sway + breathing + ear flick */
      B.belly.scale.x = 1.0 + Math.sin(A.breathe) * .02;
      chr.bones.hips.position.y = chr.hipY + Math.sin(A.breathe) * .006;
      chr.bones.torso.rotation.z = Math.sin(A.breathe * .4) * .03;
      chr.bones.skull.rotation.y = Math.sin(A.breathe * .31) * .2;
      R.upL.rotation.x = Math.sin(A.breathe * .5) * .06;
      R.upR.rotation.x = Math.sin(A.breathe * .5 + 1) * .06;
      R.thL.rotation.z = -0.04; R.thR.rotation.z = 0.04;
      R.shinL.rotation.x = 0; R.shinR.rotation.x = 0;
      B.tail.forEach((seg, i) => {
        seg.rotation.y = Math.sin(A.breathe * .8 - i * .5) * .12;
        seg.rotation.x = 0;
      });
      if (Math.random() < dt * .6) B.earL.rotation.z = RC.rand(-.3, .3);
      R.elL.rotation.x = -.15; R.elR.rotation.x = -.15;
    }
  };

  function lerpTo(target, amt, t) { return target + amt * Math.sin(t); }

  RC.resetRatPose = function (chr) {
    const R = chr.refs, B = chr.bones;
    ['upL', 'upR'].forEach(k => { R[k].rotation.set(0, 0, 0); });
    ['elL', 'elR', 'thL', 'thR', 'shinL', 'shinR'].forEach(k => R[k].rotation.set(0, 0, 0));
    B.hips.rotation.set(0, 0, 0);
    B.torso.rotation.z = 0; B.torso.rotation.x = chr.spec.hunch;
    B.head.rotation.set(0, 0, 0); B.skull.rotation.set(0, 0, 0);
    B.teeth.scale.y = 1;
    chr.anim.poseT = 0;
  };

  /* cheap A Simple helpers used by jury seating & crowd */
  RC.buildRat.seated = chr => {
    chr.refs.thL.rotation.x = -1.5; chr.refs.thR.rotation.x = -1.5;
    chr.refs.shinL.rotation.x = 1.5; chr.refs.shinR.rotation.x = 1.5;
    chr.anim.mode = 'idle';
  };
})();
