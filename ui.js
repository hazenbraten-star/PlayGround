/* ============================================================
   MERGE & FALL — rendering, modals, input, audio, lifecycle
   ============================================================ */
'use strict';

const dom = {
  board: document.getElementById('board'),
  detailBar: document.getElementById('detailBar'),
  buffBar: document.getElementById('buffBar'),
  generators: document.getElementById('generators'),
  genHint: document.getElementById('genHint'),
  chains: document.getElementById('chains'),
  modalLayer: document.getElementById('modalLayer'),
  toastLayer: document.getElementById('toastLayer'),
  intro: document.getElementById('intro'),
  introPortraits: document.getElementById('introPortraits'),
  startBtn: document.getElementById('startBtn'),
  introManualBtn: document.getElementById('introManualBtn'),
  introResetBtn: document.getElementById('introResetBtn'),
  soundBtn: document.getElementById('soundBtn'),
  helpBtn: document.getElementById('helpBtn'),
  mergeAllBtn: document.getElementById('mergeAllBtn'),
  resetBtn: document.getElementById('resetBtn'),
  manualBtn: document.getElementById('manualBtn'),
  eventChip: document.getElementById('eventChip'),
  eventTime: document.getElementById('eventTime'),
  inkValue: document.getElementById('inkValue'),
  inkBar: document.getElementById('inkBar'),
  scoreValue: document.getElementById('scoreValue'),
  toppleValue: document.getElementById('toppleValue')
};

let audioCtx = null;
let dragInfo = null;
let holdTimer = null;
let holdInterval = null;
let holdingChain = null;
let lastBuffSig = '';

/* ---------------- rendering ---------------- */
function renderAll() {
  renderHUD();
  renderBoard();
  renderDetail();
  renderBuffs();
  updateGenerators();
  renderChains();
  updateMergeAllButton();
}

function renderHUD() {
  dom.inkValue.textContent = String(Math.floor(state.ink));
  dom.inkBar.style.width = `${(state.ink / INK_MAX) * 100}%`;
  dom.scoreValue.textContent = fmt(state.score);
  dom.toppleValue.textContent = `${toppledCount()}/3`;
  dom.eventTime.textContent = formatTime(state.nextEvent);
  dom.eventChip.classList.toggle('soon', state.started && !state.won && state.nextEvent <= 10);
  dom.eventChip.title = state.won
    ? 'The archive is sealed.'
    : `Next historical interlude in ${formatTime(state.nextEvent)}`;
}

function tileHTML(item, index, isSelected) {
  const chain = CHAINS[item.chain];
  const level = item.level;
  const selectedClass = isSelected ? ' selected' : '';
  const hi = level >= 10 ? ' hi' : '';
  const max = level >= 18 ? ' max' : '';
  const deg = Math.round((level / 18) * 360);
  return `<div class="tile ${item.chain}${hi}${max}${selectedClass}" data-index="${index}" data-lv="${level}" style="--lvl:${level};--deg:${deg}deg" role="button" tabindex="0" aria-label="${chain.name}, tier ${level}, ${chain.stages[level - 1]}. ${level >= 18 ? 'Endgame record: merge with another Downfall to topple the regime.' : `Merge with another tier ${level} fragment to advance.`}">
    <div class="portrait-ring"><div class="portrait">${portraitSVG(item.chain, level)}</div></div>
    <span class="level-num">${String(level).padStart(2, '0')}</span>
    ${level >= 13 ? '<span class="flair">✦</span>' : ''}
    ${level >= 18 ? '<span class="max-mark">FALL</span>' : ''}
  </div>`;
}

function renderBoard() {
  const sel = selected != null ? state.board[selected] : null;
  let html = '';
  for (let i = 0; i < CELLS; i++) {
    const item = state.board[i];
    let cls = 'cell';
    if (!item) cls += ' empty';
    if (sel) {
      if (item && i !== selected && canMerge(sel, item)) cls += ' valid-target';
      else if (!item) cls += ' valid-move';
    }
    if (i === selected) cls += ' selected-cell';
    html += `<div class="${cls}" data-index="${i}" role="gridcell">${item ? tileHTML(item, i, i === selected) : ''}</div>`;
  }
  dom.board.innerHTML = html;
}

