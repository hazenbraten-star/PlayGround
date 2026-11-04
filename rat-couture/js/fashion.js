/* ================= fashion.js — all clothing / accessory builders ======
   Convention: every item's `build` key maps to a builder function that
   returns [[anchorName, Object3D], ...] pieces. RC.wear(chr, cat, item)
   manages the player's current outfit per category slot. Materials all
   come from the cached grungy factory in textures.js.                  */
(function () {
  const RC = window.RC, M = RC.materials;
  const THREE = window.THREE;

  const B = {};              // builder registry

  /* ==================== shared small part helpers ==================== */
  function box(w, h, d, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true;
    return m;
  }
  function cyl(rT, rB, h, mat, x = 0, y = 0, z = 0, seg = 10) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = true;
    return m;
  }
  function sph(r, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    m.position.set(x, y, z); m.castShadow = true;
    return m;
  }
  function cone(r, h, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat);
    m.position.set(x, y, z); m.castShadow = true;
    return m;
  }
  function tor(r, tube, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 12), mat);
    m.position.set(x, y, z); m.castShadow = true;
    return m;
  }
  function row(list, anchor) { return list.map(o => [anchor, o]); }

  /* ==================== HEAD GEAR ==================== */
  B.gasMask = chr => {
    const g = new THREE.Group(), r = [];
    const hood = sph(.15, M.latex(0x3a3f34));
    hood.scale.set(1.05, .95, .9); hood.position.set(0, .17, .04); g.add(hood);
    [-1, 1].forEach(sd => {
      const lens = cyl(.034, .034, .022, M.chip(0x201e1b), .055 * sd, .21, .13);
      lens.rotation.x = Math.PI / 2; g.add(lens);
      const rim = tor(.036, .007, M.rust(1), .055 * sd, .21, .135);
      rim.rotation.x = Math.PI / 2 -.4; g.add(rim);
    });
    const snout = cyl(.024, .038, .07, M.black(.5), 0, .13, .2);
    snout.rotation.x = Math.PI / 2 - .25; g.add(snout);
    const belt = tor(.16, .012, M.rust(1), 0, .17, .01); belt.rotation.x = Math.PI / 2; g.add(belt);
    r.push([g, 'head']);
    /* filters backpack */
    const bp = new THREE.Group();
    bp.add(box(.1, .12, .05, M.latex(0x3a3f34), 0, .1, -.16));
    bp.add(cyl(.02, .02, .05, M.rust(1), .03, .06, -.115));
    bp.add(cyl(.02, .02, .05, M.rust(1), -.03, .06, -.115));
    r.push([bp, 'head']);
    return r;
  };

  B.coneHat = chr => {
    const g = new THREE.Group();
    const c = cone(.095, .3, M.chip(0xb44b18));
    c.position.set(.02, .42, 0); c.rotation.z = .22; g.add(c);
    const stripe = tor(.062, .012, M.black(.6), .02, .5, 0); g.add(stripe);
    const goo = sph(.03, M.chip(0x3a4d1a), .01, .47, .05); g.add(goo);
    const drip = cyl(.008, .002, .06, M.chip(0x3a4d1a), .012, .4, .075); g.add(drip);
    return row([g], 'head');
  };

  B.concreteFedora = chr => {
    const g = new THREE.Group();
    const mat = M.concrete(1);
    const brim = cyl(.16, .17, .03, mat, 0, .3, 0); g.add(brim);
    const top = cyl(.09, .1, .12, mat, 0, .37, 0); g.add(top);
    const band = tor(.1, .014, M.rust(1), 0, .325, 0); band.rotation.x = Math.PI / 2; g.add(band);
    const crack = box(.002, .12, .002, M.black(.9), .05, .37, .09); g.add(crack);
    return row([g], 'head');
  };

  B.skullCrown = chr => {
    const g = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const sk = sph(.028, M.bone(), Math.cos(a) * .13, .28, Math.sin(a) * .13);
      sk.scale.set(1, .8, .85); g.add(sk);
      const eyeT = sph(.006, M.black(), Math.cos(a) * .14, .285, Math.sin(a) * .14); g.add(eyeT);
      const eye2 = sph(.006, M.black(), Math.cos(a + .2) * .14, .285, Math.sin(a + .2) * .14); g.add(eye2);
    }
    const gem = sph(.016, M.emissive(0xff2a6d, 1.6), 0, .3, .14); g.add(gem);
    return row([g], 'head');
  };

  B.weldMask = chr => {
    const g = new THREE.Group();
    const shell = box(.19, .22, .05, M.rust(1));
    shell.position.set(0, .13, .1); shell.rotation.x = -.12; g.add(shell);
    const pane = box(.13, .05, .01, M.chip(0x232a38));
    pane.position.set(0, .18, .135); g.add(pane);
    const spark = box(.11, .03, .005, M.emissive(0x66d9ff, 1.2));
    spark.position.set(0, .18, .142); g.add(spark);
    return row([g], 'head');
  };

  B.hairMohawk = chr => {
    const g = new THREE.Group();
    const baseMat = M.fabric('#1a1208');
    const scalp = box(.16, .05, .02, M.skin('#a8776a'), 0, .27, 0);
    g.add(scalp);
    for (let i = 0; i < 9; i++) {
      const h = RC.rand(.12, .3);
      const spike = cone(.016, h, baseMat);
      spike.position.set(0, .29 + h / 2, -.04 + i * .022);
      spike.rotation.x = RC.rand(-.15, .15); spike.rotation.y = RC.rand(-.2, .2);
      g.add(spike);
    }
    return row([g], 'head');
  };

  B.hubcapTiara = chr => {
    const g = new THREE.Group();
    const dom = sph(.1, M.chip(0x9aa0a6), 0, .32, -.01);
    dom.scale.set(1.15, .55, 1.05); g.add(dom);
    const rim = tor(.1, .014, M.rust(1), 0, .3, 0); rim.rotation.x = Math.PI / 2; g.add(rim);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + .3;
      const spike = cone(.012, .05, M.rust(1), Math.cos(a) * .1, .33, Math.sin(a) * .1);
      g.add(spike);
    }
    return row([g], 'head'); // placeholder
  };

  B.balaclava = chr => {
    const g = new THREE.Group();
    const hood = sph(.145, M.fabric('#3a4a3a', { smooth: true }));
    hood.position.set(0, .16, .02); g.add(hood);
    const visor = box(.14, .05, .02, M.chip(0x374d38));
    visor.position.set(0, .2, .12); g.add(visor);
    const bio = cyl(.02, .02, .02, M.emissive(0x9dff2a, 2), 0, .17, .115);
    bio.rotation.x = Math.PI / 2; g.add(bio);
    return row([g], 'head');
  };

  B.dayWig = chr => {
    const g = new THREE.Group();
    const greas = M.fabric('#5a4630');
    const cap = sph(.14, greas, 0, .21, -.01);
    cap.scale.set(1.1, .8, .95); g.add(cap);
    for (let i = 0; i < 16; i++) {
      const a = RC.rand(0, Math.PI * 2);
      const strand = cyl(.004, .001, RC.rand(.12, .24), greas);
      strand.position.set(Math.cos(a) * .12, .12, Math.sin(a) * .12 - .02);
      strand.rotation.z = Math.cos(a) * .4; strand.rotation.x = Math.sin(a) * .4;
      g.add(strand);
    }
    stain(g, .05, 0x6a4a2a, 0, .1, .12);
    return row([g], 'head');
  };

  B.cigSombrero = chr => {
    const g = new THREE.Group();
    const brim = cyl(.24, .27, .02, M.fabric('#7c5a26'), 0, .34, 0); g.add(brim);
    const top = cyl(.1, .12, .1, M.fabric('#7c5a26'), 0, .4, 0); g.add(top);
    const bandM = tor(.115, .012, M.black(.7), 0, .36, 0); bandM.rotation.x = Math.PI / 2; g.add(bandM);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      const cig = cyl(.008, .008, .11, M.fabric('#e8e0d0'));
      cig.position.set(Math.cos(a) * .22, .34, Math.sin(a) * .22);
      cig.rotation.z = Math.PI / 2; cig.rotation.y = a;
      g.add(cig);
      const ember = sph(.007, M.emissive(0xff5a1e, 2.4), Math.cos(a) * .27, .345, Math.sin(a) * .27);
      g.add(ember);
    }
    return row([g], 'head');
  };

  /* stain helper: dark blotch on garment */
  function stain(parent, r, color, x, y, z) {
    const sp = sph(r, M.chip(color), x, y, z);
    sp.scale.z = .03; sp.castShadow = false;
    parent.add(sp);
    return sp;
  }

  /* ==================== TOP WEAR ==================== */
  B.jacket = chr => {
    const s = chr.scaleAll, W = chr.spec.width;
    const g = new THREE.Group();
    const mat = M.fabric('#241d18', { metal: false, smooth: true });
    const body = cyl(.19 * W, .22 * W, .45, mat, 0, .3, .01, 12);
    body.scale.z = .8; g.add(body);
    const collar = tor(.11 * W, .02, mat, 0, .52, .02);
    collar.rotation.x = Math.PI / 2; g.add(collar);
    const zip = box(.01, .4, .01, M.wire(0x777), 0, .3, .16 * W); g.add(zip);
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.06 * W, .05 * W, .5, mat);
      sleeve.position.set(.26 * W * sd, .22, -.0);
      sleeve.rotation.z = sd * Math.PI / 2 * .96;
      g.add(sleeve);
    });
    /* rips */
    for (let i = 0; i < 4; i++) {
      rip(g, M.skin('#' + chr.spec.skin.toString(16).padStart(6, '0')), RC.rand(-.1, .1), RC.rand(.2, .45), .12 * W);
    }
    /* studs on collar */
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      g.add(sph(.008, M.wire(0xb0a06a), Math.cos(a) * .11 * W, .52, .02 + Math.sin(a) * .04));
    }
    return row([g], 'torso');
  };
  function rip(parent, mat, x, y, z) {
    const r = sph(.02, mat, x, y, z);
    r.scale.y = RC.rand(1, 2.4); r.scale.x = RC.rand(.4, .9);
    parent.add(r);
  }

  B.straitcoat = chr => {
    const W = chr.spec.width;
    const g = new THREE.Group();
    const mat = M.fabric('#d8cdb4');
    const body = cyl(.2 * W, .23 * W, .48, mat, 0, .29, .01, 12);
    body.scale.z = .85; g.add(body);
    [-1, 1].forEach(sd => {
      const band = tor(.2 * W, .014, M.fabric('#b8ad94'), 0, .2 + .09 * (sd + 1) / 2 * 3, .0);
      band.rotation.x = Math.PI / 2; band.scale.z = .8; g.add(band);
    });
    const belt = tor(.22 * W, .02, M.fabric('#8f8672'), 0, .33, .01); belt.rotation.x = Math.PI / 2; belt.scale.z = .8; g.add(belt);
    /* crossing sleaves */
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.05 * W, .05 * W, .6, mat);
      sleeve.position.set(.1 * sd, .32, .12);
      sleeve.rotation.z = sd * 1.2; sleeve.rotation.y = .4 * sd;
      g.add(sleeve);
      sleeve.castShadow = true;
    });
    stain(g, .06, 0x6a5230, -.08 * W, .42, .1); stain(g, .04, 0x4a3a20, .09 * W, .22, .13);
    return row([g], 'torso');
  };

  B.furCoat = chr => {
    const W = chr.spec.width;
    const g = new THREE.Group();
    const mat = M.fabric('#4a3a28');
    const half1 = cyl(.22 * W, .25 * W, .5, mat, -.08 * W, .29, .01, 12);
    half1.scale.z = .75; g.add(half1);
    const half2 = cyl(.2 * W, .25 * W, .5, mat, -.02 * W, .29, .01, 12);
    half2.scale.z = .75; g.add(half2);
    /* shaved chest panel */
    const shaveMat = M.skin('#' + chr.spec.skin.toString(16).padStart(6, '0'));
    const shave = box(.14 * W, .42, .02, shaveMat, .11 * W, .32, .14 * W);
    g.add(shave);
    for (let i = 0; i < 3; i++) rip(shave, M.chip(0x7a4a44), RC.rand(-.05, .05), RC.rand(-.15, .15), .012);
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.06 * W, .07 * W, .48, mat);
      sleeve.position.set(.27 * W * sd, .2, 0);
      sleeve.rotation.z = sd * Math.PI / 2 * .96;
      g.add(sleeve);
    });
    return row([g], 'torso');
  };

  B.poncho = chr => {
    const g = new THREE.Group();
    const mat = M.fabric('#1c1c1c', { smooth: true });
    const bag = cyl(.26, .3, .5, mat, 0, .28, 0, 12);
    g.add(bag);
    const neckHole = tor(.07, .014, mat, 0, .5, 0);
    neckHole.rotation.x = Math.PI / 2; g.add(neckHole);
    for (let i = 0; i < 5; i++) {
      const tw = tor(.02, .012, mat, RC.rand(-.2, .2), RC.rand(.1, .45), .22 + RC.rand(-.05, .05));
      tw.rotation.y = RC.rand(-1, 1); g.add(tw);
    }
    const label = box(.08, .03, .002, M.plate('GLAD'), 0, .34, .19);
    g.add(label);
    return row([g], 'torso');
  };

  B.chainSinglet = chr => {
    const g = new THREE.Group();
    const linkMat = M.rust(1);
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * Math.PI * 2, lvl = i % 3;
      const y = .13 + lvl * .14;
      const link = tor(.085 * (1 - lvl * .08), .009, linkMat, Math.cos(a) * .16 * (1 - lvl * .06), y, Math.cos(a * 2) * .06);
      link.rotation.y = a; g.add(link);
    }
    return row([g], 'torso');
  };

  B.hazmatTop = chr => {
    const g = new THREE.Group();
    const mat = M.latex(0xb8a838);
    const body = cyl(.21, .24, .47, mat, 0, .28, .01, 12); body.scale.z = .85; g.add(body);
    const hood = sph(.15, mat, 0, .5, .02); hood.scale.set(1, .8, .95); g.add(hood);
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.06, .05, .5, mat);
      sleeve.position.set(.24 * sd, .2, 0);
      sleeve.rotation.z = sd * Math.PI / 2 * .95; g.add(sleeve);
    });
    const tape = tor(.23, .012, M.fabric('#c13030'), 0, .23, .01);
    tape.rotation.x = Math.PI / 2; tape.scale.z = .8; g.add(tape);
    const tape2 = tor(.225, .012, M.fabric('#c13030'), 0, .4, .01);
    tape2.rotation.x = Math.PI / 2; tape2.scale.z = .8; g.add(tape2);
    return row([g], 'torso');
  };

  B.barbedSweater = chr => {
    const g = new THREE.Group();
    const mat = M.fabric('#3a3430');
    const body = cyl(.2, .23, .44, mat, 0, .3, .01, 12); body.scale.z = .85; g.add(body);
    const neck = tor(.1, .022, mat, 0, .52, 0); neck.rotation.x = Math.PI / 2; g.add(neck);
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.055, .05, .45, mat);
      sleeve.position.set(.235 * sd, .24, 0);
      sleeve.rotation.z = sd * Math.PI / 2 * .96;
      g.add(sleeve);
    });
    /* barbed wire wrap */
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      const link = tor(.115, .004, M.wire(0x5a5952), Math.cos(a) * .1, .16 + (i % 2) * .1, Math.sin(a) * .18 + .01);
      link.rotation.z = a; link.rotation.y = Math.PI / 2;
      g.add(link);
      if (i % 3 === 0) {
        const barb = cone(.008, .03, M.wire(0x8a8478), Math.cos(a) * .12, .16 + (i % 2) * .1, Math.sin(a) * .19 + .01);
        barb.rotation.z = Math.PI / 2 * RC.rand(.6, 1.4);
        g.add(barb);
      }
    }
    return row([g], 'torso');
  };

  B.tuxMoth = chr => {
    const W = chr.spec.width;
    const g = new THREE.Group();
    const bl = M.fabric('#131313');
    const body = cyl(.19 * W, .22 * W, .45, bl, 0, .3, .01, 12); body.scale.z = .8; g.add(body);
    const lapelL = box(.06 * W, .16, .01, bl, -.06 * W, .45, .13 * W);
    lapelL.rotation.z = -.3; g.add(lapelL);
    const lapelR = box(.06 * W, .16, .01, bl, .06 * W, .45, .13 * W);
    lapelR.rotation.z = .3; g.add(lapelR);
    const shirt = box(.07 * W, .3, .01, M.fabric('#b8b4a4'), 0, .35, .15 * W); g.add(shirt);
    const bowTie = box(.07, .03, .02, M.fabric('#3a0e0e'), 0, .5, .155 * W); g.add(bowTie);
    for (let i = 0; i < 5; i++) {
      const btn = sph(.008, M.bone(), 0, .46 - i * .05, .158 * W); g.add(btn);
    }
    /* moth holes */
    for (let i = 0; i < 7; i++) {
      const hole = sph(RC.rand(.012, .03), M.chip(0x0a0a0a), RC.rand(-.14, .14) * W, RC.rand(.2, .48), .15 * W + RC.rand(-.04, .04));
      hole.scale.y = RC.rand(.5, 1); g.add(hole);
    }
    return row([g], 'torso');
  };

  B.vinylRaincoat = chr => {
    const g = new THREE.Group();
    const mat = M.latex(0xd9e021);
    const body = cyl(.22, .3, .5, mat, 0, .27, .01, 12); g.add(body);
    [-1, 1].forEach(sd => {
      const sleeve = cyl(.06, .055, .5, mat);
      sleeve.position.set(.26 * sd, .22, 0);
      sleeve.rotation.z = sd * Math.PI / 2 * .96;
      g.add(sleeve);
    });
    /* gloopy stains */
    stain(g, .05, 0x4a5a18, .08, .35, .2);
    stain(g, .04, 0x4a5a18, -.09, .2, .19);
    stain(g, .06, 0x2a2a12, .02, .46, .2);
    return row([g], 'torso');
  };

  B.morningSuit = chr => {
    const W = chr.spec.width;
    const g = new THREE.Group();
    const mat = M.fabric('#2c2a24');
    const body = cyl(.2 * W, .23 * W, .48, mat, 0, .29, .01, 12); body.scale.z = .82; g.add(body);
    /* tail coat flaps */
    [-1, 1].forEach(sd => {
      const tail = box(.08 * W, .3, .015, mat, .09 * W * sd, .1, -.14);
      tail.rotation.x = .35; tail.rotation.z = sd * .1;
      g.add(tail);
    });
    const shirt = box(.08 * W, .32, .01, M.fabric('#c2bca8'), 0, .36, .15 * W); g.add(shirt);
    const collar = box(.1 * W, .03, .02, M.fabric('#c2bca8'), 0, .52, .15 * W); g.add(collar);
    /* flies swarm */
    for (let i = 0; i < 6; i++) {
      const flyObj = new THREE.Group();
      const fly = sph(.008, M.black(.2, .9));
      flyObj.add(fly);
      const wing = sph(.012, M.chip(0x7a8a8f));
      wing.scale.x = .1; wing.scale.z = .5;
      flyObj.add(wing);
      const a = RC.rand(0, Math.PI * 2), rr = RC.rand(.1, .2);
      flyObj.position.set(Math.cos(a) * rr, RC.rand(.2, .5), .16 * W + RC.rand(0, .05));
      flyObj.userData.swarm = { a, rr, ph: RC.rand(0, 7), sp: RC.rand(4, 9) };
      RC._swarms = RC._swarms || []; RC._swarms.push(flyObj);
      g.add(flyObj);
    }
    return row([g], 'torso');
  };

  /* ==================== LEG WEAR ==================== */
  B.bondagePants = chr => {
    const out = [], W = chr.spec.width;
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R', limbC = .62, puffs = [];
      const thigh = new THREE.Group();
      const legMat = M.fabric('#1e1c1e');
      const pant = cyl(.068 * W, .075 * W, .5, legMat, 0, -.2, 0, 10);
      thigh.add(pant);
      const pt = cyl(.062 * W, .062 * W, .34, legMat, 0, -.2 - .2, 0, 10);
      thigh.add(pt); // fake shin wrap (rough)
      const chainAmt = 2;
      for (let c = 0; c < chainAmt; c++) {
        const ch = tor(.075 * W, .008, M.wire(0x8a8a8a), Math.cos(c * 2) * .02, -.12 - c * .12, Math.sin(c * 2) * .02);
        ch.rotation.x = Math.PI / 2; thigh.add(ch);
      }
      const pocket = box(.09, .07, .03, legMat, .07 * W * sd, -.22, .01); thigh.add(pocket);
      out.push([thigh, 'thigh' + side]);
    });
    return out;
  };

  B.camoPants = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const legMat = M.fabric('#4a5438');
      const thigh = new THREE.Group();
      const pant = cyl(.07 * chr.spec.width, .07 * chr.spec.width, .85, legMat, 0, -.45, 0, 10);
      thigh.add(pant);
      const pad = box(.08, .1, .02, M.fabric('#3a4128'), .06 * sd, -.3, .05); thigh.add(pad);
      out.push([thigh, 'thigh' + side]);
    });
    return out;
  };

  B.longjohns = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const legMat = M.fabric('#8a8878');
      const thigh = new THREE.Group();
      const pant = cyl(.068 * chr.spec.width, .06 * chr.spec.width, .86, legMat, 0, -.45, 0, 10);
      thigh.add(pant);
      for (let i = 0; i < 4; i++) {
        const fl = tor(.075, .016, M.fabric('#8a8878'), Math.cos(i * 2) * 0, -.25 - i * .18, 0);
        thigh.add(fl);
      }
      out.push([thigh, 'thigh' + side]);
    });
    return out;
  };

  B.fishnetLegs = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      /* wrap: cross-hatch torus rings */
      for (let i = 0; i < 9; i++) {
        const r = .062 * chr.spec.width;
        const ring = tor(r, .0022, M.wire(0x18120e), 0, -.05 - i * .09, 0);
        ring.rotation.x = Math.PI / 2;
        g.add(ring);
        const v = i % 2 === 0 ? 1 : -1;
        const vring = tor(r * .98, .0022, M.wire(0x18120e), 0, -.06 - i * .09, 0);
        vring.rotation.z = Math.PI / 2; vring.rotation.y = v * .4;
        g.add(vring);
      }
      g.add(cyl(.065 * chr.spec.width, .07 * chr.spec.width, .8, M.fabric('#241a10', { repeat: 2 }), 0, -.42, 0, 10));
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  B.waders = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.latex(0x27333a);
      const pant = cyl(.075 * chr.spec.width, .07 * chr.spec.width, .9, mat, 0, -.45, 0, 10);
      g.add(pant);
      const cuff = tor(.08, .016, mat, 0, -.88, .01); g.add(cuff);
      const water = sph(.07, M.chip(0x2e4038), 0, .1, 0);
      water.scale.y = .2;
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  B.scrubsBottom = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.fabric('#4a7a7a');
      const pant = cyl(.072 * chr.spec.width, .06 * chr.spec.width, .85, mat, 0, -.45, 0, 10);
      g.add(pant);
      const pocket = box(.09, .06, .01, M.fabric('#3d6666'), .05 * sd * -1, -.2, .04); g.add(pocket);
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  B.gravyBreeches = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.fabric('#7a3b28');
      const pant = cyl(.082 * chr.spec.width, .058 * chr.spec.width, .55, mat, 0, -.28, 0, 10);
      g.add(pant);
      const sock = cyl(.05, .045, .3, M.fabric('#e0d8c0'), 0, -.65, 0, 10);
      g.add(sock);
      /* gravy */
      stainG(g, .045, 0x6a4a14, 0, -.35, .05);
      stainG(g, .035, 0x7a5a1c, .02, -.15, .055);
      out.push([g, 'thigh' + side]);
    });
    function stainG(parent, r, color, x, y, z) {
      const sp = sph(r, M.chip(color), x, y, z); sp.scale.z = .04; sp.castShadow = false;
      parent.add(sp);
    }
    return out;
  };

  B.winterShorts = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.fabric('#6a5a34');
      const short = cyl(.085 * chr.spec.width, .08 * chr.spec.width, .42, mat, 0, -.2, 0, 10);
      g.add(short);
      const pocket = box(.1, .07, .02, M.fabric('#5a4c2c'), .07 * -sd, -.14, .03); g.add(pocket);
      /* knee sock */
      const sock = cyl(.052 * chr.spec.width, .05 * chr.spec.width, .3, M.fabric('#3a3630'), 0, -.55, 0, 10);
      g.add(sock);
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  B.binTights = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.latex(0x2a2e2a);
      const pant = cyl(.066 * chr.spec.width, .062 * chr.spec.width, .86, mat, 0, -.44, 0, 10);
      g.add(pant);
      const shine = sph(.03, M.chip(0x4a554a), RC.rand(-.04, .04), -.25, .055);
      shine.scale.z = .03; shine.castShadow = false;
      g.add(shine);
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  B.utilityChaps = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const mat = M.fabric('#5a3420', { metal: false });
      const chap = cyl(.062 * chr.spec.width, .056 * chr.spec.width, .85, mat, .022 * -sd, -.44, -.03, 10);
      g.add(chap);
      const strap = tor(.064 * chr.spec.width, .01, mat, 0, -.9, 0); g.add(strap);
      const buckle = box(.02, .02, .01, M.wire(0x9a9a8a), 0, -.46, .06); g.add(buckle);
      out.push([g, 'thigh' + side]);
    });
    return out;
  };

  /* ==================== FOOTWEAR (attach to shin, boot over ankle) ===== */
  B.bootStack = (chr, p) => {
    const out = [];
    const h = p.h || 1, wide = p.wide || 1, thin = p.thin;
    const tile = p.tex === 'rust' ? M.rust(1) : p.tex === 'velvet' ? M.fabric('#5a1a2a') :
      p.tex === 'plaster' ? M.fabric('#b8ae9a') : M.fabric('#' + (p.color || 0x241c16).toString(16).padStart(6, '0'));
    const soleMat = M.black(.5, .6);
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const wS = chr.spec.width;
      const shaftR = (thin ? .05 : .07) * wS * wide;
      const shaft = cyl(shaftR * 1.15, shaftR, .3 * h, tile, 0, -.3, -.01, 10);
      g.add(shaft);
      const cuff = tor(shaftR * 1.1, .014, tile, 0, -.18, 0); g.add(cuff);
      const foot = cyl(shaftR, shaftR * .85, .1, tile, 0, -.44, .06, 10);
      foot.rotation.x = Math.PI / 2; g.add(foot);
      const toe = sph(shaftR * .8, tile, 0, -.44, .13); g.add(toe);
      const sole = box(shaftR * 2 * .92 * wide, .028 * h, .28, soleMat, 0, -.49 * 1.02, .06);
      sole.position.y = -.476 - .014 * h; g.add(sole);
      /* stacked heel */
      const heel = cyl(.025, .03, .05 * h, soleMat, 0, -.46, -.02);
      heel.position.y = -.5 - .025 * h; g.add(heel);
      if (p.sheen) {
        const gl = sph(.03, M.chip(0x4a4444), 0, -.3, .06); gl.scale.z = .02; gl.castShadow = false; g.add(gl);
      }
      if (p.tex === 'rust') {
        for (let i = 0; i < 3; i++) {
          const ruin = sph(.02, M.chip(0x8a4a1e), RC.rand(-.04, .04), RC.rand(-.42, -.24), .08);
          ruin.scale.z = .04; ruin.castShadow = false; g.add(ruin);
        }
      }
      out.push([g, 'shin' + side]);
    });
    return out;
  };

  B.sandals = (chr, p) => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const soleMat = M.fabric('#c2a86a');
      const sole = box(.09, .018, .24, soleMat, 0, -.478, .06); g.add(sole);
      [-1, 1].forEach(xz => {
        const strapT = tor(.03, .008, soleMat, .02 * xz, -.44, .02);
        strapT.rotation.x = Math.PI / 2; strapT.rotation.y = xz * .4;
        g.add(strapT);
      });
      /* dress sock up to knee */
      const sock = cyl(.048 * chr.spec.width, .042 * chr.spec.width, .35, M.fabric('#d8d0b8'), 0, -.25, -.02, 10);
      g.add(sock);
      sock.rotation.x = -.25;
      if (p.fish) {
        for (let i = 0; i < 3; i++) {
          const f = cyl(.014, .02, .12, M.chip(0x6a7a72), 0, -.475, -.04 + i * .1);
          f.rotation.x = Math.PI / 2; g.add(f);
          const tail = cone(.016, .05, M.chip(0x8a7a5a), 0, -.475, -.115 + i * .1);
          tail.rotation.x = -Math.PI / 2; g.add(tail);
        }
      }
      out.push([g, 'shin' + side]);
    });
    return out;
  };

  B.stilts = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const trMat = M.fabric('#6a523a');
      const pole = cyl(.022, .022, .65, trMat, 0, -.62, .04, 8); g.add(pole);
      const peg = cyl(.014, .014, .18, trMat, 0, -.62, .16);
      peg.rotation.x = Math.PI / 2; g.add(peg);
      const brace = cyl(.012, .012, .3, trMat, 0, -.38, -.02, 8); brace.rotation.x = .4; g.add(brace);
      const strap = tor(.05, .01, M.fabric('#3a2c1c'), 0, -.28, 0); strap.rotation.x = 1.1; g.add(strap);
      const foot = box(.07, .05, .1, trMat, 0, -.92, .05); g.add(foot);
      out.push([g, 'shin' + side]);
    });
    return out;
  };

  B.slippers = chr => {
    const out = [];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const sole = box(.09, .04, .22, M.fabric('#4a8a9a'), 0, -.475, .06); g.add(sole);
      [-1, 1].forEach(xz => {
        const v = box(.04, .07, .1, M.fabric('#3a6a7a'), .018 * xz, -.44, .0);
        v.rotation.x = -.4; g.add(v);
      });
      const velcro = box(.075, .01, .11, M.fabric('#c8c4b8'), 0, -.435, -.02);
      velcro.rotation.x = -.4; g.add(velcro);
      out.push([g, 'shin' + side]);
    });
    return out;
  };

  /* ==================== ACCESSORY ==================== */
  B.spikedCollar = chr => {
    const g = new THREE.Group();
    const band = tor(.16, .014, M.fabric('#2a1414', { smooth: true }), 0, .49, .02);
    band.rotation.x = Math.PI / 2; band.scale.z = .7; g.add(band);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      const sp = cone(.009, .04, M.wire(0x9a9a8a), Math.cos(a) * .15, .51, .04 + Math.sin(a) * .1);
      sp.rotation.x = -Math.sin(a) * .3; sp.rotation.z = Math.cos(a) * .3;
      g.add(sp);
    }
    const tag = tor(.012, .003, M.wire(0xa8a06a), .12, .43, .12); g.add(tag);
    return row([g], 'torso');
  };

  B.chestChains = chr => {
    const g = new THREE.Group();
    const m = M.wire(0x8a8a92);
    for (let i = 0; i < 4; i++) {
      const lnk = tor(.21, .011, m, 0, .18 + i * .11, .05 + (i % 2) * .1);
      lnk.rotation.x = Math.PI / 2; lnk.scale.z = .8; g.add(lnk);
      const lock = box(.035, .05, .02, M.rust(1), -.14, .18 + i * .11, .12);
      lock.rotation.z = RC.rand(-.5, .5); g.add(lock);
    }
    const shackle = tor(.06, .012, m, .1, .2, .14); g.add(shackle);
    return row([g], 'torso');
  };

  B.skullPauldrons = chr => {
    const out = [['torso', null]];
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const plate = box(.16, .03, .14, M.bone());
      plate.position.set(0, .04, 0); g.add(plate);
      for (let i = 0; i < 3; i++) {
        const sk = sph(.045, M.bone(), -.05 + i * .05, .055, RC.rand(-.02, .02));
        sk.scale.y = .8; g.add(sk);
        [-1, 1].forEach(zz => {
          const eye = sph(.011, M.black(.6), -.05 + i * .05 + .018 * zz, .05, .035);
          g.add(eye);
        });
        const teeth = box(.05, .015, .02, M.bone(), -.05 + i * .05, .03, .055); g.add(teeth);
      }
      out.push([g, 'shoulder' + side]);
    });
    return out;
  };

  B.petRat = chr => {
    const g = new THREE.Group();
    const bodyMat = M.fabric('#6a5a44');
    const body = spx(.05, .07, .1, .04, bodyMat, 0, .02, 0); g.add(body);
    const head = spx(.038, .036, .05, .03, bodyMat, 0, .045, .09);
    head.rotation.x = -.3; g.add(head);
    const snoot = sph(.02, bodyMat, 0, .05, .135); snoot.scale.set(1, .8, 2); g.add(snoot);
    const nose = sph(.006, M.nose(), 0, .055, .16); g.add(nose);
    [-1, 1].forEach(sd => {
      const ear = sph(.016, M.fabric('#6a5a44'), .018 * sd, .075, .095);
      ear.scale.set(1, 1, .25); g.add(ear);
    });
    const eyeMat = M.black(.2, .9);
    [-1, 1].forEach(sd => { g.add(sph(.007, eyeMat, .013 * sd, .05, .12)); });
    const tail = cyl(.006, .003, .14, M.chip(0x8a7a6a), 0, .02, -.11);
    tail.rotation.x = Math.PI / 2 + .5; g.add(tail);
    /* idle twitching */
    g.userData.petRat = true;
    RC._pets = RC._pets || []; RC._pets.push(g);
    return row([g], 'shoulderR');
  };
  function spx(x, y, z, r, mat, px, py, pz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    m.scale.set(x / r, y / r, z / r);
    m.position.set(px, py, pz); m.castShadow = true;
    return m;
  }

  B.ivDrip = chr => {
    const out = [];
    /* pole in left hand */
    const g = new THREE.Group();
    const pole = cyl(.012, .012, 1.1, M.wire(0x9aa0a6), 0, .42, .02, 8); g.add(pole);
    const base = tor(.18, .012, M.wire(0x9aa0a6), 0, -.1, .05);
    base.rotation.x = Math.PI / 2 - .25; g.add(base);
    const bag = box(.09, .16, .04, M.latex(0xd8d0a8), 0, .78, .02); g.add(bag);
    const fluid = box(.08, .1, .03, M.chip(0xc8a83a), 0, .75, .02); g.add(fluid);
    const label = box(.07, .03, .002, M.plate('IV'), 0, .82, .042); g.add(label);
    const tube = cyl(.005, .005, .9, M.chip(0xd8d8d0), .07, .3, .03, 6);
    tube.rotation.z = .12; tube.rotation.x = .2; g.add(tube);
    out.push([g, 'handL']);
    /* needle on arm */
    const tp = new THREE.Group();
    const tapeBand = tor(.03, .005, M.fabric('#c8c4b8'), 0, 0, 0);
    tp.add(tapeBand);
    out.push([tp, 'elL']);
    return out;
  };

  B.lightGarland = chr => {
    const g = new THREE.Group();
    const col = [0xff2a4a, 0x2aff8a, 0xffd82a, 0x2a8aff, 0xff8a2a];
    for (let w = 0; w < 3; w++) {
      let last = null;
      for (let i = 0; i < 9; i++) {
        const y = .1 + i * .05, a = Math.sin(i * 2 + w * 2) * .18;
        const x = a, z = .14 + Math.cos(i * 1.7 + w) * .1;
        const wireSeg = cyl(.002, .002, .05, M.black(.9), x, y, z);
        wireSeg.rotation.z = Math.sin(i) * .6; wireSeg.rotation.x = a;
        g.add(wireSeg);
        const bulb = sph(.014, M.emissive(col[i % 5], 2.2), x + .01, y + .02, z + .01);
        bulbs(bulb);
        g.add(bulb);
      }
    }
    function bulbs(b) { RC._garland = RC._garland || []; RC._garland.push(b.material); }
    return row([g], 'torso');
  };

  B.perfumeCloud = chr => {
    const g = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const puff = sph(RC.rand(.02, .05), M.chip(0xe8e2d0));
      puff.material.transparent = true; puff.material.opacity = RC.rand(.1, .3);
      puff.position.set(RC.rand(-.2, .2), RC.rand(0, .6), RC.rand(-.2, .2));
      puff.userData.floaty = { sp: RC.rand(.2, .6), ph: RC.rand(0, 7) };
      puff.castShadow = false;
      RC._puffs = RC._puffs || []; RC._puffs.push(puff);
      g.add(puff);
    }
    const nozzle = cyl(.02, .03, .08, M.black(.3, .8), .2, .4, .1); nozzle.rotation.z = 2; g.add(nozzle);
    return row([g], 'torso');
  };

  B.vomitScarf = chr => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ring = tor(.15 - i * .01, .018, M.fabric(i % 2 ? '#8a2a1e' : '#5a6a4a'), 0, .45 - i * .03, .05);
      ring.rotation.x = Math.PI / 2 + RC.rand(-.2, .2);
      ring.scale.z = .7; g.add(ring);
    }
    const tail = cyl(.03, .016, .25, M.fabric('#8a2a1e'), .12, .3, .02);
    tail.rotation.z = .5; g.add(tail);
    const dangle = cyl(.025, .01, .3, M.fabric('#8a2a1e'), -.05, .1, .12);
    dangle.rotation.z = -.5; g.add(dangle);
    /* a small piece of neck swirl */
    stain(g2(g), .04, 0x8a8a3a, 0, 0, 0);
    function g2(gg) { return gg.add(new THREE.Group()), gg.children[gg.children.length - 1]; }
    return row([g], 'torso');
  };

  B.tattooSleeves = chr => {
    const out = [];
    const inkMat = M.chip(0x2a3542);
    [-1, 1].forEach(sd => {
      const side = sd < 0 ? 'L' : 'R';
      const g = new THREE.Group();
      const sleeve = cyl(.052 * chr.spec.width, .045 * chr.spec.width, .55, M.fabric('#' + chr.spec.fur.toString(16).padStart(6, '0'), { repeat: 2 }), .01, -.15, .02, 10);
      g.add(sleeve);
      sleeve.castShadow = true;
      /* ink glyphs */
      for (let i = 0; i < 5; i++) {
        const glyph = box(.02, .016, .002, inkMat, 0, -.05 - i * .09, .052);
        glyph.rotation.z = RC.rand(-1, 1);
        g.add(glyph);
        if (i % 2 === 0) {
          const ring = tor(.053, .0015, inkMat, 0, -.08 - i * .09, .02);
          ring.rotation.x = Math.PI / 2 - .15; g.add(ring);
        }
      }
      const band = tor(.051, .004, M.chip(0x8a2a3a), 0, -.02, .02);
      band.rotation.x = Math.PI / 2 + .2; g.add(band);
      out.push([g, side === 'L' ? 'upL' : 'upR']);
    });
    return out;
  };

  B.wrenchBelt = chr => {
    const g = new THREE.Group();
    const belt = tor(.19, .02, M.fabric('#3a2c1a'), 0, .05, .02);
    belt.rotation.x = Math.PI / 2; belt.scale.z = .8; g.add(belt);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + .4;
      const wr = new THREE.Group();
      const shank = cyl(.008, .006, .1, M.wire(0x9a9a92), 0, -.05, .02);
      wr.add(shank);
      const jaw = box(.015, .02, .02, M.wire(0x9a9a92), 0, .005, .02); wr.add(jaw);
      const grip = cyl(.009, .009, .04, M.fabric('#c13030'), 0, -.1, .02);
      grip.rotation.z = .5; wr.add(grip);
      wr.position.set(Math.cos(a) * .19, .02, .04 + Math.sin(a) * .12);
      wr.rotation.x = Math.PI / 2;
      g.add(wr);
    }
    return row([g], 'torso');
  };

  /* ==================== PROPS (back / hand) ==================== */
  B.signProp = chr => {
    const g = new THREE.Group();
    const pole = cyl(.014, .014, 1.2, M.fabric('#6a6a6a'), 0, .5, 0, 8); g.add(pole);
    const plate = box(.3, .16, .012, M.fabric('#8a8a82'), 0, 1.15, 0);
    plate.rotation.y = .2; g.add(plate);
    const txt = box(.22, .05, .014, M.fabric('#181818'), 0, 1.18, .004);
    txt.rotation.y = .2; g.add(txt);
    const txt2 = box(.1, .04, .014, M.fabric('#181818'), .03, 1.11, .004); txt2.rotation.y = .2; g.add(txt2);
    const rust = sph(.05, M.chip(0x8a4a1e), -.1, 1.1, .01);
    rust.scale.z = .06; rust.castShadow = false; g.add(rust);
    /* held by right hand */
    g.position.set(.06, 0, .06);
    return row([g], 'handR');
  };

  B.coffinBack = chr => {
    const semi = chr.scaleAll;
    const g = new THREE.Group();
    const mat = M.fabric('#241a12');
    const box1 = cyl(.13, .15, .5, mat, 0, -.28, -.18, 10);
    box1.rotation.x = Math.PI / 2 + .25; g.add(box1);
    const box2 = cyl(.10, .13, .45, mat, 0, -.55, -.34, 10);
    box2.rotation.x = Math.PI / 2 + .45; g.add(box2);
    const seam = box(.03, .5, .015, M.rust(1), 0, -.3, .18); seam.scale.z=1; g.add(seam);
    seam.rotation.x = Math.PI / 2 + .35;
    const cross = box(.02, .12, .012, M.bone(), 0, -.42, .2);
    cross.rotation.x = .35; g.add(cross);
    const cross2 = box(.06, .02, .012, M.bone(), 0, -.39, .2); cross2.rotation.x = .35; g.add(cross2);
    const strap = box(.02, .55, .02, M.fabric('#3a2c1c'), .09, -.2, -.02); g.add(strap);
    const strap2 = box(.02, .55, .02, M.fabric('#3a2c1c'), -.09, -.2, -.02); g.add(strap2);
    return row([g], 'torso');
  };

  B.throneBag = chr => {
    const g = new THREE.Group();
    const porcelain = M.chip(0xe8e4dc);
    const seat = tor(.12, .03, porcelain, .16, .75, .14);
    seat.rotation.x = Math.PI / 2 - .3; g.add(seat);
    const bowl = sph(.1, porcelain, .16, .65, .18); g.add(bowl);
    const strap = cyl(.006, .006, .5, M.fabric('#3a2c1c'), .1, .9, .15, 6);
    strap.rotation.z = .4; g.add(strap);
    const stainT = sph(.03, M.chip(0x6a5a2a), .16, .7, .13);
    stainT.scale.z = .05; stainT.castShadow = false; g.add(stainT);
    return row([g], 'handR');
  };

  B.umbrellaProp = chr => {
    const g = new THREE.Group();
    const shaft = cyl(.01, .01, 1, M.rust(1), 0, .2, 0, 8); g.add(shaft);
    const canopy = sph(.42, M.fabric('#4a4038', { smooth: true }), 0, .72, 0);
    canopy.scale.y = .5; canopy.rotation.x = .25; g.add(canopy);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      const rib = cyl(.004, .004, .4, M.rust(1), Math.cos(a) * .2, .72, Math.sin(a) * .2, 6);
      rib.rotation.z = Math.cos(a) * 1.2; rib.rotation.x = -Math.sin(a) * 1.2;
      g.add(rib);
    }
    const hook = tor(.04, .008, M.rust(1), .04, -.3, 0); g.add(hook);
    g.position.set(.07, -.05, .04);
    return row([g], 'handR');
  };

  B.flagProp = chr => {
    const g = new THREE.Group();
    const pole = cyl(.012, .012, 1.5, M.fabric('#5a4a32'), 0, .75, 0, 8); g.add(pole);
    const flag = box(.5, .32, .004, M.fabric('#7a1a1a'), .25, 1.3, 0);
    flag.rotation.y = -.15; g.add(flag);
    const emblem = sph(.045, M.bone(), .25, 1.3, .01);
    emblem.scale.z = .06; g.add(emblem);
    const tail = cyl(.04, .01, .2, M.fabric('#7a1a1a'), .5, 1.18, .0, 6);
    tail.rotation.z = .6; g.add(tail);
    g.position.set(.06, -.02, .04);
    return row([g], 'handR');
  };

  B.molotovProp = chr => {
    const g = new THREE.Group();
    g.position.set(.06, -.02, .04);
    /* a fist full of bottles */
    for (let i = 0; i < 4; i++) {
      const bt = new THREE.Group();
      const body = cyl(.032, .032, .12, M.chip(0x3a4a2a), 0, .1, 0, 8); bt.add(body);
      const neck = cyl(.012, .02, .05, M.chip(0x3a4a2a), 0, .18, 0, 8); bt.add(neck);
      const rag = cyl(.02, .008, .07, M.fabric('#d8d0b0'), 0, .23, 0, 6); bt.add(rag);
      const flame = cone(.02, .09, M.emissive(0xff8a2a, 3), 0, .29, 0);
      bt.add(flame); RC._flames = RC._flames || []; RC._flames.push(flame);
      bt.position.set((i - 1.5) * .05, .05 * Math.abs(2 - i), .04 * (i % 2));
      bt.rotation.z = (i - 1.5) * .28;
      g.add(bt);
    }
    /* wilted flowers */
    for (let i = 0; i < 3; i++) {
      const stem = cyl(.004, .004, .2, M.fabric('#3a5a2a'), (i - 1) * .06, .2, -.05, 5);
      stem.rotation.z = RC.rand(-.5, .5); g.add(stem);
      const bloom = sph(.02, M.emissive(0x9a2a5a, .6), (i - 1) * .06 + .04, .3, -.05); g.add(bloom);
    }
    return row([g], 'handR');
  };

  B.foamProp = chr => {
    const g = new THREE.Group();
    const mat = M.latex(0xd9a821);
    const fist = box(.09, .16, .12, mat, 0, .12, 0); g.add(fist);
    const finger = box(.05, .32, .07, mat, 0, .34, .01);
    finger.rotation.x = .2; g.add(finger);
    const nail = box(.045, .03, .075, M.chip(0x8a1a1a), 0, .5, .01); g.add(nail);
    g.position.set(.08, .05, .06);
    return row([g], 'handR');
  };

  B.candelabraProp = chr => {
    const g = new THREE.Group();
    const mat = M.fabric('#9a8a3a', { metal: true });
    const stem = cyl(.012, .02, .5, mat, 0, .25, 0, 8); g.add(stem);
    const bar = box(.4, .015, .015, mat, 0, .5, 0); g.add(bar);
    [-.2, 0, .2].forEach(x => {
      const cup = cyl(.025, .03, .04, mat, x, .52, 0, 8); g.add(cup);
      const plug = cyl(.008, .008, .06, M.fabric('#d8d0a8'), x, .58, 0, 6); g.add(plug);
      const wick = cyl(.002, .002, .01, M.black(.9), x, .615, 0, 4); g.add(wick);
    });
    g.position.set(.07, -.05, .05);
    return row([g], 'handR');
  };

  B.chainsawProp = chr => {
    const g = new THREE.Group();
    const bodyM = M.chip(0xc13a1a);
    const body = box(.16, .2, .12, bodyM, 0, .15, 0); g.add(body);
    const grip = box(.05, .14, .04, M.fabric('#1a1a1a'), .08, .05, 0);
    grip.rotation.z = -.4; g.add(grip);
    const bladeGuide = box(.42, .05, .02, M.wire(0x6a6a62), .3, .17, .02); g.add(bladeGuide);
    for (let i = 0; i < 14; i++) {
      const tooth = cone(.012, .03, M.wire(0x8a8a82), .12 + i * .028, .17 + (i % 2 ? .03 : -.03), .03);
      tooth.rotation.x = i % 2 ? Math.PI : 0;
      tooth.rotation.z = .3;
      g.add(tooth);
    }
    const pull = cyl(.03, .03, .01, M.chip(0xd8d0a8), -.05, .25, .02, 8);
    pull.rotation.x = Math.PI / 2; g.add(pull);
    g.position.set(.06, -.05, .04);
    return row([g], 'handR');
  };

  B.cageVeil = chr => {
    const out = [];
    const g = new THREE.Group();
    const cage = new THREE.Group();
    const ring = tor(.11, .005, M.wire(0x9a9a6a), 0, .22, .09);
    ring.rotation.x = Math.PI / 2; g.add(ring);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      const bar = cyl(.0025, .0025, .12, M.wire(0x9a9a6a), Math.cos(a) * .105, .16, .09 + Math.sin(a) * .105, 4);
      bar.rotation.x = Math.PI / 2 * .5;
      g.add(bar);
    }
    const dome = tor(.105, .003, M.wire(0x9a9a6a), 0, .28, .09);
    dome.rotation.x = 1.3; g.add(dome);
    /* pigeon occupant */
    const bird = new THREE.Group();
    const bm = M.fabric('#4a4a5a');
    const bod = sph(.05, bm, 0, .18, .11); bird.add(bod);
    const hed = sph(.028, bm, 0, .24, .15); bird.add(hed);
    const beak = cone(.008, .03, M.chip(0xc86a2a), 0, .235, .18);
    beak.rotation.x = Math.PI / 2; bird.add(beak);
    const bEyeMat = M.emissive(0xffa02a, 1.4);
    [-1, 1].forEach(sd => { bird.add(sph(.006, bEyeMat, .014 * sd, .25, .155)); });
    for (let i = 0; i < 5; i++) {
      const wingF = box(.03, .012, .004, bm, RC.rand(-.03, .03), .2 + i * .012, .06 - i * .008);
      bird.add(wingF);
    }
    bird.userData.petRat = true; // head-twitch reuse
    RC._pets = RC._pets || []; RC._pets.push(bird);
    g.add(bird);
    out.push([g, 'head']);
    return out;
  };

  /* ==================== wear management ==================== */
  RC.wear = function (chr, catId, itemDef) {
    const slot = catId;
    /* clear old */
    const old = chr.outfitPieces && chr.outfitPieces[slot];
    if (old) old.forEach(([anchor, obj]) => RC.disposeTree(obj));
    chr.outfitPieces = chr.outfitPieces || {};
    chr.outfitPieces[slot] = null;
    if (!itemDef) return;
    const pieces = (B[itemDef.build])(chr, itemDef.p || {}, RC, THREE);
    chr.outfitPieces[slot] = pieces;
    pieces.forEach(([obj, anchorName]) => {
      const a = chr.anchors[anchorName] || chr.anchors.torso;
      a.add(obj);
    });
  };

  RC.clearOutfit = function (chr) {
    if (!chr.outfitPieces) return;
    Object.values(chr.outfitPieces).forEach(list => {
      if (list) list.forEach(([a, o]) => RC.disposeTree(o));
    });
    chr.outfitPieces = {};
  };

  /* animated micro-details referenced globally (flames, flies, bulbs…) */
  RC.tickDetails = function (dt, t) {
    if (RC._flames) RC._flames.forEach((f, i) => {
      f.scale.setScalar(1 + Math.sin(t * 17 + i * 2) * .18);
    });
    if (RC._puffs) RC._puffs.forEach(p => {
      const u = p.userData.floaty;
      p.position.y += Math.sin(t * u.sp + u.ph) * .0008;
      p.position.x += Math.cos(t * u.sp * .7 + u.ph) * .0008;
    });
    if (RC._pets) RC._pets.forEach((p, i) => {
      p.rotation.z = Math.sin(t * 3 + i) * .08;
      p.position.y = p.userData.baseY !== undefined ? p.userData.baseY : (p.userData.baseY = p.position.y);
    });
    if (RC._garland) RC._garland.forEach((m, i) => {
      m.emissiveIntensity = 1.6 + Math.sin(t * (6 + (i % 5)) + i * 1.3) * .9;
    });
    if (RC._swarms) RC._swarms.forEach(f => {
      const s = f.userData.swarm;
      f.position.x = Math.cos(t * s.sp + s.ph) * s.rr;
      f.position.y += Math.sin(t * s.sp * 1.3 + s.ph) * .004;
    });
  };
})();
