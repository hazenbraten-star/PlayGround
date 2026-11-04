import * as THREE from 'three';
import {
  CATEGORIES, THEMES, ITEM_POOLS, OPPONENTS, shuffle, pickOptions,
  scoreItem, scoreOutfit, bestChoice
} from './data.js';

const stage = document.getElementById('stage');
const ui = document.getElementById('ui');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b14);
scene.fog = new THREE.Fog(0x0b0b14, 18, 45);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const spot1 = new THREE.SpotLight(0xffd6ff, 1.4, 40, Math.PI / 5, 0.4);
spot1.position.set(-5, 9, 6); scene.add(spot1);
const spot2 = new THREE.SpotLight(0xcfe9ff, 1.2, 40, Math.PI / 5, 0.4);
spot2.position.set(5, 9, 6); scene.add(spot2);
const rim = new THREE.DirectionalLight(0x6c5ce7, 0.6);
rim.position.set(0, 4, -8); scene.add(rim);

// runway
const runway = new THREE.Mesh(
  new THREE.PlaneGeometry(4.2, 18),
  new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.7, metalness: 0.1 })
);
runway.rotation.x = -Math.PI / 2;
runway.position.y = -0.01;
scene.add(runway);

// runway stripes
for (let i = -8; i <= 8; i += 2) {
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.25 })
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.001, i);
  scene.add(stripe);
}

// curtains backdrop
const back = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 6),
  new THREE.MeshStandardMaterial({ color: 0x2a0f2a, roughness: 0.9 })
);
back.position.set(0, 3, -9);
scene.add(back);

const state = {
  screen: 'menu',
  playerSpecies: 'goblin',
  playerName: 'Du',
  opponents: OPPONENTS.map((name) => ({
    name,
    species: Math.random() < 0.5 ? 'goblin' : 'rat',
    outfit: {},
  })),
  roundsTotal: 5,
  round: 0,
  theme: null,
  options: {},
  playerOutfit: {},
  scores: {},
  roundScores: [],
  selectedCategory: CATEGORIES[0].key,
  previewChar: null,
};

function clearStageChars() {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const o = scene.children[i];
    if (o.userData && o.userData.char) scene.remove(o);
  }
}

function col(outfit, key, fallback) {
  const it = outfit && outfit[key];
  return it ? it.color : fallback;
}