function renderDetail() {
  if (selected == null || !state.board[selected]) {
    selected = null;
    dom.detailBar.innerHTML = `<div class="detail-default">
      <div class="hint-icon" aria-hidden="true">⇄</div>
      <div><b>Select a fragment to inspect it.</b><span>Tap a matching twin to merge · drag to move · hold a reconstruction button to repeat.</span></div>
    </div>`;
    return;
  }

  const item = state.board[selected];
  const chain = CHAINS[item.chain];
  const level = item.level;
  const cost = trainCost(level);
  const canTrain = level < 18;
  const toppled = state.toppled[item.chain];

  dom.detailBar.innerHTML = `<div class="detail-portrait">${portraitSVG(item.chain, level)}</div>
    <div class="detail-copy">
      <div class="detail-kicker" style="color:${chain.accent || chain.color}">${chain.short} DOSSIER · TIER ${level} / 18</div>
      <div class="detail-title">${chain.stages[level - 1]}</div>
      <div class="detail-sub">${level >= 18 ? 'Endgame record — merge two <b>Downfall</b> records to topple the regime.' : `Merge with another <b>Tier ${level}</b> fragment to reach Tier ${level + 1}.`}${toppled ? ' The regime is already toppled.' : ''}</div>
    </div>
    <button class="btn btn-gold train-btn" id="trainBtn" type="button" ${!canTrain || toppled || state.ink < cost ? 'disabled' : ''}>${!canTrain ? 'ENDGAME' : `TRAIN TO ${level + 1} · ${cost} INK`}</button>`;
}

function refreshTrainButton() {
  const item = selected != null ? state.board[selected] : null;
  const button = dom.detailBar.querySelector('#trainBtn');
  if (!item || !button) return;
  const cost = trainCost(item.level);
  const disabled = item.level >= 18 || state.toppled[item.chain] || state.ink < cost;
  if (button.disabled !== disabled) button.disabled = disabled;
}

function renderBuffs() {  const now = Date.now();
  const free = Math.ceil((state.buffs.freeSpawnUntil - now) / 1000);
  const double = Math.ceil((state.buffs.doubleUntil - now) / 1000);
  const boost = Math.ceil((state.buffs.boostUntil - now) / 1000);
  const chips = [];
  if (free > 0) chips.push(`<span class="buff-chip">FREE RECONSTRUCTION <b>${free}s</b></span>`);
  if (double > 0) chips.push(`<span class="buff-chip double">DOUBLE EVIDENCE <b>${double}s</b></span>`);
  if (boost > 0) chips.push(`<span class="buff-chip">+1 TIER RECONSTRUCTION <b>${boost}s</b></span>`);
  dom.buffBar.innerHTML = chips.join('');
  dom.buffBar.hidden = chips.length === 0;

  const sig = chips.join('|');
  if (sig !== lastBuffSig) {
    lastBuffSig = sig;
    updateGenerators();
  }
}

function renderChains() {
  dom.chains.innerHTML = CHAIN_ORDER.map(id => {
    const chain = CHAINS[id];
    const highest = state.highest[id];
    const toppled = state.toppled[id];
    const pips = Array.from({ length: 18 }, (_, i) => {
      const level = i + 1;
      let cls = 'pip';
      if (toppled || level <= highest) cls += ' on';
      else if (level === highest + 1) cls += ' next';
      return `<i class="${cls}"></i>`;
    }).join('');

    return `<button class="chain-card ${id}${toppled ? ' toppled' : ''}" data-chain="${id}" type="button" aria-label="Open dossier for ${chain.name}">
      <span class="chain-avatar">${portraitSVG(id, highest)}</span>
      <span class="chain-body">
        <span class="chain-top"><span class="chain-name">${chain.short}</span><span class="chain-tier">${toppled ? 'TOPPLED' : `${String(highest).padStart(2, '0')} / 18`}</span></span>
        <span class="chain-title">${toppled ? 'REGIME FALLEN' : chain.stages[highest - 1]}</span>
        <span class="pips">${pips}</span>
      </span>
      ${toppled ? '<span class="chain-stamp">TOPPLED</span>' : ''}
    </button>`;
  }).join('');
}

function buildGenerators() {
  dom.generators.innerHTML = CHAIN_ORDER.map(id => `<button class="gen ${id}" data-gen="${id}" type="button">
    <span class="gen-seal" data-seal="${id}"></span>
    <span class="gen-text"><b>RECONSTRUCT</b><span>TIER 1 · 6 INK</span></span>
  </button>`).join('');
}

function updateGenerators() {
  const free = buffActive('freeSpawnUntil');
  const empty = hasEmpty();
  for (const id of CHAIN_ORDER) {
    const btn = dom.generators.querySelector(`[data-gen="${id}"]`);
    if (!btn) continue;
    const toppled = state.toppled[id];
    const level = spawnLevelFor(id);
    const cost = spawnCost(id);
    const highest = state.highest[id];
    const seal = btn.querySelector('.gen-seal');
    if (seal.dataset.sealFor !== `${id}:${highest}`) {
      seal.dataset.sealFor = `${id}:${highest}`;
      seal.innerHTML = portraitSVG(id, highest);
    }
    btn.classList.toggle('toppled', toppled);
    btn.disabled = toppled || !empty || (!free && state.ink < cost);
    btn.querySelector('.gen-text b').textContent = toppled ? 'SEALED' : 'RECONSTRUCT';
    btn.querySelector('.gen-text span').textContent = toppled
      ? 'REGIME TOPPLED'
      : `TIER ${level} · ${cost === 0 ? 'FREE' : `${cost} INK`}`;
    btn.setAttribute('aria-label', toppled
      ? `${CHAINS[id].name} is toppled; reconstruction sealed`
      : `Reconstruct ${CHAINS[id].name} at tier ${level} for ${cost} ink`);
    btn.title = toppled ? 'Regime already toppled' : `Spawn tier ${level} (${cost} ink)`;
  }
  dom.genHint.textContent = empty ? 'tap or hold to repeat' : 'table full — merge first';
}

