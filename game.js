/* ============================================================
   MERGE & FALL — core game state and merge logic
   ============================================================ */
'use strict';

/* ---------------- globals ---------------- */
let state = null;
let selected = null;
let modalOpen = false;
let interludeOpen = false;
let autoRunning = false;
let offlineGain = 0;
let lastTick = Date.now();
let saveTimer = null;

/* ---------------- helpers ---------------- */
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function buffActive(key) { return (state.buffs[key] || 0) > Date.now(); }

function toppledCount() { return CHAIN_ORDER.filter(id => state.toppled[id]).length; }

function emptyCells() {
  const out = [];
  for (let i = 0; i < CELLS; i++) if (!state.board[i]) out.push(i);
  return out;
}

function hasEmpty() { return state.board.some(item => !item); }

function canMerge(a, b) {
  return !!(a && b && a.chain === b.chain && a.level === b.level && a.level <= 18);
}

function trainCost(level) { return 10 + Math.round(level * 5.5); }

/* ---------------- initial state ---------------- */
function defaultState() {
  const board = Array(CELLS).fill(null);
  const seed = [
    [48, 'hitler', 1], [49, 'hitler', 1], [50, 'hitler', 2], [41, 'hitler', 3],
    [51, 'goebbels', 1], [52, 'goebbels', 1], [53, 'goebbels', 2], [43, 'goebbels', 3],
    [54, 'himmler', 1], [55, 'himmler', 1], [46, 'himmler', 2], [44, 'himmler', 3]
  ];
  for (const [index, chain, level] of seed) board[index] = { chain, level };

  return {
    version: 1,
    started: false,
    won: false,
    board,
    ink: 120,
    score: 0,
    highest: { hitler: 3, goebbels: 3, himmler: 3 },
    toppled: { hitler: false, goebbels: false, himmler: false },
    facts: { hitler: [], goebbels: [], himmler: [] },
    merges: 0,
    spawns: 0,
    events: 0,
    nextEvent: 70,
    seenEvents: [],
    sound: true,
    buffs: { freeSpawnUntil: 0, doubleUntil: 0, boostUntil: 0 },
    lastSeen: Date.now()
  };
}

/* ---------------- persistence ---------------- */
function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch { return null; }
  if (!raw) return null;

  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return null;
    const base = defaultState();
    const board = Array(CELLS).fill(null);
    const source = Array.isArray(saved.board) ? saved.board : [];
    source.slice(0, CELLS).forEach((item, i) => {
      if (item && CHAINS[item.chain] && Number.isInteger(item.level) && item.level >= 1 && item.level <= 18) {
        board[i] = { chain: item.chain, level: item.level };
      }
    });

    const next = { ...base, ...saved, board };
    next.highest = { ...base.highest, ...(saved.highest || {}) };
    next.toppled = { ...base.toppled, ...(saved.toppled || {}) };
    next.facts = { ...base.facts, ...(saved.facts || {}) };
    next.buffs = { ...base.buffs, ...(saved.buffs || {}) };

    for (const id of CHAIN_ORDER) {
      next.highest[id] = clamp(Number(next.highest[id]) || 1, 1, 18);
      next.toppled[id] = !!next.toppled[id];
      const facts = Array.isArray(next.facts[id]) ? next.facts[id] : [];
      next.facts[id] = facts.filter(level => CHAINS[id].facts.some(f => f.level === level));
      if (next.toppled[id]) next.facts[id] = CHAINS[id].facts.map(f => f.level);
    }

    next.ink = clamp(Number(next.ink) || 0, 0, INK_MAX);
    next.score = Math.max(0, Number(next.score) || 0);
    next.nextEvent = Number.isFinite(next.nextEvent) ? next.nextEvent : 60;
    next.seenEvents = Array.isArray(next.seenEvents) ? next.seenEvents : [];
    next.buffs = {
      freeSpawnUntil: Number(next.buffs.freeSpawnUntil) || 0,
      doubleUntil: Number(next.buffs.doubleUntil) || 0,
      boostUntil: Number(next.buffs.boostUntil) || 0
    };

    const elapsed = Math.max(0, Math.min(6 * 3600, (Date.now() - (Number(saved.lastSeen) || Date.now())) / 1000));
    if (elapsed > 5 && next.started) {
      const gain = Math.floor(elapsed * INK_REGEN * 0.35);
      const before = next.ink;
      next.ink = Math.min(INK_MAX, next.ink + gain);
      offlineGain = Math.max(0, Math.floor(next.ink - before));
    }
    if (next.nextEvent <= 0) next.nextEvent = 45;
    next.lastSeen = Date.now();
    return next;
  } catch {
    return null;
  }
}