function createCharacter(species, outfit) {
  const g = new THREE.Group();
  g.userData.char = true;
  const skin = species === 'goblin' ? 0x4caf50 : 0x8d6e63;
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.85 });
  const topColor = col(outfit, 'tops', skin);
  const pantsColor = col(outfit, 'pants', skin);
  const socksColor = col(outfit, 'socks', skin);
  const shoesColor = col(outfit, 'shoes', 0x222222);
  const hatColor = col(outfit, 'hats', 0x8b4513);
  const glassesColor = col(outfit, 'glasses', 0x333333);
  const accColor = col(outfit, 'accessories', 0xd4af37);
  const pierColor = col(outfit, 'piercings', 0xc0c0c0);
  const tatColor = col(outfit, 'tattoos', 0x8b0000);

  // torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.42, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.7 })
  );
  torso.position.y = 0.95;
  if (species === 'goblin') torso.rotation.x = 0.18;
  g.add(torso);

  // underwear band (under top? hip)
  const hip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.4, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: col(outfit, 'underwear', 0xffffff), roughness: 0.8 })
  );
  hip.position.y = 0.42;
  g.add(hip);

  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skinMat);
  head.position.y = 1.62;
  if (species === 'goblin') { head.position.z = 0.08; head.scale.set(1.05, 0.9, 1.05); }
  g.add(head);

  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 8), skinMat);
  neck.position.y = 1.42; g.add(neck);

  // arms
  function arm(x) {
    const ua = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.42, 8), skinMat);
    ua.position.set(x, 1.12, 0); g.add(ua);
    const la = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.4, 8), skinMat);
    la.position.set(x, 0.7, 0); g.add(la);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
    hand.position.set(x, 0.48, 0); g.add(hand);
    // tattoo patch
    const tat = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8),
      new THREE.MeshStandardMaterial({ color: tatColor, roughness: 0.9 }));
    tat.position.set(x, 0.9, 0.1); tat.rotation.z = Math.PI / 2; g.add(tat);
  }
  arm(-0.46); arm(0.46);

  // legs
  function leg(x) {
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.135, 0.48, 8),
      new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 }));
    thigh.position.set(x, 0.42, 0); // will adjust below
    // Actually hip at 0.42? fix positions
    g.add(thigh);
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.8 }));
    calf.position.set(x, -0.06, 0); g.add(calf);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28),
      new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.6 }));
    foot.position.set(x, -0.32, 0.06); g.add(foot);
  }
  // correct leg vertical positions: hip top ~0.52
  // redo with proper positions by removing above? We'll just adjust: reposition is fine but meshes already added.
  // Fix: move whole leg group? Simpler: set positions again via traverse? Instead, modify function to use correct y.
  // We'll clear and re-add legs correctly:
  // Remove last 6 meshes (2 legs * 3)
  for (let i = 0; i < 6; i++) g.remove(g.children[g.children.length - 1]);

  function leg2(x) {
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.135, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 }));
    thigh.position.set(x, 0.22, 0); g.add(thigh);
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.48, 8),
      new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.8 }));
    calf.position.set(x, -0.26, 0); g.add(calf);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28),
      new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.6 }));
    foot.position.set(x, -0.54, 0.06); g.add(foot);
  }
  leg2(-0.16); leg2(0.16);

  // species features
  if (species === 'goblin') {
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), skinMat);
      ear.position.set(sx * 0.3, 1.82, 0);
      ear.rotation.z = sx > 0 ? -0.6 : 0.6;
      g.add(ear);
    }
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), skinMat);
    nose.position.set(0, 1.58, 0.32);
    nose.rotation.x = Math.PI / 2;
    g.add(nose);
  } else {
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), skinMat);
      ear.scale.set(1, 0.6, 1);
      ear.position.set(sx * 0.28, 1.85, 0);
      g.add(ear);
    }
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.25, 12), skinMat);
    snout.position.set(0, 1.55, 0.3);
    snout.rotation.x = Math.PI / 2;
    g.add(snout);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.4, -0.4),
      new THREE.Vector3(0, 0.2, -0.8),
      new THREE.Vector3(0, 0.4, -1.2),
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.05, 8, false), skinMat);
    g.add(tail);
  }

  // hat
  if (outfit && outfit.hats) {
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.7 }));
    hat.position.y = 1.92; g.add(hat);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.7 }));
    brim.position.y = 1.86; g.add(brim);
  }

  // glasses
  if (outfit && outfit.glasses) {
    const matG = new THREE.MeshStandardMaterial({ color: glassesColor, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.7 });
    for (const sx of [-0.12, 0.12]) {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 12), matG);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(sx, 1.66, 0.28);
      g.add(lens);
    }
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8),
      new THREE.MeshStandardMaterial({ color: glassesColor, roughness: 0.3 }));
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 1.66, 0.28);
    g.add(bridge);
  }

  // accessories (necklace)
  if (outfit && outfit.accessories) {
    const acc = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 24),
      new THREE.MeshStandardMaterial({ color: accColor, metalness: 0.6, roughness: 0.3 }));
    acc.position.y = 1.38;
    acc.rotation.x = Math.PI / 2;
    g.add(acc);
  }

  // piercings
  if (outfit && outfit.piercings) {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8),
      new THREE.MeshStandardMaterial({ color: pierColor, metalness: 0.5, roughness: 0.2 }));
    stud.position.set(0.0, 1.58, 0.46);
    g.add(stud);
  }

  return g;
}

function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }

function tween(duration, update) {
  return new Promise((resolve) => {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      update(eased, t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

async function animateWalk(char, zFrom, zTo, duration) {
  await tween(duration, (eased) => {
    char.position.z = zFrom + (zTo - zFrom) * eased;
    char.position.y = Math.sin(eased * Math.PI * 6) * 0.04;
  });
  char.position.y = 0;
}

async function animateExit(char, duration) {
  const startX = char.position.x;
  await tween(duration, (eased) => {
    char.position.x = startX + eased * 2.8;
    char.position.z += 0.008;
    char.rotation.y = eased * 1.2;
  });
}

async function runRunwaySequence() {
  const candidates = [
    { name: state.playerName, species: state.playerSpecies, outfit: state.playerOutfit, isPlayer: true },
    ...state.opponents.map((o) => ({ name: o.name, species: o.species, outfit: o.outfit, isPlayer: false })),
  ];
  for (const cand of candidates) {
    const char = createCharacter(cand.species, cand.outfit);
    char.position.set(0, 0, -7);
    scene.add(char);
    // label via hud
    const hud = document.querySelector('.hud .chip:last-child');
    if (hud) hud.textContent = cand.name;
    await animateWalk(char, -7, 0, 2200);
    await wait(1000);
    await animateExit(char, 1400);
    scene.remove(char);
    await wait(300);
  }
  finishRoundScoring();
}

function setCamera(mode) {
  if (mode === 'preview') {
    camera.position.set(0, 1.6, 4.2);
    camera.lookAt(0, 1.2, 0);
  } else {
    camera.position.set(0, 3.2, 11);
    camera.lookAt(0, 1.2, 0);
  }
}

function showMenu() {
  state.screen = 'menu';
  setCamera('preview');
  clearStageChars();
  state.previewChar = null;
  ui.innerHTML = `
    <div class="overlay"><div class="card center">
      <div class="title">Fashion Arena 3D</div>
      <div class="subtitle">Goblin oder Rattenmensch? Laufsteg. Jury. Punkte.</div>
      <div class="menu-btns">
        <button id="startBtn" aria-label="Start">Spiel starten</button>
      </div>
      <div style="opacity:.5;font-size:12px;margin-top:8px">Wähle aus 5 Vorschlägen pro Kategorie. 5 Runden.</div>
    </div></div>`;
  document.getElementById('startBtn').onclick = () => showCreate();
}

function showCreate() {
  state.screen = 'create';
  setCamera('preview');
  clearStageChars();
  state.previewChar = createCharacter(state.playerSpecies, {});
  state.previewChar.position.set(0, 0, 0);
  scene.add(state.previewChar);

  ui.innerHTML = `
    <div class="overlay"><div class="card center" style="max-width:520px">
      <div class="title" style="font-size:28px">Charakter erstellen</div>
      <input id="nameInput" placeholder="Dein Name" value="${state.playerName}" style="padding:10px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;width:100%">
      <div style="display:flex;gap:12px;width:100%;justify-content:center;margin-top:8px">
        <div class="option ${state.playerSpecies === 'goblin' ? 'selected' : ''}" id="gobCard" style="flex:1;text-align:center">
          <div style="font-size:40px">👹</div><div>Goblin</div>
        </div>
        <div class="option ${state.playerSpecies === 'rat' ? 'selected' : ''}" id="ratCard" style="flex:1;text-align:center">
          <div style="font-size:40px">🐀</div><div>Rattenmensch</div>
        </div>
      </div>
      <button id="confirmCreate" style="margin-top:12px">Bestätigen</button>
    </div></div>`;
  document.getElementById('gobCard').onclick = () => { state.playerSpecies = 'goblin'; showCreate(); };
  document.getElementById('ratCard').onclick = () => { state.playerSpecies = 'rat'; showCreate(); };
  document.getElementById('confirmCreate').onclick = () => {
    state.playerName = document.getElementById('nameInput').value || 'Du';
    state.scores = { player: 0 };
    for (const o of state.opponents) state.scores[o.name] = 0;
    state.round = 0;
    state.roundScores = [];
    for (const o of state.opponents) {
      o.species = Math.random() < 0.5 ? 'goblin' : 'rat';
    }
    startRound();
  };
}

function startRound() {
  state.round++;
  state.theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  state.options = {};
  for (const c of CATEGORIES) state.options[c.key] = pickOptions(ITEM_POOLS[c.key], 5);
  state.playerOutfit = {};
  for (const c of CATEGORIES) state.playerOutfit[c.key] = state.options[c.key][0];
  for (const opp of state.opponents) {
    opp.outfit = {};
    for (const c of CATEGORIES) {
      opp.outfit[c.key] = bestChoice(state.theme, state.options[c.key]);
    }
  }
  state.selectedCategory = CATEGORIES[0].key;
  showDressing();
}

function updatePreviewOutfit() {
  if (state.previewChar) { scene.remove(state.previewChar); state.previewChar = null; }
  state.previewChar = createCharacter(state.playerSpecies, state.playerOutfit);
  state.previewChar.position.set(0, 0, 0);
  scene.add(state.previewChar);
}

function showDressing() {
  state.screen = 'dressing';
  setCamera('preview');
  clearStageChars();
  state.previewChar = null;
  updatePreviewOutfit();
  renderDressing();
}

function renderDressing() {
  const opts = state.options[state.selectedCategory];
  const selectedId = state.playerOutfit[state.selectedCategory]?.id;
  ui.innerHTML = `
    <div class="overlay" style="align-items:flex-start;padding-top:16px">
      <div class="card dressing">
        <div class="round-info">
          <div>Runde ${state.round} / ${state.roundsTotal}</div>
          <div class="theme">${state.theme.title}</div>
        </div>
        <div class="categories">
          ${CATEGORIES.map((c) => `<button class="cat-btn ${c.key === state.selectedCategory ? 'active' : ''}" data-cat="${c.key}">${c.label}</button>`).join('')}
        </div>
        <div class="options">
          ${opts.map((o) => `
            <div class="option ${o.id === selectedId ? 'selected' : ''}" data-opt="${o.id}">
              <span class="swatch" style="background:${o.color}"></span>${o.name}
            </div>`).join('')}
        </div>
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="opacity:.7;font-size:13px">Gewählt: ${Object.keys(state.playerOutfit).length}/${CATEGORIES.length}</div>
          <button id="runwayBtn">Auf den Laufsteg</button>
        </div>
      </div>
    </div>`;
  document.querySelectorAll('.cat-btn').forEach((b) => {
    b.onclick = () => { state.selectedCategory = b.dataset.cat; renderDressing(); };
  });
  document.querySelectorAll('.option').forEach((el) => {
    el.onclick = () => {
      const id = el.dataset.opt;
      const opt = opts.find((o) => o.id === id);
      state.playerOutfit[state.selectedCategory] = opt;
      renderDressing();
      updatePreviewOutfit();
    };
  });
  document.getElementById('runwayBtn').onclick = () => startRunway();
}

async function startRunway() {
  state.screen = 'runway';
  setCamera('runway');
  if (state.previewChar) { scene.remove(state.previewChar); state.previewChar = null; }
  clearStageChars();
  ui.innerHTML = `<div class="hud"><div class="chip">Thema: ${state.theme.title}</div><div class="chip">Laufsteg...</div></div>`;
  await runRunwaySequence();
}

function finishRoundScoring() {
  const theme = state.theme;
  const playerScore = scoreOutfit(theme, state.playerOutfit);
  const oppScores = state.opponents.map((o) => ({ name: o.name, score: scoreOutfit(theme, o.outfit) }));
  state.roundScores.push({ theme, player: playerScore, opponents: oppScores });
  state.scores.player += playerScore;
  for (const o of oppScores) state.scores[o.name] += o.score;
  showScores(playerScore, oppScores);
}

function showScores(playerScore, oppScores) {
  state.screen = 'scores';
  setCamera('runway');
  const rows = [
    { name: state.playerName, score: playerScore, total: state.scores.player, isPlayer: true },
    ...oppScores.map((o) => ({ name: o.name, score: o.score, total: state.scores[o.name], isPlayer: false })),
  ];
  ui.innerHTML = `
    <div class="overlay"><div class="card scoreboard">
      <div class="title" style="font-size:24px">Jurywertung – Runde ${state.round}</div>
      <div style="opacity:.7;margin-bottom:8px">${state.theme.title}</div>
      ${rows.map((r) => `<div class="score-row"><span>${r.isPlayer ? '⭐ ' : ''}${r.name}</span><span>${r.score} Pkt (Gesamt ${r.total})</span></div>`).join('')}
      <div style="margin-top:12px;text-align:center"><button id="nextBtn">${state.round >= state.roundsTotal ? 'Zum Finale' : 'Nächste Runde'}</button></div>
    </div></div>`;
  document.getElementById('nextBtn').onclick = () => {
    if (state.round >= state.roundsTotal) showFinal();
    else startRound();
  };
}

function showFinal() {
  state.screen = 'final';
  setCamera('preview');
  clearStageChars();
  const ranking = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
  const winner = ranking[0][0];
  ui.innerHTML = `
    <div class="overlay"><div class="card center">
      <div class="title">Fashion Arena – Ergebnis</div>
      <div class="winner">🏆 ${winner} gewinnt!</div>
      <div class="scoreboard" style="margin-top:12px;width:100%">
        ${ranking.map(([n, s], i) => `<div class="score-row"><span>${i + 1}. ${n}</span><span>${s} Pkt</span></div>`).join('')}
      </div>
      <div class="menu-btns" style="margin-top:12px">
        <button id="replayBtn">Nochmal spielen</button>
      </div>
    </div></div>`;
  document.getElementById('replayBtn').onclick = () => {
    state.scores = {};
    showMenu();
  };
}

// animation loop
function animate() {
  requestAnimationFrame(animate);
  if (state.previewChar) state.previewChar.rotation.y += 0.012;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// start
showMenu();