function updateMergeAllButton() {
  const possible = !!findMergePair();
  dom.mergeAllBtn.disabled = !state.started || modalOpen || autoRunning || !possible;
  dom.mergeAllBtn.textContent = autoRunning ? 'MERGING…' : 'MERGE ALL';
}

/* ---------------- visual feedback ---------------- */
function addFloat(index, text, cls = '') {
  const cell = dom.board.querySelector(`.cell[data-index="${index}"]`);
  if (!cell) return;
  const el = document.createElement('div');
  el.className = `float-text${cls ? ` ${cls}` : ''}`;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '42%';
  cell.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function addSparks(index, color, count = 9) {
  const cell = dom.board.querySelector(`.cell[data-index="${index}"]`);
  if (!cell) return;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 16 + Math.random() * 24;
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.left = '50%';
    spark.style.top = '45%';
    spark.style.background = color;
    spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    cell.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
  }
}

function pulseTile(index, cls) {
  const tile = dom.board.querySelector(`.cell[data-index="${index}"] .tile`);
  if (!tile) return;
  tile.classList.add(cls);
  setTimeout(() => tile.classList.remove(cls), 520);
}

function shakeCell(index) {
  const cell = dom.board.querySelector(`.cell[data-index="${index}"]`);
  if (!cell) return;
  cell.classList.add('bad-target');
  setTimeout(() => cell.classList.remove('bad-target'), 340);
}

function screenFlash() {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
}

function toast(message, kind = '') {
  const now = Date.now();
  if (dom.toastLayer.dataset.lastMessage === message && now - Number(dom.toastLayer.dataset.lastAt || 0) < 1500) return;
  dom.toastLayer.dataset.lastMessage = message;
  dom.toastLayer.dataset.lastAt = String(now);
  const el = document.createElement('div');
  el.className = `toast${kind ? ` ${kind}` : ''}`;
  el.textContent = message;
  dom.toastLayer.appendChild(el);
  while (dom.toastLayer.children.length > 4) dom.toastLayer.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 340);
  }, 3400);
}

