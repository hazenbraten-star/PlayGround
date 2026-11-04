/* ================= world.js — the filthy runway venue ==================
   Industrial basement: stained concrete, rusty pillars & pipes, hanging
   wire-cage lamps, flickering neon signage, raised jury booth, rumbling
   crowd of silhouettes, dust motes, runway strip with edge lights.      */
(function () {
  const RC = window.RC, M = RC.materials, T = RC.textures;

  RC.buildWorld = function (scene) {
    const W = { lights: [], flicker: [], crowd: [], bulbs: [] };

    /* everything lives under one root group so screens can toggle the venue */
    const root = W.root = new THREE.Group();
    scene.add(root);

    /* floor */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      M.concrete(14)
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    /* raised runway strip: players walk -z (backstage) to +z (jury) */
    const runway = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, .12, 24),
      M.concreteGloss(6)
    );
    runway.position.set(0, .06, -1);
    runway.receiveShadow = true; runway.castShadow = false;
    root.add(runway);

    const edgeCol = [0xff2a6d, 0x2af5ff];
    [-1, 1].forEach(sd => {
      for (let i = 0; i < 14; i++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(.05, 8, 6),
          M.emissive(edgeCol[(i + (sd < 0 ? 0 : 1)) % 2], 2.4)
        );
        b.position.set(sd * 1.38, .13, -11.5 + i * 1.55);
        root.add(b);
        W.bulbs.push(b);
      }
    });

    /* walls: rusty corrugated panels */
    const wallMat = M.rust(8);
    const dirtyWall = M.concrete(10);
    [[0, 18], [0, -20]].forEach(([x, z]) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(60, 12, .6), dirtyWall);
      wall.position.set(0, 3.5, z + (z > 0 ? 8 : 0));
      wall.receiveShadow = true;
      root.add(wall);
    });
    [-1, 1].forEach(sd => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(.6, 12, 44), M.concrete(12));
      wall.position.set(sd * 14, 3.5, -2);
      wall.receiveShadow = true;
      root.add(wall);
      /* girders */
      for (let i = 0; i < 6; i++) {
        const girder = new THREE.Mesh(new THREE.BoxGeometry(.25, 12, .3), M.rust(4));
        girder.position.set(sd * 13.75, 3.5, -20 + i * 7.4);
        root.add(girder);
      }
    });

    /* rusty pillars along the runway */
    [-1, 1].forEach(sd => {
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(.28, .34, 11, 10), M.rust(3));
        p.position.set(sd * 5.2, 5.5, -12 + i * 7);
        p.castShadow = true;
        root.add(p);
        W.pillars = W.pillars || [];
        /* hanging cage lamps from ceiling */
        const lampG = new THREE.Group();
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, RC.rand(.8, 1.6), 4), M.black(.9));
        cord.position.y = .4; lampG.add(cord);
        const cage = new THREE.Mesh(new THREE.CylinderGeometry(.16, .1, .2, 8, 1, true),
          new THREE.MeshStandardMaterial({ color: 0x2a2018, wireframe: true }));
        cage.position.y = -.05; lampG.add(cage);
        const bulbMat = new THREE.MeshStandardMaterial({
          color: 0x111111, emissive: 0xffc46a, emissiveIntensity: 2.6
        });
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), bulbMat);
        bulb.position.y = -.08; lampG.add(bulb);
        W.bulbMats = W.bulbMats || []; W.bulbMats.push(bulbMat);
        lampG.position.set(RC.rand(-9, 9), 7.4, -14 + i * 6 + RC.rand(-2, 2));
        root.add(lampG);
        W.hanging = W.hanging || [];
        W.hanging.push({ obj: lampG, ph: RC.rand(0, 7) });
      }
    });

    /* ceiling pipes */
    for (let i = 0; i < 5; i++) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(RC.rand(.1, .25), RC.rand(.1, .25), 60, 8),
        M.rust(6)
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.rotation.y = RC.rand(-.06, .06);
      pipe.position.set(0, 9.5 + i * 1.1, -20 + i * 4);
      root.add(pipe);
    }

    /* ---- neon signage on the back wall ---- */
    const signage = new THREE.Group();
    W.signs = [];
    function neonSign(text, color, w, h, pos, rotY, font) {
      const texMat = new THREE.MeshBasicMaterial({
        map: RC.textures.neon(text, color, font),
        transparent: true, side: THREE.DoubleSide, depthWrite: false
      });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, h), texMat);
      sign.position.copy(pos); sign.rotation.y = rotY;
      root.add(sign);
      const glow = new THREE.PointLight(color, 1.4, 14);
      glow.position.copy(pos); glow.position.z += .8;
      root.add(glow);
      W.signs.push({ mat: texMat, light: glow, base: 1.4, ph: RC.rand(0, 9), sp: RC.rand(6, 14) });
      return sign;
    }
    neonSign('RAT COUTURE', 0xff2a6d, 14, 3.5, new THREE.Vector3(0, 8.2, -19.4), 0, 'bold 150px Impact, sans-serif');
    neonSign('THE FILTHY RUNWAY', 0x2af5ff, 11, 2.2, new THREE.Vector3(0, 6.2, -19.2), 0, 'bold 110px Impact, sans-serif');
    neonSign('SOLD OUT', 0x9dff2a, 6, 1.6, new THREE.Vector3(-8.5, 4.4, -19.0), -.15);
    neonSign('NO REFUNDS', 0xffa02a, 6, 1.6, new THREE.Vector3(8.5, 4.4, -19.0), .15);

    /* jury booth at +z end of runway */
    const booth = new THREE.Group();
    const desk = new THREE.Mesh(new THREE.BoxGeometry(7, 1.1, 1.6), M.rust(3));
    desk.position.set(0, .75, 0);
    desk.castShadow = true;
    booth.add(desk);
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(7.3, .1, 1.8), M.black(.4, .5));
    deskTop.position.set(0, 1.32, 0);
    booth.add(deskTop);
    /* plate on the desk front */
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .8),
      new THREE.MeshBasicMaterial({ map: RC.textures.plate('THE JURY / SEWING SECTION 4'), transparent: true, side: THREE.DoubleSide }));
    plate.position.set(0, .82, .81);
    booth.add(plate);
    booth.position.set(0, .12, 13);
    root.add(booth);
    W.booth = booth;

    /* jury lamp (harsh, from above) */
    const juryLamp = new THREE.SpotLight(0xfff2d8, 2.2, 20, .8, .4, 1.2);
    juryLamp.position.set(0, 9, 15.5);
    juryLamp.target = booth;
    root.add(juryLamp); W.lights.push(juryLamp);

    /* jury rats (seated) — meshes added after RC is ready */
    W.jurySeats = [];
    [-1.1, 0, 1.1].forEach((x, i) => {
      W.jurySeats.push({ x, z: 12.35, y: 1.35, yaw: Math.PI }); // behind desk facing -z beyond runway
    });

    /* ---- crowd: silhouette rats in the dark, glowing eyes ---- */
    const eyeGlow = M.emissive(0xffd23a, 2.2, .2);
    for (let i = 0; i < 26; i++) {
      const sd = i % 2 ? -1 : 1;
      const c = new THREE.Group();
      const s = RC.rand(.7, 1.15);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(.08, .25, .04 + Math.random() * .05),
        roughness: .95
      });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(.22 * s, .3 * s, 4, 8), bodyMat);
      body.position.y = .55 * s; body.rotation.x = .2;
      c.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.13 * s, 8, 6), bodyMat);
      head.position.set(0, .92 * s, .02);
      c.add(head);
      const sn = new THREE.Mesh(new THREE.SphereGeometry(.05 * s, 6, 4), bodyMat);
      sn.position.set(0, .9 * s, .12 * s); c.add(sn);
      [-1, 1].forEach(e => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(.018 * s, 6, 4), eyeGlow);
        eye.position.set(.05 * s * e, .94 * s, .13 * s);
        c.add(eye);
      });
      const x = sd * RC.rand(3.4, 12), z = RC.rand(-16, 8);
      c.position.set(x, 0, z);
      c.lookAt(RC.rand(-4, 4), .8, -z * .6);
      c.userData = { bob: RC.rand(0, 7), sp: RC.rand(1.5, 3) };
      root.add(c); W.crowd.push(c);
    }

    /* dust motes */
    const dustCount = 300;
    const dg = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = RC.rand(-14, 14);
      positions[i * 3 + 1] = RC.rand(0, 10);
      positions[i * 3 + 2] = RC.rand(-20, 16);
    }
    dg.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x9a8f7a, size: .04, transparent: true, opacity: .5 });
    const dust = new THREE.Points(dg, dustMat);
    root.add(dust);
    W.dust = dust;

    /* ---- atmospheric lighting ---- */
    scene.fog = new THREE.FogExp2(0x07070a, .028);

    const hemi = new THREE.HemisphereLight(0x3a3f4a, 0x0a0a08, .5);
    root.add(hemi);

    /* runway key light, follows the walker */
    const key = new THREE.SpotLight(0xffe8c8, 3.2, 30, .5, .45, 1);
    key.position.set(0, 10.5, 6);
    root.add(key); W.key = key;
    const keyTarget = new THREE.Object3D();
    root.add(keyTarget);
    key.target = keyTarget; W.keyTarget = keyTarget;

    /* pink + cyan rim wash */
    const rimA = new THREE.SpotLight(0xff2a6d, 2.0, 40, .7, .6, 1.4);
    rimA.position.set(-9, 7, -6);
    root.add(rimA); W.lights.push(rimA);
    W.rimA = rimA;
    const rimB = new THREE.SpotLight(0x2af5ff, 1.6, 40, .7, .6, 1.4);
    rimB.position.set(9, 7, -6);
    root.add(rimB); W.lights.push(rimB);
    W.rimB = rimB;

    /* ---- ANIMATIONS (buzz, flicker, sway, crowd bob, dust) ---- */
    W.tick = function (dt, t) {
      /* neon flicker */
      W.signs.forEach(s => {
        let f = .75 + Math.sin(t * s.sp + s.ph) * .25;
        if (Math.random() < .012) f *= .1 + Math.random() * .4;
        s.mat.opacity = RC.clamp(f, .05, 1);
        s.light.intensity = s.base * RC.clamp(f, .07, 1.2);
      });
      /* hanging lamps swing */
      if (W.hanging) W.hanging.forEach(h => {
        h.obj.rotation.z = Math.sin(t * .7 + h.ph) * .05;
        h.obj.rotation.x = Math.sin(t * .9 + h.ph * 1.3) * .03;
      });
      /* bulbs occasionally die */
      if (W.bulbMats) W.bulbMats.forEach(b => {
        if (Math.random() < dt * .8) b.emissiveIntensity = Math.random() < .5 ? .2 : 2.4 + Math.random();
      });
      /* crowd */
      W.crowd.forEach(c => {
        c.position.y = Math.sin(t * c.userData.sp + c.userData.bob) * .04;
        c.rotation.y = c.baseYaw + Math.sin(t * .6 + c.userData.bob) * .06;
      });
      /* dust drift */
      const pos = W.dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * .12;
        if (y < 0) y = 10;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(t + i) * dt * .05);
      }
      pos.needsUpdate = true;
    };

    /* add human-space seed to each crowd yaw */
    W.crowd.forEach(c => {
      c.baseYaw = c.rotation.y;
      c.userData.baseYaw = c.rotation.y;
    });

    return W;
  };
})();
