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
    /* defaults so every field is safe when absent */
    if (S.eyeScale == null) S.eyeScale = 1;
    if (S.legScale == null) S.legScale = 1;
    if (S.torsoY == null) S.torsoY = 1;
    if (S.limbRA == null) S.limbRA = 1;
    if (S.limbRL == null) S.limbRL = 1;
    if (S.shoulderW == null) S.shoulderW = .25;
    if (S.hipsW == null) S.hipsW = 1;
    if (S.chestB == null) S.chestB = 1;
    const g = new THREE.Group();
    const furHex = '#' + S.fur.toString(16).padStart(6, '0');
    const skinHex = '#' + S.skin.toString(16).padStart(6, '0');
    const furMat = S.furSpecial === 'patchy' ? M.furPatchy(furHex, skinHex)
      : S.furSpecial === 'hairless' ? M.furHairless()
      : M.fur(furHex);
    const skinMat = M.skin(skinHex);
    const bones = {}, refs = {};

    const s = S.scale * (opts.scale || 1);
    const W = S.width;
    const legS = S.legScale, torY = S.torsoY;

    /* ---------- hips & torso ---------- */
    const hips = new THREE.Group();
    hips.position.y = .82 * legS + .1 * s;   /* leg length + body lift */
    g.add(hips); bones.hips = hips;
    if (S.hipsTilt) hips.rotation.z = S.hipsTilt;

    const torso = new THREE.Group();
    hips.add(torso); bones.torso = torso;
    torso.rotation.x = S.hunch;
    if (S.torsoTwist) { torso.rotation.z = S.torsoTwist; torso.rotation.y = S.torsoYaw || 0; }
    torso.scale.y = torY;   /* long / squat trunk stretch */

    const pelvis = blob(.19 * W * S.hipsW, .15, .16 * W * S.hipsW, furMat);
    pelvis.position.y = .02; torso.add(pelvis);

    const belly = blob(.20 * W, .23, .19 * W, furMat);
    belly.position.set(0, .16, .03);
    belly.scale.multiplyScalar(S.belly);
    torso.add(belly); refs.belly = belly; bones.belly = belly;

    const chest = blob(.235 * W, .21, .17 * W, furMat);
    chest.position.set(0, .36, 0);
    chest.scale.multiplyScalar(1 + S.hunch * -.15);
    chest.scale.multiplyScalar(S.chestB);
    torso.add(chest); bones.chest = chest;

    /* bosom (female frame) */
    if (S.gender === 'female') {
      [-1, 1].forEach(sd => {
        const boob = blob(.085, .075, .09, furMat);
        boob.position.set(.085 * sd, .36, .14);
        boob.scale.multiplyScalar(S.chestB);
        torso.add(boob);
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
      const unevenK = S.unevenEars ? (side < 0 ? .68 : 1.25) : 1;
      e.rotation.z = side * -.35 * (S.unevenEars ? (side < 0 ? 1.9 : .5) : 1);
      e.rotation.y = side * .12;
      if (S.earBent && side !== (S.unevenEars ? 0 : 1)) { e.rotation.z += side * .5; e.rotation.x = .35; } /* flopped over */
      e.position.y = .23 + (S.unevenEars && side < 0 ? -.05 : 0);
      headG.add(e);
      const os = S.earSize * unevenK;
      const outer = blob(.075 * os, .095 * os, .022, earMat);
      e.add(outer);
      const inner = blob(.05 * os, .07 * os, .012, inMat);
      inner.position.z = .016; e.add(inner);
      /* torn bites eaten out of the rim */
      if (S.earTorn && (S.unevenEars ? side < 0 : true)) {
        [-1, 1].forEach(b => {
          const bite = blob(.022 * os, .028 * os, .05, M.black(.7, .2));
          bite.position.set(b * .05 * os, .06 * os, .004);
          e.add(bite);
        });
        const nick = blob(.03 * os, .018 * os, .026, M.chip(0x7a4438));
        nick.position.set(.045 * os, .085 * os, .006);
        e.add(nick);
      }
      bones['ear' + (side < 0 ? 'L' : 'R')] = e;
    });

    /* snout: tapered cone whose far tip carries the nostril blob.
       Extent stays proportional to snoutLen (0.05–0.5) so heads keep
       their rat silhouette instead of growing a ski jump. */
    const snFL = .13 + .30 * S.snoutLen;              /* half-length */
    const snBase = .06;
    const snC = snBase + snFL * 1.55;                 /* centre z */
    const snEnd = snBase + snFL * 2.1;                /* tip z */
    const snout = blob(.075, .068, snFL, skinMat);
    snout.position.set(0, .11, snC);
    headG.add(snout); bones.snout = snout;

    const bridge = blob(.085, .09, snFL * .92, furMat);
    bridge.position.set(0, .15, snBase + snFL * .9);
    headG.add(bridge);

    if (S.snoutShort) {           /* crushed short snout: wider, tilted */
      snout.scale.multiplyScalar(1.35); snout.rotation.z = .22;
      bridge.scale.multiplyScalar(1.3); bridge.rotation.z = -.18;
    }
    /* bent nose: whole muzzle veers sideways */
    const snBend = S.snoutBent || 0;
    if (snBend) {
      snout.rotation.y = snBend; bridge.rotation.y = snBend * .7;
    }

    /*! nostril blob */
    const noseTip = blob(.033, .028, .03, M.nose());
    noseTip.position.set(S.bulb ? 0 : snBend * .16, .125, snEnd);
    headG.add(noseTip);
    if (S.bulb) {                 /* huge bulbous nose */
      noseTip.scale.set(1.75, 1.9, 1.7);
      noseTip.position.z += .02;
      const bulb2 = blob(.05, .042, .045, M.nose());
      bulb2.position.set(0, .10, snEnd - .075);
      bulb2.rotation.y = snBend * .8;
      headG.add(bulb2);
      /* chronic redness around the nose */
      const red = blob(.062, .05, .052, M.chip(0x9a4a44));
      red.position.set(0, .105, snEnd - .11);
      headG.add(red);
    } else if (snBend) {
      noseTip.position.x += snBend * .12;   /* tip bends with the bridge */
    }

    /* crooked yellow teeth */
    const teethGroup = new THREE.Group();
    teethGroup.position.set(0, .072, snBase + snFL * 1.15);
    headG.add(teethGroup); bones.teeth = teethGroup;
    const tm = S.teethRotten ? M.teethRot() : M.teeth();
    if (S.teethMissing) {
      /* just one lonely incisor left, the rest rotted out */
      const tm2 = box(.022, .05 * S.teethSize, .02, tm);
      tm2.rotation.z = RC.rand(-.25, .25); tm2.position.x = -.014;
      teethGroup.add(tm2);
      const gap = blob(.05, .02, .026, M.gum());
      gap.position.set(.012, .01, -.002);
      teethGroup.add(gap);
      const t3 = box(.028, .014, .018, tm);
      t3.position.set(.012, -.028, 0); teethGroup.add(t3);
    } else {
      const crookK = S.teethBigCrook ? 2.2 : 1;
      const t1 = box(.022, .05 * S.teethSize * crookK, .02, tm);
      t1.rotation.z = RC.rand(-.25, .25) + (S.teethBigCrook ? .38 * (RC.rand(0, 1) < .5 ? 1 : -1) : 0);
      t1.rotation.x = RC.rand(-.2, .1);
      t1.position.x = -.014 - (S.teethBigCrook ? .004 : 0);
      const t2 = box(.022, .045 * S.teethSize, .02, tm);
      t2.rotation.z = RC.rand(-.25, .25) - (S.teethBigCrook ? .28 : 0);
      t2.rotation.x = RC.rand(-.2, .1);
      t2.position.x = .014;
      teethGroup.add(t1, t2);
      /* lower teeth peeking */
      const t3 = box(.05, .018, .018, tm);
      t3.position.y = -.028; teethGroup.add(t3);
    }
    /* crooked jaw: whole dental arch sits askew */
    if (S.jawCrook) {
      teethGroup.rotation.z = .32;
      teethGroup.position.x += .022;
      teethGroup.position.y -= .004;
    }

    /* whiskers */
    const wGeo = new THREE.CylinderGeometry(.0022, .0009, .13, 4);
    const wMat = S.dirtyWhisk ? M.chip(0x6a5628) : M.black(.4, .6);
    [-1, 1].forEach(side => {
      for (let i = 0; i < 3; i++) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(.02 * side, .085 + i * .012, snBase + snFL * 1.55);
        w.rotation.z = Math.PI / 2 + side * RC.rand(-.15, .15) * (S.dirtyWhisk ? 1.6 : 1);
        w.rotation.y = side * RC.rand(.5, .95);
        if (S.dirtyWhisk) {   /* greasy whiskers: bent, matted, some dangling */
          w.rotation.z += side * .22 * (i - 1);
          w.rotation.x += .5;
          if (i === 1) {
            const dab = blob(.006, .004, .004, M.chip(0x7a6a3a));
            dab.position.set(.026 * side + snBend * .05, .1, snBase + snFL * 1.3);
            headG.add(dab);
          }
        }
        headG.add(w);
      }
    });

    /* eyes: white + sunken + droop lid */
    const eS = S.eyeScale, eZ = .085 + (eS > 1.3 ? (eS - 1.3) * .07 : 0);
    const eyeMat = S.eyeBlood ? M.eyeBlood() : M.eye(), irisMat = M.chip(S.iris), lidMat = furMat;
    [-1, 1].forEach(side => {
      const e = new THREE.Group();
      e.position.set(.055 * side, .19, eZ);
      headG.add(e); bones['eye' + (side < 0 ? 'L' : 'R')] = e;
      const white = blob(.026 * eS, .026 * eS, .026 * eS, eyeMat);
      white.rotation.x = .35;
      e.add(white);
      const iris = blob(.011 * eS, .011 * eS, .006 * eS, irisMat);
      iris.position.z = .023 * eS; iris.rotation.x = .35;
      /* wall-eyed / cross-eyed drift of the whole pupil stack */
      if (S.eyeCross) {
        iris.position.x = -.006 * side;
        iris.position.y = -.002 * side;
      }
      e.add(iris);
      const pupil = blob(.0052 * eS, .0052 * eS, .004 * eS, M.black(.2, .8));
      pupil.position.set(S.eyeCross ? -.014 * side : 0, S.eyeCross ? -.005 * side : 0, .027 * eS);
      e.add(pupil);
      const lid = blob(.03 * eS, .014 + .01 * S.droop, .026 * eS, lidMat);
      lid.position.set(0, .02 + .012 * S.droop, .004);
      e.add(lid);
      /* squint bags */
      const bag = blob(.024, .009, .02, skinMat);
      bag.position.set(0, -.02, .008); e.add(bag);
      /* red sore rims */
      if (S.eyeBlood) {
        const sore = blob(.02, .008, .02, M.chip(0x8a2a22));
        sore.position.set(0, -.012, .012); e.add(sore);
      }
    });

    /* misshapen side hump (deformed mutants) */
    if (S.sideHump) {
      const hump = blob(.11, .09, .1, furMat);
      hump.position.set(.07, .40, -.10);
      hump.rotation.z = .4; torso.add(hump);
    }
    const brow = box(.1, .012, .012, furMat);
    brow.position.set(0, .225, .095);
    brow.rotation.z = RC.rand(-.06, .06);
    headG.add(brow);

    /* warts */
    const wartMat = M.chip(0x8a6a52);
    for (let i = 0; i < S.warts; i++) {
      const a = RC.rand(0, Math.PI * 2), r = RC.rand(.5, .95);
      const w = blob(.008, .008, .008, wartMat);
      w.position.set(Math.cos(a) * .12 * r * side(r), .11 + Math.sin(a) * .06 * r, .11 + Math.abs(Math.cos(a)) * .05);
      headG.add(w);
    }
    /* body warts: stalks on the trunk too */
    if (S.wartsBody) {
      for (let i = 0; i < 9; i++) {
        const a = RC.rand(0, Math.PI * 2);
        const w = blob(.014, .014, .014, wartMat);
        w.position.set(Math.cos(a) * .17 * W, RC.rand(.05, .42), .13 + Math.abs(Math.sin(a)) * .05);
        torso.add(w);
      }
    }
    /* scars */
    const scarMat = M.chip(0x9a5f55);
    for (let i = 0; i < S.scars; i++) {
      const sc = box(.0035, RC.rand(.05, .1), .002, scarMat);
      sc.position.set(RC.rand(-.09, .09), .13, .105);
      sc.rotation.z = RC.rand(0, Math.PI);
      sc.position.z += Math.abs(sc.position.x) * .1;
      headG.add(sc);
    }
    if (S.scarsBody) {
      for (let i = 0; i < 3; i++) {
        const sc = box(.006, RC.rand(.14, .3), .003, scarMat);
        sc.position.set(RC.rand(-.14, .14) * W, RC.rand(.08, .4), .145);
        sc.rotation.z = RC.lerp(-1, 1, i / 2);
        torso.add(sc);
      }
    }
    /* raised red pimples w/ whiteheads */
    if (S.pimples) {
      const pkMat = M.chip(0x9a3830), tipMat = M.chip(0xe8dcc0);
      for (let i = 0; i < 7; i++) {
        const a = RC.rand(0, Math.PI * 2), r = RC.rand(.4, .95);
        const p = blob(.0075, .0075, .0075, pkMat);
        p.position.set(Math.cos(a) * .12 * r * side(r), .12 + Math.sin(a) * .07 * r, .1 + Math.abs(Math.cos(a)) * .05);
        headG.add(p);
        const tp = blob(.003, .003, .003, tipMat);
        tp.position.copy(p.position); tp.position.z += .006;
        headG.add(tp);
      }
      /* a crop on one shoulder for good measure */
      const pSh = blob(.01, .01, .01, pkMat);
      pSh.position.set(.09 * side(1) * W, .47, .05);
      torso.add(pSh);
    }
    /* skin blemishes: sun blotches & liver spots on the bare face */
    if (S.blemish) {
      const spots = [0x7a4a3a, 0x5c3a2a, 0x8a5a4a];
      for (let i = 0; i < 10; i++) {
        const a = RC.rand(0, Math.PI * 2), r = RC.rand(.3, .9);
        const sp = blob(.012, .005, .01, M.chip(RC.pick(spots)));
        sp.position.set(Math.cos(a) * .12 * r * side(r), .12 + Math.sin(a) * .07 * r, .1 + Math.abs(Math.cos(a)) * .055);
        sp.rotation.x = .4;
        headG.add(sp);
      }
    }
    /* greasy missing-fur patches across the hide */
    if (S.furPatches) {
      const patchMat = M.skin(skinHex);
      const spotsX = [chest, belly, pelvis, refs.shL && refs.shL.children[0], refs.shR && refs.shR.children[0]].filter(Boolean);
      spotsX.forEach(host => {
        for (let i = 0; i < 2; i++) {
          const a = RC.rand(0, Math.PI * 2);
          const patch = blob(.07, .05, .045, patchMat);
          patch.position.set(Math.cos(a) * .1 * W, host === belly ? .16 : .36 + (host === chest ? .05 : 0), -.14 + Math.sin(a) * .03);
          patch.rotation.set(RC.rand(-1, 1), 0, RC.rand(-1, 1));
          (host.parent || torso).add(patch);
        }
      });
    }

    /* ---------- arms ---------- */
    const armR = S.limp ? RC.rand(.8, .95) : (S.armLenR || 1);  // char asymmetry
    const armL = 1;
    const makeArm = (sideX, lenF) => {
      const sh = new THREE.Group();
      sh.position.set(S.shoulderW * W * sideX, .45 + (sideX > 0 ? (S.shROffset || 0) : 0), 0);
      torso.add(sh);
      const studded = blob(.055 * W, .07, .06, furMat);
      sh.add(studded);
      const up = new THREE.Group(); sh.add(up);
      up.add(limb(.30 * lenF, .045 * W * S.limbRA, .04 * W * S.limbRA, furMat));
      const el = new THREE.Group();
      el.position.y = -.30 * lenF; up.add(el);
      el.add(limb(.27 * lenF, .038 * W * S.limbRA, .034 * W * S.limbRA, furMat));
      const hand = new THREE.Group();
      hand.position.y = -.27 * lenF; el.add(hand);
      const palm = blob(.045, .05, .028, skinMat);
      palm.position.y = -.02; hand.add(palm);
      for (let f = 0; f < 3; f++) {
        const fg = new THREE.Mesh(new THREE.CapsuleGeometry(.008, .045, 4, 6), skinMat);
        fg.position.set((f - 1) * .02, -.06, -.004);
        fg.rotation.x = RC.rand(-.2, .2); fg.rotation.z = (f - 1) * .3;
        fg.castShadow = true;
        hand.add(fg);
      }
      return [sh, up, el, hand];
    };
    [refs.shL, refs.upL, refs.elL, refs.handL] = makeArm(-1, armL);
    [refs.shR, refs.upR, refs.elR, refs.handR] = makeArm(1, armR);
    bones.handR = refs.handR; bones.handL = refs.handL;

    /* ---------- legs ---------- */
    const makeLeg = sideX => {
      const th = new THREE.Group();
      th.position.set(.115 * W * S.hipsW * sideX, .02, 0);
      hips.add(th);
      /* asymmetric mutant: right leg grew wrong */
      const legK = (S.legLenR != null && sideX > 0) ? S.legLenR : 1;
      th.add(limb(.42 * legS * legK, .062 * W * S.limbRL, .048 * W * S.limbRL, furMat));
      const sh = new THREE.Group();
      sh.position.y = -.42 * legS * legK; th.add(sh);
      sh.add(limb(.4 * legS * legK, .048 * W * S.limbRL, .038 * W * S.limbRL, furMat));
      const ft = new THREE.Group();
      ft.position.y = -.4 * legS * legK; sh.add(ft);
      const foot = blob(.05 * W, .04, .1, skinMat);
      foot.position.set(0, -.015, .035); ft.add(foot);
      /* ratty toes */
      for (let i = 0; i < 3; i++) {
        const toe = new THREE.Mesh(new THREE.CapsuleGeometry(.009, .03, 3, 6), skinMat);
        toe.rotation.x = Math.PI / 2;
        toe.position.set((i - 1) * .02, -.028, .11);
        ft.add(toe);
      }
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
      legH: .82 * legS + .1 * s,   /* standing hip height (used by animation) */
    };
    chr.setGarment = RCC_setGarment(chr);
    applyLimp(chr);
    return chr;
  };

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
      chr.bones.hips.position.y = ((chr.legH || 0.92 * chr.scaleAll)) + Math.abs(Math.sin(p)) * .035 + Math.sin(p * 2) * .012;
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
      chr.bones.hips.position.y = ((chr.legH || 0.92 * chr.scaleAll)) + Math.sin(t * 1.8) * .01;
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
      chr.bones.hips.position.y = (chr.legH || .92 * chr.scaleAll) + Math.sin(A.breathe) * .006;
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