/* ---------------- audio ---------------- */
function initAudio() {
  if (!audioCtx) {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) audioCtx = new AudioCtor();
    } catch { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(frequency, duration = 0.08, type = 'sine', volume = 0.035, delay = 0) {
  if (!audioCtx) return;
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playSound(kind) {
  if (!state.sound) return;
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  switch (kind) {
    case 'spawn':
      tone(220, 0.05, 'square', 0.018);
      break;
    case 'select':
      tone(330, 0.04, 'sine', 0.018);
      break;
    case 'move':
      tone(280, 0.06, 'triangle', 0.025);
      tone(360, 0.05, 'triangle', 0.02, 0.045);
      break;
    case 'merge':
      tone(430, 0.07, 'triangle', 0.04);
      tone(650, 0.1, 'triangle', 0.03, 0.05);
      break;
    case 'cascade':
      tone(520, 0.08, 'triangle', 0.025);
      tone(660, 0.08, 'triangle', 0.022, 0.07);
      tone(820, 0.12, 'triangle', 0.02, 0.14);
      break;
    case 'train':
      tone(390, 0.06, 'square', 0.022);
      tone(523, 0.08, 'square', 0.02, 0.05);
      tone(700, 0.1, 'square', 0.018, 0.1);
      break;
    case 'error':
      tone(140, 0.12, 'sawtooth', 0.022);
      tone(105, 0.14, 'sawtooth', 0.018, 0.06);
      break;
    case 'event':
      tone(523, 0.16, 'sine', 0.03);
      tone(659, 0.2, 'sine', 0.026, 0.12);
      tone(784, 0.26, 'sine', 0.022, 0.24);
      break;
    case 'topple':
      tone(120, 0.55, 'sawtooth', 0.05);
      tone(72, 0.9, 'sine', 0.06, 0.08);
      tone(196, 0.4, 'triangle', 0.03, 0.2);
      break;
    default:
      tone(300, 0.05, 'sine', 0.02);
  }
}

function updateSoundButton() {
  dom.soundBtn.textContent = state.sound ? 'SOUND' : 'MUTED';
  dom.soundBtn.setAttribute('aria-pressed', String(state.sound));
  dom.soundBtn.title = state.sound ? 'Mute sound' : 'Enable sound';
}

/* ---------------- modal plumbing ---------------- */
function openModal(html, { dark = false, dismissible = true, cls = '' } = {}) {
  dom.modalLayer.innerHTML = `<div class="modal ${dark ? 'dark' : ''} ${cls}" role="dialog" aria-modal="true">
    ${dismissible ? '<button class="modal-close" type="button" aria-label="Close dialog">×</button>' : ''}
    ${html}
  </div>`;
  dom.modalLayer.hidden = false;
  dom.modalLayer.dataset.dismissible = dismissible ? '1' : '0';
  modalOpen = true;
  document.body.classList.add('modal-open');
  dom.modalLayer.onclick = event => {
    if (event.target === dom.modalLayer && dismissible) closeModal();
  };
  const closeBtn = dom.modalLayer.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  updateMergeAllButton();
}

function closeModal() {
  dom.modalLayer.hidden = true;
  dom.modalLayer.innerHTML = '';
  dom.modalLayer.onclick = null;
  modalOpen = false;
  interludeOpen = false;
  document.body.classList.remove('modal-open');
  lastTick = Date.now();
  updateMergeAllButton();
}

function showConfirm({ title, body, confirmLabel = 'CONFIRM', onConfirm }) {
  openModal(`<div class="modal-topline"><span>ARCHIVE CONTROL</span><span>CONFIRM</span></div>
    <h2>${title}</h2>
    <p class="lead">${body}</p>
    <div class="modal-actions">
      <button class="btn" type="button" data-a="cancel">CANCEL</button>
      <button class="btn btn-primary" type="button" data-a="ok">${confirmLabel}</button>
    </div>`, { dismissible: true, cls: 'confirm-modal' });
  dom.modalLayer.querySelector('[data-a="cancel"]').addEventListener('click', closeModal);
  dom.modalLayer.querySelector('[data-a="ok"]').addEventListener('click', () => {
    closeModal();
    onConfirm?.();
  });
}

/* ---------------- manual ---------------- */
function showManual() {
  openModal(`<div class="modal-topline"><span>FIELD MANUAL · MERGE &amp; FALL</span><span>REV. 01</span></div>
    <h2>How the archive works</h2>
    <p class="lead">You are reconstructing the anatomy of three dictatorships — and then ending them. Every chain has 18 tiers. The last tier is <b>Downfall</b>.</p>
    <div class="manual-grid">
      <div class="manual-card"><h4>1 · MERGE</h4><p>Tap a fragment to select it, then tap a matching fragment of the <b>same regime and same tier</b>. They merge into the next tier. You can also drag one tile onto its twin.</p></div>
      <div class="manual-card"><h4>2 · MOVE</h4><p>Select a fragment and tap an empty cell, or drag it there. A tap on empty space with nothing selected does nothing.</p></div>
      <div class="manual-card"><h4>3 · RECONSTRUCT</h4><p>The three buttons below the table spend <b>ink</b> to add a fragment. Tap once or hold to repeat. Spawned tier rises as the dossier progresses.</p></div>
      <div class="manual-card"><h4>4 · TRAIN</h4><p>Select a fragment and spend ink to raise it one tier. Training is a shortcut; it is not free history.</p></div>
      <div class="manual-card"><h4>5 · TOPPLE</h4><p>Reach Tier 18, then create a second Tier 18 and merge the two Downfall records. The regime falls, its remaining fragments crumble, and its dossier is sealed.</p></div>
      <div class="manual-card"><h4>6 · INTERLUDES</h4><p>Every 70–110 seconds the table pauses for a historical interlude. Choose one of two archive effects: ink, evidence, free reconstruction, double evidence, or a declassified note.</p></div>
    </div>
    <h3>The three dossiers</h3>
    <p>Adolf Hitler, Joseph Goebbels and Heinrich Himmler each have a separate 18-tier chain. Open a dossier from the sidebar to see every stage and the historical notes you have declassified.</p>
    <h3>Evidence &amp; ink</h3>
    <p><b>Ink</b> refills over time and is earned from merges, topples and events. <b>Evidence</b> is your score. It has no mechanical use; it is the record.</p>
    <div class="manual-note"><p><b>Historical note.</b> This game is a work of satire and critique. It names perpetrators of mass atrocities and does not glorify them. There are no hate symbols here. Every chain ends in downfall, and the historical notes are part of the game because the crimes are part of the record. <b>Never again.</b></p></div>
    <div class="modal-actions"><button class="btn btn-paper" type="button" data-a="manual-close">CLOSE MANUAL</button></div>`, { dismissible: true });
  dom.modalLayer.querySelector('[data-a="manual-close"]').addEventListener('click', closeModal);
}

/* ---------------- dossiers ---------------- */
function showDossier(chainId) {
  const chain = CHAINS[chainId];
  if (!chain) return;
  const highest = state.highest[chainId];
  const toppled = state.toppled[chainId];
  const unlockedCount = state.facts[chainId].length;

  const stages = chain.stages.map((stage, i) => {
    const level = i + 1;
    let cls = 'stage-cell';
    if (toppled || level <= highest) cls += ' reached';
    if (!toppled && level === highest) cls += ' current';
    return `<div class="${cls}"><span>${String(level).padStart(2, '0')}</span><b>${stage}</b></div>`;
  }).join('');

  const facts = chain.facts.map(fact => {
    const unlocked = toppled || state.facts[chainId].includes(fact.level);
    return `<div class="fact${unlocked ? ' unlocked' : ''}">
      <div class="fact-title"><b>${unlocked ? fact.title : 'LOCKED NOTE'}</b><span>${unlocked ? 'DECLASSIFIED' : `TIER ${fact.level}`}</span></div>
      <p>${unlocked ? fact.text : `Reach Tier ${fact.level} to declassify this historical note.`}</p>
    </div>`;
  }).join('');

  openModal(`<div class="modal-topline"><span>DOSSIER · ${chain.regime.toUpperCase()}</span><span>${toppled ? 'SEALED' : 'ACTIVE'}</span></div>
    <div class="dossier-head">
      <div class="dossier-avatar" style="border-color:${chain.color}">${portraitSVG(chainId, highest)}</div>
      <div>
        <div class="dossier-kicker">HISTORICAL RECORD · 18 TIERS</div>
        <h2 class="dossier-title">${chain.name}</h2>
        <div class="dossier-sub">${toppled ? 'TOPPLED — the record is sealed.' : `Tier ${highest} / 18 · ${chain.stages[highest - 1]}`}</div>
        <div class="dossier-meta">
          <span class="meta-chip">${unlockedCount} / ${chain.facts.length} NOTES</span>
          <span class="meta-chip">${toppled ? 'REGIME FALLEN' : `${18 - highest} TIERS TO DOWNFALL`}</span>
          ${toppled ? '<span class="meta-chip hot">TOPPLED</span>' : ''}
        </div>
      </div>
    </div>
    <h3>Stage ladder</h3>
    <div class="stage-grid">${stages}</div>
    <h3>Historical notes</h3>
    <div class="fact-list">${facts}</div>
    <div class="dossier-footer">
      <span class="small">${toppled ? 'THE REGIME IS PART OF THE RECORD NOW.' : 'MERGE TWO TIER 18 RECORDS TO TOPPLE.'}</span>
      <button class="btn btn-paper" type="button" data-a="dossier-close">CLOSE DOSSIER</button>
    </div>`, { dismissible: true });
  dom.modalLayer.querySelector('[data-a="dossier-close"]').addEventListener('click', closeModal);
}

/* ---------------- interludes ---------------- */
function showEvent() {
  if (modalOpen || state.won || !state.started) return;
  const unseen = EVENTS.filter(e => !state.seenEvents.includes(e.id));
  const pool = unseen.length ? unseen : EVENTS;
  const event = pool[Math.floor(Math.random() * pool.length)];
  interludeOpen = true;
  playSound('event');

  openModal(`<div class="modal-topline"><span>${event.tag}</span><span>ARCHIVE INTERLUDE</span></div>
    <div class="interlude-kicker">NO. ${String(state.events + 1).padStart(2, '0')} · THE TABLE PAUSES</div>
    <h2>${event.title}</h2>
    <p class="lead">${event.body}</p>
    <div class="interlude-quote">“${event.quote}”</div>
    <div class="event-options">
      ${event.options.map((option, i) => `<button class="event-option" type="button" data-opt="${i}">
        <span><b>${option.label}</b><span>${option.detail}</span></span><span class="opt-arrow" aria-hidden="true">→</span>
      </button>`).join('')}
    </div>
    <div class="interlude-foot"><span>CHOOSE ONE · EFFECTS ARE PERMANENT OR TIMED</span><span>INTERLUDE ${state.events + 1}</span></div>`, { dark: true, dismissible: false });

  dom.modalLayer.querySelectorAll('[data-opt]').forEach(button => {
    button.addEventListener('click', () => chooseEvent(event, Number(button.dataset.opt)));
  });
}

function chooseEvent(event, index) {
  const option = event.options[index];
  if (!option) return;
  try { option.apply(); } catch { /* effects should never block the archive */ }
  if (!state.seenEvents.includes(event.id)) state.seenEvents.push(event.id);
  state.events++;
  state.nextEvent = 70 + Math.random() * 45;
  closeModal();
  renderAll();
  toast(`${option.label.toUpperCase()} — ${option.result}`, 'good');
  scheduleSave();
}

/* ---------------- topple + win ---------------- */
function showToppleModal(chainId) {
  const chain = CHAINS[chainId];
  const all = toppledCount() === 3;
  const fact = chain.facts.find(f => f.level === 18) || chain.facts[chain.facts.length - 1];
  if (all) state.won = true;
  playSound('event');

  openModal(`<div class="modal-topline"><span>DOWNFALL RECORD · ${chain.short}</span><span>ARCHIVE SEALED</span></div>
    <div class="topple-modal">
      <div class="topple-burst"><div class="dossier-avatar" style="border-color:${chain.color}">${portraitSVG(chainId, 18)}</div></div>
      <div class="topple-stamp">TOPPLED</div>
      <h2>${chain.name}</h2>
      <p class="lead">Tier 18 — ${chain.stages[17]}. The regime collapses into the record.</p>
      <div class="topple-score">EVIDENCE SECURED <b>+25,000</b> &nbsp;·&nbsp; REGIMES TOPPLED <b>${toppledCount()} / 3</b></div>
      <div class="topple-fact">
        <div class="label">FINAL HISTORICAL NOTE</div>
        <p>${fact.text}</p>
      </div>
      <div class="modal-actions">
        <button class="btn ${all ? 'btn-primary' : 'btn-gold'}" type="button" data-a="topple-continue">${all ? 'SEAL THE ARCHIVE' : 'CONTINUE THE ARCHIVE'}</button>
      </div>
      <p class="small" style="margin:10px 0 0">A historical record, not a celebration. The victims were not game pieces.</p>
    </div>`, { dark: true, dismissible: false });

  dom.modalLayer.querySelector('[data-a="topple-continue"]').addEventListener('click', () => {
    closeModal();
    if (all) setTimeout(showWin, 220);
  });
  scheduleSave();
}

function showWin() {
  state.won = true;
  saveNow();
  playSound('event');
  const stats = [
    ['REGIMES', '3 / 3'],
    ['EVIDENCE', fmt(state.score)],
    ['MERGES', fmt(state.merges)],
    ['INTERLUDES', fmt(state.events)],
    ['RECONSTRUCTIONS', fmt(state.spawns)],
    ['TIERS', '54 / 54']
  ];

  openModal(`<div class="modal-topline"><span>ARCHIVE 1945 · FINAL RECORD</span><span>SEALED</span></div>
    <div class="win-modal">
      <div class="win-seal"><div class="stamp">NEVER AGAIN</div></div>
      <h2 class="win-title">THE ARCHIVE<br><em>IS SEALED</em></h2>
      <div class="win-sub">ALL THREE REGIMES TOPPLED · THE RECORD ENDURES</div>
      <div class="win-stats">${stats.map(([label, value]) => `<div class="win-stat"><span>${label}</span><b>${value}</b></div>`).join('')}</div>
      <p class="win-message">You reconstructed each rise, tier by tier, and ended each one. That is the shape of the lesson: tyranny is built by people, sustained by institutions, and brought down by resistance and memory. <b>Never again.</b></p>
      <div class="modal-actions">
        <button class="btn" type="button" data-a="win-dossier">REVIEW THE DOSSIERS</button>
        <button class="btn btn-primary" type="button" data-a="win-new">NEW ARCHIVE</button>
      </div>
    </div>`, { dark: true, dismissible: false });

  dom.modalLayer.querySelector('[data-a="win-dossier"]').addEventListener('click', () => {
    closeModal();
    showDossier('hitler');
  });
  dom.modalLayer.querySelector('[data-a="win-new"]').addEventListener('click', () => {
    closeModal();
    resetGame();
  });
}

/* ---------------- drag & tap input ---------------- */
function onBoardPointerDown(event) {
  if (!state.started || modalOpen || autoRunning) return;
  initAudio();
  const tile = event.target.closest('.tile');

  if (!tile) {
    const cell = event.target.closest('.cell');
    if (cell && selected != null) moveSelectedTo(Number(cell.dataset.index));
    return;
  }

  const cell = tile.closest('.cell');
  dragInfo = {
    idx: Number(cell.dataset.index),
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dragging: false,
    ghost: null
  };
  try { dom.board.setPointerCapture(event.pointerId); } catch { /* ignore */ }
  event.preventDefault();
}

function onBoardPointerMove(event) {
  if (!dragInfo || event.pointerId !== dragInfo.pointerId) return;
  const dx = event.clientX - dragInfo.startX;
  const dy = event.clientY - dragInfo.startY;

  if (!dragInfo.dragging && Math.hypot(dx, dy) > 9) {
    dragInfo.dragging = true;
    selected = dragInfo.idx;
    renderBoard();
    renderDetail();
    const source = dom.board.querySelector(`.cell[data-index="${dragInfo.idx}"] .tile`);
    source?.classList.add('dragging-source', 'selected');
    const item = state.board[dragInfo.idx];
    if (!item) return;
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = tileHTML(item, dragInfo.idx, false);
    document.body.appendChild(ghost);
    dragInfo.ghost = ghost;
    highlightTargets(item);
  }

  if (dragInfo.dragging) {
    event.preventDefault();
    dragInfo.ghost.style.left = `${event.clientX}px`;
    dragInfo.ghost.style.top = `${event.clientY}px`;
    highlightHover(event.clientX, event.clientY);
  }
}

function onBoardPointerUp(event) {
  if (!dragInfo || (event.pointerId != null && event.pointerId !== dragInfo.pointerId)) return;
  const info = dragInfo;
  dragInfo = null;
  try { dom.board.releasePointerCapture(info.pointerId); } catch { /* ignore */ }
  info.ghost?.remove();
  clearBoardHighlights();

  if (!info.dragging) {
    handleTap(info.idx);
    return;
  }

  const element = document.elementFromPoint(event.clientX, event.clientY);
  const cell = element?.closest?.('.cell');
  if (cell) {
    dropOn(info.idx, Number(cell.dataset.index));
  } else {
    selected = info.idx;
    renderBoard();
    renderDetail();
  }
}

function onBoardPointerCancel() {
  if (!dragInfo) return;
  const info = dragInfo;
  dragInfo = null;
  info.ghost?.remove();
  clearBoardHighlights();
  renderBoard();
  renderDetail();
}

function highlightTargets(item) {
  dom.board.querySelectorAll('.cell').forEach(cell => {
    const index = Number(cell.dataset.index);
    const target = state.board[index];
    if (target && canMerge(item, target)) cell.classList.add('valid-target');
    else if (!target) cell.classList.add('valid-move');
  });
}

function highlightHover(x, y) {
  dom.board.querySelectorAll('.drop-glow').forEach(cell => cell.classList.remove('drop-glow'));
  const element = document.elementFromPoint(x, y);
  const cell = element?.closest?.('.cell');
  if (!cell) return;
  if (cell.classList.contains('valid-target') || cell.classList.contains('valid-move')) {
    cell.classList.add('drop-glow');
  }
}

function clearBoardHighlights() {
  dom.board.querySelectorAll('.valid-target, .valid-move, .drop-glow, .dragging-source').forEach(cell => {
    cell.classList.remove('valid-target', 'valid-move', 'drop-glow', 'dragging-source');
  });
}

function dropOn(from, to) {
  const a = state.board[from];
  const b = state.board[to];
  if (!a) return;

  if (from === to) {
    selected = from;
    renderBoard();
    renderDetail();
    return;
  }
  if (!b) {
    state.board[to] = a;
    state.board[from] = null;
    selected = to;
    state.score += 5;
    playSound('move');
    renderAll();
    addFloat(to, 'MOVED');
    scheduleSave();
    return;
  }
  if (canMerge(a, b)) {
    selected = null;
    mergeTiles(from, to);
    return;
  }
  playSound('error');
  shakeCell(to);
  toast('Only the same regime at the same tier can merge.', 'bad');
  renderBoard();
  renderDetail();
}

function handleTap(index) {
  if (!state.started || modalOpen || autoRunning) return;
  const item = state.board[index];

  if (!item) {
    if (selected != null) moveSelectedTo(index);
    return;
  }
  if (selected == null) {
    selected = index;
    playSound('select');
    renderBoard();
    renderDetail();
    return;
  }
  if (selected === index) {
    selected = null;
    renderBoard();
    renderDetail();
    return;
  }

  const selectedItem = state.board[selected];
  if (selectedItem && canMerge(selectedItem, item)) {
    const from = selected;
    selected = null;
    mergeTiles(from, index);
    return;
  }

  selected = index;
  playSound('select');
  renderBoard();
  renderDetail();
  if (selectedItem && selectedItem.chain === item.chain) {
    toast('Same regime, different tier — those fragments cannot merge.', 'bad');
  }
}

/* ---------------- generators, hold-to-repeat ---------------- */
function onGeneratorDown(event) {
  const button = event.target.closest('[data-gen]');
  if (!button || button.disabled) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  initAudio();
  stopHold();
  holdingChain = button.dataset.gen;
  if (!spawn(holdingChain)) {
    stopHold();
    return;
  }
  holdTimer = setTimeout(() => {
    holdInterval = setInterval(() => {
      if (holdingChain && !spawn(holdingChain)) stopHold();
    }, 215);
  }, 520);
  event.preventDefault();
}

function stopHold() {
  if (holdTimer) clearTimeout(holdTimer);
  if (holdInterval) clearInterval(holdInterval);
  holdTimer = null;
  holdInterval = null;
  holdingChain = null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------------- lifecycle ---------------- */
function buildIntroPortraits() {
  dom.introPortraits.innerHTML = CHAIN_ORDER.map(id => `<div class="intro-portrait" data-name="${CHAINS[id].short}">${portraitSVG(id, 1)}</div>`).join('');
}

function startGame() {
  initAudio();
  state.started = true;
  dom.intro.hidden = true;
  document.body.classList.remove('intro-open');
  saveNow();
  lastTick = Date.now();
  renderAll();

  if (offlineGain > 0) {
    toast(`While the archive was closed, ${fmt(offlineGain)} ink pooled.`, 'good');
    offlineGain = 0;
  }
  if (state.won) {
    setTimeout(showWin, 500);
  }
}

function toggleSound() {
  state.sound = !state.sound;
  updateSoundButton();
  if (state.sound) {
    initAudio();
    playSound('event');
  }
  saveNow();
}

function hasSavedGame() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

function bindEvents() {
  dom.startBtn.addEventListener('click', startGame);
  dom.introManualBtn.addEventListener('click', () => { initAudio(); showManual(); });
  dom.manualBtn.addEventListener('click', () => { initAudio(); showManual(); });
  dom.helpBtn.addEventListener('click', () => { initAudio(); showManual(); });

  dom.introResetBtn.addEventListener('click', () => {
    showConfirm({
      title: 'Erase this archive?',
      body: 'This removes the saved board, evidence and declassified notes. The history remains; your progress does not.',
      confirmLabel: 'ERASE SAVE',
      onConfirm: () => {
        try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
        state = defaultState();
        selected = null;
        autoRunning = false;
        dom.startBtn.textContent = 'Start';
        dom.introResetBtn.hidden = true;
        renderAll();
        toast('Save erased. The archive is blank again.', 'good');
      }
    });
  });

  dom.resetBtn.addEventListener('click', () => {
    showConfirm({
      title: 'Start a new archive?',
      body: 'This resets the table, ink, evidence and all three dossiers. It cannot be undone.',
      confirmLabel: 'RESET ARCHIVE',
      onConfirm: resetGame
    });
  });

  dom.mergeAllBtn.addEventListener('click', () => { initAudio(); autoMerge(); });
  dom.soundBtn.addEventListener('click', toggleSound);
  dom.eventChip.addEventListener('click', () => {
    if (modalOpen) return;
    toast(state.won ? 'The archive is sealed.' : `The next historical interlude arrives in ${formatTime(state.nextEvent)}.`, '');
  });

  dom.chains.addEventListener('click', event => {
    const card = event.target.closest('[data-chain]');
    if (card) { initAudio(); showDossier(card.dataset.chain); }
  });

  dom.detailBar.addEventListener('click', event => {
    if (event.target.closest('#trainBtn')) {
      initAudio();
      trainSelected();
    }
  });

  dom.generators.addEventListener('pointerdown', onGeneratorDown);
  dom.generators.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const button = event.target.closest('[data-gen]');
    if (!button) return;
    event.preventDefault();
    initAudio();
    spawn(button.dataset.gen);
  });
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  window.addEventListener('blur', stopHold);

  dom.board.addEventListener('pointerdown', onBoardPointerDown);
  window.addEventListener('pointermove', onBoardPointerMove, { passive: false });
  window.addEventListener('pointerup', onBoardPointerUp);
  window.addEventListener('pointercancel', onBoardPointerCancel);

  dom.board.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const tile = event.target.closest('.tile');
    if (!tile) return;
    event.preventDefault();
    handleTap(Number(tile.closest('.cell').dataset.index));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalOpen && dom.modalLayer.dataset.dismissible === '1') closeModal();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHold();
      saveNow();
    } else {
      lastTick = Date.now();
    }
  });

  window.addEventListener('beforeunload', saveNow);
}

