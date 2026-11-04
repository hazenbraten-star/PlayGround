/* ================= main.js — boot, cameras, audio, game loop ========== */
(function () {
  const RC = window.RC, THREE = window.THREE, UI = RC.ui;
  const M = RC.materials;
  if (!window.THREE) { UI.err('three.js failed to load'); return; }

  /* ------------------------------------------------ renderer & scene */
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050507);
  const camera = new THREE.PerspectiveCamera(52, 1, .1, 120);
  window.__cam = camera; window.__scene = scene;   // debug access
  camera.position.set(0, 2.4, 6);
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ------------------------------------------------ world */
  const W = RC.buildWorld(scene);
  window.__worldRef = W;

  /* STEP 2: character creation lab — studio set, orbit camera, morphs */
  RC.Creator.init(scene, () => startFromCreator(), mode => Cam.set(mode));

  /* jury rats: built & seated behind desk */
  const juryRats = RC.JURY.map((juror, i) => {
    const cfg = RC.randomCreatorConfig();
    cfg.hairStyle = i === 0 ? 'mohawk' : i === 1 ? 'pigtails' : 'bald';
    cfg.gender = ['male', 'female', 'male'][i];
    const chr = RC.buildCharacter(cfg);
    RC.buildRat.seated(chr);
    chr.group.scale.setScalar(.92);
    const seat = W.jurySeats[i];
    chr.group.position.set(seat.x, seat.y, seat.z);
    chr.group.rotation.y = Math.PI; // face the runway (-z)
    scene.add(chr.group);
    return { juror, chr };
  });

  /* ------------------------------------------------ audio: crude synth */
  const Audio = (function () {
    let ctx = null;
    const on = () => !!ctx;
    function boot() {
      if (ctx) return;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    function noise(dur, gainV, filterHz, decay) {
      if (!ctx) return;
      const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay || 1);
      const src = ctx.createBufferSource(); src.buffer = b;
      const g = ctx.createGain(); g.gain.value = gainV;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filterHz || 900; f.Q.value = .6;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start();
    }
    function tone(freq, dur, type, gainV, slideTo) {
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sawtooth'; o.frequency.value = freq;
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      g.gain.value = gainV || .08;
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur + .05);
    }
    return {
      boot, on,
      stinger: () => { tone(160, .8, 'sawtooth', .07, 55); tone(161.7, .8, 'square', .04, 55.4); noise(.5, .05, 300, 2); },
      shutter: () => { noise(.07, .5, 3200, 2); noise(.05, .3, 900, 2); },
      cheer: () => { noise(1.4, .22, 700, 1.2); noise(1.2, .18, 1400, 1.4); },
      boo: () => { tone(90, 1.1, 'sawtooth', .05, 41); noise(.9, .12, 240, 1.4); },
      click: () => { noise(.04, .25, 2400, 2); },
      thud: () => { tone(70, .24, 'sine', .2, 38); noise(.12, .25, 180, 2); },
      buzz: () => { tone(55, .6, 'sawtooth', .028, 55); tone(110, .6, 'sine', .02, 108); },
    };
  })();

  /* ------------------------------------------------ camera director */
  const Cam = {
    mode: 'title', subject: null, shake: 0,
    desired: new THREE.Vector3(),
    look: new THREE.Vector3(),
    titleA: 0,
    update(dt, t) {
      const subj = this.subject;
      switch (this.mode) {
        case 'title':
          this.titleA += dt * .12;
          this.desired.set(Math.sin(this.titleA) * 7, 2.6 + Math.sin(t * .3), -2 + Math.cos(this.titleA) * 5);
          this.look.set(0, 1.6, -2);
          break;
        case 'announce':
          this.desired.set(0, 2.8, 7.5);
          this.look.set(0, 1.2, -4);
          break;
        case 'dress': {
          if (!subj) break;
          const p = subj.group.position;
          this.desired.set(p.x + Math.sin(t * .22) * 2.1, 1.55, p.z + 2.6 + Math.cos(t * .22) * .9);
          this.look.set(p.x, 1.25, p.z + .2);
          break;
        }
        case 'walk': {
          if (!subj) break;
          const p = subj.group.position;
          const wob = Math.sin(t * 1.7) * .25;
          this.desired.set(p.x + 1.15 + wob, 1.45, RC.lerp(p.z + 4.6, 9.2, RC.clamp((p.z + 11) / 19, 0, .55)));
          this.look.set(p.x * .7, 1.28, p.z + .5);
          break;
        }
        case 'pose': {
          if (!subj) break;
          const p = subj.group.position;
          this.poseT = (this.poseT || 0) + dt;
          const push = RC.clamp(this.poseT * .12, 0, 1);
          this.desired.set(p.x + 1.0 - push * 1.6, 1.35 - push * .25, p.z + 3.4 - push * 1.1);
          this.look.set(p.x * .5, 1.32, p.z + .3);
          break;
        }
        case 'jury':
          this.desired.set(1.8, 2.2, 9.6);
          this.look.set(.4, 1.55, 12.6);
          break;
        case 'finale': {
          if (!subj) break;
          this.finaleA = (this.finaleA || 0) + dt * .35;
          const p = subj.group.position;
          this.desired.set(p.x + Math.sin(this.finaleA) * 3.2, 2.1, p.z + 3.4 + Math.cos(this.finaleA) * 2.2);
          this.look.set(p.x, 1.5, p.z);
          break;
        }
        case 'creator': {
          /* casting-lab orbit: full control by RC.Creator, smooth-lerped */
          const o = RC.Creator.orbit, tp = o.target;
          const cp = Math.cos(o.phi), sp = Math.sin(o.phi);
          this.desired.set(
            tp.x + o.dist * cp * Math.sin(o.theta),
            tp.y + Math.max(.2, o.dist * sp + .3),
            tp.z + o.dist * cp * Math.cos(o.theta)
          );
          this.look.copy(tp);
          break;
        }
      }
      const k = 1 - Math.exp(-dt * 3.2);
      camera.position.lerp(this.desired, k);
      camera.lookAt(this.look);
      if (this.shake > 0) {
        this.shake -= dt;
        camera.position.x += (Math.random() - .5) * .05;
        camera.position.y += (Math.random() - .5) * .05;
      }
    },
    set(mode, subject) {
      if (this.mode === 'pose' && mode !== 'pose') this.poseT = 0;
      this.mode = mode; this.subject = subject || null;
      window.__camMode = mode;
      if (mode === 'pose') this.poseT = 0;
      if (mode === 'finale') this.finaleA = 0;
    },
    kick(s) { this.shake = s; }
  };

  /* ------------------------------------------------ contestants */
  function makeContestant(isPlayer, name) {
    /* player: exact creation-lab character; AI: own random freak */
    const cfg = isPlayer && RC.PLAYER_CONFIG ? RC.PLAYER_CONFIG : RC.randomCreatorConfig();
    const chr = RC.buildCharacter(cfg);
    scene.add(chr.group);
    return {
      isPlayer, name, chr, score: 0, roundScore: 0, outfitItems: [],
      ai: null,
    };
  }

  /* spots behind the start line */
  function lineupSpot(i) { return { x: -2.4 + i * 1.2, y: .12, z: -14.6 }; }
  let contestants = [];
  function newGame() {
    contestants.forEach(c => { scene.remove(c.chr.group); RC.clearOutfit(c.chr); });
    contestants = [];
    const aiNames = RC.shuffled(RC.RAT_NAMES).slice(0, 4);
    const pName = (RC.PLAYER_CONFIG && RC.PLAYER_CONFIG.name) || RC.PLAYER_NAMES[RC.ri(0, RC.PLAYER_NAMES.length - 1)];
    const player = makeContestant(true, pName);
    contestants.push(player);
    aiNames.forEach(n => contestants.push(makeContestant(false, n)));
    contestants.forEach((c, i) => {
      const s = lineupSpot(i);
      c.chr.group.position.set(s.x, s.y, s.z);
      c.chr.group.rotation.y = 0;
      c.chr.anim.mode = 'idle';
    });
    return player;
  }

  /* ------------------------------------------------ lighting fx */
  function spotlightOn(chr) {
    if (!chr || !chr.group) { UI.err('spotlightOn bad arg ' + JSON.stringify(chr && Object.keys(chr))); return; }
    const p = chr.group.position;
    W.keyTarget.position.set(p.x, 1.2, p.z);
    W.key.position.set(p.x, 10.5, p.z + 4.5);
  }
  function flashBurst(atPos, big) {
    UI.flash();
    Audio.shutter();
    const l = new THREE.PointLight(0xffffff, big ? 9 : 5.5, 12);
    l.position.copy(atPos); l.position.y += .4;
    scene.add(l);
    RC.Tweens.add({
      dur: .38, ease: x => x,
      onUpdate: k => { l.intensity = (big ? 9 : 5.5) * (1 - k); },
      resolve: () => scene.remove(l),
    });
    Cam.kick(.22);
    /* the crowd goes feral with phone flashes */
    for (let i = 0; i < (big ? 10 : 5); i++) {
      RC.wait(RC.rand(.05, .8)).then(() => {
        if (!W.crowd.length) return;
        const c = RC.pick(W.crowd);
        const fl = new THREE.PointLight(0xeef4ff, 3, 6);
        fl.position.copy(c.position); fl.position.y += 1.1;
        scene.add(fl);
        RC.Tweens.add({
          dur: .22, ease: x => x,
          onUpdate: k => fl.intensity = 3 * (1 - k),
          resolve: () => scene.remove(fl),
        });
      });
    }
  }

  /* crown + confetti for the finale */
  function dressCrown(chr) {
    const g = new THREE.Group();
    const gold = M.chip(0xd8a832); 
    const band = new THREE.Mesh(new THREE.TorusGeometry(.15, .022, 8, 16), gold);
    band.rotation.x = Math.PI / 2; g.add(band);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(.012, .05, 6), gold);
      sp.position.set(Math.cos(a) * .15, .03, Math.sin(a) * .15);
      g.add(sp);
    }
    const gem = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), M.emissive(0x9dff2a, 3));
    gem.position.set(0, .04, .15); g.add(gem);
    g.position.set(chr.bones.head.position.x, 1.2, 0);
    g.position.set(0, 1.6, 0);
    chr.anchors.head.add(g);
    g.position.set(0, 2.2, 0);
    RC.Tweens.add({
      dur: 1.3, onUpdate: k => {
        g.position.y = RC.lerp(2.2, .28, k);
        g.rotation.z = (1 - k) * 1.2;
      },
    }).then(() => { Audio.thud(); Cam.kick(.3); });
    /* flies + raw glitz rain of can tab confetti */
    for (let i = 0; i < 40; i++) {
      const conf = new THREE.Mesh(
        new THREE.BoxGeometry(.015, .004, .03),
        RC.pick([M.chip(0x9dff2a), M.chip(0xff2a6d), M.chip(0xe8dcc0), M.chip(0x2af5ff)])
      );
      conf.position.set(chr.group.position.x + RC.rand(-2, 2), RC.rand(5, 9), chr.group.position.z + RC.rand(-2, 2));
      scene.add(conf);
      const spin = RC.rand(2, 7), sway = RC.rand(1, 3);
      RC.Tweens.add({
        dur: RC.rand(2.5, 5.5), ease: x => x,
        onUpdate: (k, dtless) => {
          conf.position.y -= .016;
          conf.position.x += Math.sin(k * sway * 6) * .004;
          conf.rotation.x += spin * .016; conf.rotation.z += spin * .011;
        },
        resolve: () => scene.remove(conf),
      });
    }
  }

  /* ------------------------------------------------ the game */
  let player = null;
  let busy = true;
  const ROUNDS = 5;

  const btnSendDummy = document.getElementById('btnSend');
  /* STEP 2: title buttons route to the character creation lab */
  document.getElementById('btnRestyle').onclick = () => {
    Audio.boot(); Audio.click();
    RC.Creator.open({ freak: true });
  };
  function updatePlayerName() {
    const nm = contestants.find(c => c.isPlayer);
    UI.setName(nm ? nm.name : '…');
  }
  /* creator confirm: the freshly built freak walks the runway */
  function startFromCreator() {
    Audio.stinger();
    if (player) {
      scene.remove(player.chr.group);
      player.chr = RC.buildCharacter(RC.PLAYER_CONFIG);
      player.chr.group.position.set(0, .12, -2);
      player.chr.anim.mode = 'idle';
      scene.add(player.chr.group);
      player.name = RC.PLAYER_CONFIG.name;
    }
    UI.setName(RC.PLAYER_CONFIG.name);
    runMatch();
  }

  document.getElementById('btnStart').onclick = () => {
    Audio.boot();
    Audio.click();
    RC.Creator.open();
  };
  document.getElementById('btnNext').onclick = () => {
    Audio.click();
    UI.hideRoundBoard();
    _resolveRoundBoard && _resolveRoundBoard();
  };
  document.getElementById('btnAgain').onclick = () => {
    Audio.stinger();
    UI.finaleHide();
    UI.scoreboard([]);
    RC.Creator.open();   // back to the casting lab for a new freak
  };
  let _resolveRoundBoard = null;
  function awaitRoundBoard() {
    return new Promise(res => { _resolveRoundBoard = res; });
  }

  /* skip: space or tap on the tip */
  function doSkip(e) {
    RC.Tweens.finishAll();
    Audio.click();
  }
  addEventListener('keydown', e => { if (e.code === 'Space') doSkip(e); });
  document.getElementById('skipTip').onclick = doSkip;

  /* ---- walker positioning helpers ---- */
  const RUNWAY_Z0 = -12.4;   // start line (backstage door)
  const POSE_Z = 8.2;        // pose spot in front of jury
  const OFF_X = 4.4, OFF_Z = 10.6;

  async function walkIn(chr, from, to, dur) {
    RC.resetRatPose(chr);
    chr.anim.mode = 'walk'; chr.anim.speed = .75;
    chr.group.position.set(from.x, from.y, from.z);
    const fx = from.x, fz = from.z;
    await RC.Tweens.add({
      dur,
      onUpdate: k => { chr.group.position.set(fx, from.y, RC.lerp(fz, to.z, k)); },
    });
  }
  async function walkOut(chr, target, dur) {
    RC.resetRatPose(chr);
    chr.anim.mode = 'walk'; chr.anim.speed = .9;
    const fx = chr.group.position.x, fz = chr.group.position.z;
    await RC.Tweens.add({
      dur,
      onUpdate: k => { chr.group.position.set(RC.lerp(fx, target.x, k), target.y, RC.lerp(fz, target.z, k)); },
    });
  }
  function parkContestants(list) {
    list.forEach((c, i) => {
      const s = lineupSpot(i);
      c.chr.group.position.set(s.x, s.y, s.z);
      RC.resetRatPose(c.chr);
      c.chr.anim.mode = 'idle';
      c.chr.anim.speed = 0;
      c.chr.group.visible = true;
    });
  }

  async function dressPhase(cats, playerC) {
    const pc = playerC.chr;
    RC.resetRatPose(pc);
    pc.group.rotation.y = 0;
    pc.group.position.set(0, .12, -2.5);
    pc.group.visible = true;
    pc.anim.mode = 'idle';
    spotlightOn(playerC);
    Cam.set('dress', playerC.chr);
    UI.outfitTags([]);
    return new Promise(res => {
      UI.openDresser(cats, (catId, itemOrRandom) => {
        if (!catId && itemOrRandom === true) {
          cats.forEach(c => RC.wear(pc, c.id, UI.picks[c.id]));
        } else if (catId) {
          RC.wear(pc, catId, itemOrRandom);
          UI.outfitTags(Object.values(UI.picks).filter(Boolean));
        }
      }, picks => {
        UI.closeDresser();
        cats.forEach(c => RC.wear(pc, c.id, picks[c.id]));
        UI.outfitTags(Object.values(picks));
        res(picks);
      });
    });
  }

  async function judgeContestant(c, theme) {
    const marks = RC.JURY.map(j => RC.judgeOutfit(c.outfitItems, theme, j));
    const totalMarks = marks.reduce((a, b) => a + b, 0) / marks.length;
    c.roundScore = totalMarks * 2;   // scale to 20 per round
    return { marks, totalMarks };
  }

  async function showtimeRound(theme) {
    const order = RC.shuffled(contestants);
    for (const c of order) {
      RC.resetRatPose(c.chr);
      spotlightOn(c);
      Cam.set('walk', c.chr);
      UI.banner('NOW STALKING THE RUNWAY', c.name, c.isPlayer ? '(THAT IS YOUR PATHETIC SELF)' : RC.pick(['fresh from the bin', 'greased and trembling', 'uncertain of itself', 'here for chaos, stays for the flies', 'professionally filthy']));
      c.chr.anim.mode = 'idle';
      await RC.wait(.85);
      await walkIn(c.chr, { x: 0, y: .12, z: RUNWAY_Z0 }, { z: POSE_Z }, 3.4);
      /* pose + paparazzi */
      Cam.set('pose', c.chr);
      RC.resetRatPose(c.chr);
      c.chr.anim.mode = 'pose';
      c.chr.anim.speed = 0;
      await RC.wait(.85);
      flashBurst(c.chr.group.position, true);
      Cam.kick(.15);
      await RC.wait(1.15);
      /* jury verdicts */
      Cam.set('jury');
      const { marks, totalMarks } = await judgeContestant(c, theme);
      for (let j = 0; j < RC.JURY.length; j++) {
        const jry = RC.JURY[j];
        UI.quote(jry.name, jry.role, marks[j], RC.jurorLine(jry, marks[j]));
        /* speaking bob */
        const jr = juryRats[j];
        Audio.buzz();
        RC.Tweens.add({
          dur: .5, onUpdate: k => {
            jr.chr.refs.upR.rotation.x = -2.2 + Math.sin(k * Math.PI) * .4;
            jr.chr.refs.elR.rotation.x = -1.1;
          },
        });
        await RC.wait(2.0);
      }
      UI.quoteHide();
      c.score += c.roundScore;
      c._lastRoundScore = c.roundScore;
      UI.scoreboard(sortedStandings());
      UI.outfitTags(c.outfitItems);
      (marks[0] + marks[1] + marks[2] > 16.5 ? Audio.cheer : Audio.boo)();
      await RC.wait(1.1);
      /* exit stage right */
      Cam.set('walk', c.chr);
      RC.resetRatPose(c.chr);
      c.chr.anim.mode = 'walk';
      await walkOut(c.chr, { x: OFF_X, y: .12, z: OFF_Z }, 1.6);
      c.chr.group.visible = false;
      await RC.wait(.35);
      UI.outfitTags([]);
    }
  }

  function sortedStandings() {
    return contestants.slice().sort((a, b) => b.score - a.score);
  }

  /* ------------------------------------------------ match runner */
  async function runMatch() {
    busy = false;
    document.getElementById('skipTip').classList.remove('hidden');
    startMatch();
  }

  async function startMatch() {
    if (busy) return;
    busy = true;
    try {
      /* reset everything */
      contestants.forEach(c => { c.score = 0; });
      newGameKeepPlayer();
      const themes = RC.shuffled(RC.THEMES).slice(0, ROUNDS);
      Cam.set('title');
      await RC.wait(1.0);
      for (let r = 0; r < themes.length; r++) {
        const theme = themes[r];
        UI.letterbox(true);
        Cam.set('announce');
        Audio.stinger();
        UI.roundInfo(r + 1, ROUNDS, theme.name, theme.sub);
        UI.banner(`ROUND ${r + 1} — THE THEME IS`, theme.name, '"' + theme.sub + '"');
        await RC.wait(2.4);
        /* jury announcer */
        Cam.set('jury');
        const jr0 = RC.JURY.find(j => theme.quote[0].includes(j.name.split(' ')[0])) || RC.JURY[0];
        UI.quote(jr0.name, jr0.role + ' / RINGMASTER', null, theme.quote[1]);
        Audio.buzz();
        await RC.wait(2.2);
        UI.quoteHide();
        UI.letterbox(false);

        /* pick the 5 random categories */
        const cats = RC.shuffled(RC.CATEGORIES).slice(0, 5);
        const playerC = contestants.find(c => c.isPlayer);
        /* AI already scheming (fire async) */
        const usedItems = new Set();
        const aiPicks = contestants.filter(c => !c.isPlayer)
          .map(c => RC.aiPickOutfit(cats, theme, usedItems));

        UI.banner('BACKSTAGE', 'DRESS YOUR VERMIN', 'one item per category. choose wisely. or filthily.');
        const picks = await dressPhase(cats, playerC);

        /* apply AI outfits */
        const ais = contestants.filter(c => !c.isPlayer);
        ais.forEach((c, i) => {
          c.outfitItems = cats.map(cat => aiPicks[i][cat.id]);
          cats.forEach(cat => RC.wear(c.chr, cat.id, aiPicks[i][cat.id]));
        });
        playerC.outfitItems = cats.map(k => picks[k]);

        /* showtime */
        parkContestants(contestants);
        await showtimeRound(theme);

        /* standings board */
        Cam.set('title');
        UI.bannerHide();
        UI.letterbox(false);
        const standings = sortedStandings();
        UI.showRoundBoard(`AFTER ROUND ${r + 1}`, standings.map(p => ({
          name: p.name, score: p.score, isPlayer: p.isPlayer, roundScore: p._lastRoundScore
        })), r === themes.length - 1);
        await awaitRoundBoard();
        UI.scoreboard(sortedStandings());
      }
      /* finale */
      const winner = sortedStandings()[0];
      Cam.set('finale', winner.chr);
      winner.chr.group.visible = true;
      RC.resetRatPose(winner.chr);
      winner.chr.group.position.set(0, .12, 6.5);
      winner.chr.anim.mode = 'pose';
      spotlightOn(winner);
      Audio.stinger();
      UI.letterbox(true);
      await RC.wait(1.2);
      dressCrown(winner.chr);
      flashBurst(winner.chr.group.position, true);
      Audio.cheer();
      await RC.wait(2.6);
      UI.letterbox(false);
      busy = false;
      UI.finale(winner, sortedStandings());
      document.getElementById('skipTip').classList.add('hidden');
    } catch (e) {
      UI.err((e.message || e) + ' @ ' + (e.stack || '').split('\n').slice(1, 4).map(s => s.trim().slice(0, 130)).join(' || '));
      busy = false;
    }
  }

  /* keep player character & identity, restage both */
  function newGameKeepPlayer() {
    const oldPlayer = contestants.find(c => c.isPlayer);
    const pName = oldPlayer && oldPlayer.name;
    const pChr = oldPlayer && oldPlayer.chr;
    contestants.forEach(c => { scene.remove(c.chr.group); RC.clearOutfit(c.chr); });
    contestants = [];
    const fresh = makeContestant(true, pName || RC.PLAYER_NAMES[RC.ri(0, RC.PLAYER_NAMES.length - 1)]);
    if (pChr) { fresh.chr = pChr; }
    contestants.push(fresh);
    RC.shuffled(RC.RAT_NAMES).slice(0, 4).forEach(n => contestants.push(makeContestant(false, n)));
    contestants.forEach((c, i) => {
      const s = lineupSpot(i);
      c.chr.group.position.set(s.x, s.y, s.z);
      c.chr.anim.mode = 'idle';
    });
    updatePlayerName();
    UI.scoreboard(contestants.map(c => ({ name: c.name, score: 0, isPlayer: c.isPlayer })));
  }

  /* ai outfit application grouped by category id (crisper than flat) */
  function c_outfit_fix(cats, ais, aiPicks) {
    ais.forEach((c, i) => cats.forEach(cat => RC.wear(c.chr, cat.id, aiPicks[i][cat.id])));
  }
  function _catOf(cats, item) {
    return cats.find(c => c.items.includes(item)) || cats[0];
  }

  /* player name card */
  updatePlayerName();

  /* ------------------------------------------------ main loop */
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    const t = now / 1000;
    RC.Tweens.update(dt);
    W.tick(dt, t);
    RC.tickDetails(dt, t);
    RC.Creator && RC.Creator.tick && RC.Creator.tick(dt, t);
    contestants.forEach(c => RC.animateRat(c.chr, dt));
    juryRats.forEach(j => RC.animateRat(j.chr, dt));
    RC.Creator && RC.Creator.char && RC.animateRat(RC.Creator.char, dt);
    Cam.update(dt, t);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);

  /* player character visible on title screen: give them a came appearance */
  (function preTitleRat() {
    player = makeContestant(true, RC.PLAYER_CONFIG ? RC.PLAYER_CONFIG.name : RC.PLAYER_NAMES[RC.ri(0, RC.PLAYER_NAMES.length - 1)]);
    player.chr.group.position.set(0, .12, -2);
    player.chr.anim.mode = 'idle';
    Cam.set('title', player);
    UI.setName(player.name);
    contestants.push(player);
  })();

  /* deep link (screenshot/debug): #creator jumps straight to the lab */
  if (/creator/.test(location.hash)) { UI.hideTitle(); RC.Creator.open(); }

})();