function saveNow() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSeen: Date.now() }));
  } catch { /* storage may be unavailable */ }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 320);
}

/* ---------------- small effects used by interlude options ---------------- */
function addInk(amount) {
  state.ink = clamp(state.ink + amount, 0, INK_MAX);
  renderHUD();
  updateGenerators();
  scheduleSave();
}

function addScore(amount) {
  state.score = Math.max(0, state.score + amount);
  renderHUD();
  scheduleSave();
}

function grantBuff(key, seconds) {
  state.buffs[key] = Math.max(state.buffs[key] || 0, Date.now() + seconds * 1000);
  renderBuffs();
  updateGenerators();
  scheduleSave();
}

function revealFact() {
  const candidates = [];
  for (const id of CHAIN_ORDER) {
    if (state.toppled[id]) continue;
    const fact = CHAINS[id].facts.find(f => !state.facts[id].includes(f.level));
    if (fact) candidates.push({ id, fact, progress: state.highest[id] });
  }
  if (!candidates.length) {
    addScore(1000);
    return false;
  }
  candidates.sort((a, b) => b.progress - a.progress);
  const pick = candidates[0];
  state.facts[pick.id].push(pick.fact.level);
  renderChains();
  renderDetail();
  toast(`DECLASSIFIED · ${CHAINS[pick.id].short} — ${pick.fact.title}`, 'fact');
  scheduleSave();
  return true;
}

function spawnFree(count, offset) {
  let placed = 0;
  for (const id of CHAIN_ORDER) {
    if (state.toppled[id]) continue;
    for (let k = 0; k < count; k++) {
      const empties = emptyCells();
      if (!empties.length) break;
      const level = clamp(state.highest[id] - offset, 1, 17);
      const index = empties[Math.floor(Math.random() * empties.length)];
      state.board[index] = { chain: id, level };
      placed++;
    }
  }
  if (placed) {
    playSound('spawn');
    renderAll();
    scheduleSave();
  }
  return placed;
}

/* ---------------- spawning ---------------- */
function spawnLevelFor(chainId) {
  let level = clamp(state.highest[chainId] - 1, 1, 17);
  if (buffActive('boostUntil')) level = clamp(level + 1, 1, 17);
  return level;
}

function spawnCost(chainId) {
  if (buffActive('freeSpawnUntil')) return 0;
  return 4 + Math.ceil(spawnLevelFor(chainId) * 1.5);
}

function spawn(chainId) {
  if (!state.started || state.toppled[chainId]) return false;
  const level = spawnLevelFor(chainId);
  const cost = spawnCost(chainId);

  if (cost > 0 && state.ink < cost) {
    toast('Not enough ink. Merge fragments or let the archive refill.', 'bad');
    playSound('error');
    return false;
  }
  const empties = emptyCells();
  if (!empties.length) {
    toast('The table is full. Merge matching fragments first.', 'bad');
    playSound('error');
    return false;
  }

  state.ink = Math.max(0, state.ink - cost);
  const index = empties[Math.floor(Math.random() * empties.length)];
  state.board[index] = { chain: chainId, level };
  state.spawns++;
  state.score += 15;

  playSound('spawn');
  renderBoard();
  renderHUD();
  renderDetail();
  updateGenerators();
  addFloat(index, '+15');
  scheduleSave();
  return true;
}

/* ---------------- merge chain ---------------- */
function checkFacts(chainId) {
  const unlocked = [];
  for (const fact of CHAINS[chainId].facts) {
    if (fact.level <= state.highest[chainId] && !state.facts[chainId].includes(fact.level)) {
      state.facts[chainId].push(fact.level);
      unlocked.push(fact);
    }
  }
  for (const fact of unlocked) {
    toast(`DECLASSIFIED · ${CHAINS[chainId].short} — ${fact.title}`, 'fact');
  }
  return unlocked;
}