function tick() {
  const now = Date.now();
  if (!state.started || modalOpen) {
    lastTick = now;
    renderHUD();
    return;
  }

  const dt = Math.min(2, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;
  state.ink = Math.min(INK_MAX, state.ink + dt * INK_REGEN);

  if (!state.won && state.nextEvent > 0) {
    state.nextEvent -= dt;
    if (state.nextEvent <= 0) {
      state.nextEvent = 0;
      renderHUD();
      showEvent();
      return;
    }
  }

  renderHUD();
  if (selected != null) {
    if (state.board[selected]) refreshTrainButton();
    else { selected = null; renderDetail(); }
  }
  renderBuffs();
  updateGenerators();
  updateMergeAllButton();
}

function init() {
  buildIntroPortraits();
  buildGenerators();
  bindEvents();
  updateSoundButton();
  renderAll();

  const saved = state.started;
  if (saved) {
    dom.startBtn.textContent = 'Continue';
    dom.introResetBtn.hidden = false;
  } else {
    dom.startBtn.textContent = 'Start';
    dom.introResetBtn.hidden = true;
  }

  lastTick = Date.now();
  document.body.classList.add('intro-open');
  setInterval(tick, 250);
  setInterval(() => { if (state.started) saveNow(); }, 5000);
}

init();