function mergeTiles(from, to, auto = false) {
  const a = state.board[from];
  const b = state.board[to];
  if (!canMerge(a, b)) return { merged: false, toppled: false };

  const chainId = a.chain;
  const level = a.level;
  state.board[from] = null;
  state.board[to] = null;
  if (selected === from || selected === to) selected = null;

  if (level >= 18) {
    topple(chainId, to, auto);
    return { merged: true, toppled: true };
  }

  const newLevel = level + 1;
  state.board[to] = { chain: chainId, level: newLevel };
  state.merges++;

  const doubled = buffActive('doubleUntil');
  const gain = (level * level * 9 + 50) * (doubled ? 2 : 1);
  state.score += gain;
  state.ink = Math.min(INK_MAX, state.ink + Math.ceil(level * 1.3));

  if (newLevel > state.highest[chainId]) state.highest[chainId] = newLevel;
  const unlocked = checkFacts(chainId);

  if (!auto) playSound('merge');
  renderAll();
  addFloat(to, `+${fmt(gain)}`, doubled ? 'double' : '');
  addSparks(to, CHAINS[chainId].color);
  pulseTile(to, 'merging');
  if (unlocked.length) renderChains();
  scheduleSave();
  return { merged: true, toppled: false };
}

function topple(chainId, contactIndex, auto = false) {
  if (state.toppled[chainId]) return;
  const chain = CHAINS[chainId];
  state.toppled[chainId] = true;
  state.highest[chainId] = 18;
  state.merges++;
  state.score += 25000;
  state.ink = Math.min(INK_MAX, state.ink + 160);
  state.facts[chainId] = chain.facts.map(f => f.level);

  // The rest of the regime's fragments crumble into the record.
  let cleared = 0;
  for (let i = 0; i < CELLS; i++) {
    if (state.board[i] && state.board[i].chain === chainId) {
      state.board[i] = null;
      cleared++;
    }
  }
  state.score += cleared * 150;
  selected = null;

  playSound('topple');
  renderAll();
  addFloat(contactIndex, 'DOWNFALL', 'fall');
  addSparks(contactIndex, '#f08a7b', 14);
  screenFlash();
  scheduleSave();

  // Pause the table while the downfall card opens.
  modalOpen = true;
  setTimeout(() => showToppleModal(chainId), 520);
}

function trainSelected() {
  if (selected == null) return;
  const item = state.board[selected];
  if (!item) return;
  if (item.level >= 18) {
    toast('This record is already at Tier 18. Merge two Downfall records to topple it.', 'bad');
    playSound('error');
    return;
  }
  const cost = trainCost(item.level);
  if (state.ink < cost) {
    toast(`Training needs ${cost} ink.`, 'bad');
    playSound('error');
    return;
  }

  state.ink -= cost;
  item.level++;
  state.score += 140 + item.level * 25;
  if (item.level > state.highest[item.chain]) state.highest[item.chain] = item.level;
  const unlocked = checkFacts(item.chain);
  if (unlocked.length) renderChains();

  playSound('train');
  renderAll();
  addFloat(selected, `TRAINED · TIER ${item.level}`, 'double');
  pulseTile(selected, 'merge');
  scheduleSave();
}

function moveSelectedTo(index) {
  if (selected == null || state.board[index]) return false;
  const item = state.board[selected];
  if (!item) return false;
  state.board[index] = item;
  state.board[selected] = null;
  selected = index;
  state.score += 5;
  playSound('move');
  renderAll();
  addFloat(index, 'MOVED');
  scheduleSave();
  return true;
}

/* ---------------- merge-all ---------------- */
function findMergePair() {
  const groups = new Map();
  for (let i = 0; i < CELLS; i++) {
    const item = state.board[i];
    if (!item) continue;
    const key = `${item.chain}:${item.level}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  let best = null;
  for (const ids of groups.values()) {
    if (ids.length < 2) continue;
    const level = state.board[ids[0]].level;
    if (!best || level > best.level) best = { from: ids[0], to: ids[1], level };
  }
  return best;
}

async function autoMerge() {
  if (autoRunning || modalOpen || !state.started) return;
  autoRunning = true;
  updateMergeAllButton();
  let count = 0;
  let didTopple = false;
  const before = toppledCount();

  while (!modalOpen) {
    const pair = findMergePair();
    if (!pair) break;
    const result = mergeTiles(pair.from, pair.to, true);
    if (!result.merged) break;
    count++;
    if (toppledCount() > before) {
      didTopple = true;
      break;
    }
    await sleep(58);
  }

  autoRunning = false;
  updateMergeAllButton();
  renderAll();
  if (count > 0 && !didTopple) {
    playSound('cascade');
    toast(`MERGE ALL · ${count} merge${count === 1 ? '' : 's'} completed.`, 'good');
  }
  if (count > 0) scheduleSave();
}

function resetGame() {
  state = defaultState();
  state.started = true;
  selected = null;
  autoRunning = false;
  saveNow();
  renderAll();
  toast('A new archive has been opened.', 'good');
  playSound('event');
}

/* ---------------- bootstrap state ---------------- */
state = loadState() || defaultState();
