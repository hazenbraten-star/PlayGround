/* ================= ui.js — DOM overlay: banners, dresser, boards ====== */
(function () {
  const RC = window.RC;
  const $ = id => document.getElementById(id);

  const UI = RC.ui = {
    /* ---------- generic banner ---------- */
    banner(kicker, text, sub, holdMs) {
      $('bannerKicker').textContent = kicker || '';
      const t = $('bannerText');
      t.textContent = text || '';
      t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
      $('bannerSub').textContent = sub || '';
      $('banner').classList.remove('hidden');
      if (holdMs) {
        RC.wait(holdMs / 1000).then(() => this.bannerHide());
      }
    },
    bannerHide() { $('banner').classList.add('hidden'); },

    letterbox(on) {
      $('letterbox').classList.toggle('on', !!on);
      $('roundInfo').classList.toggle('hidden', !!on && false);
    },

    roundInfo(round, total, themeName, themeSub) {
      $('roundInfo').classList.remove('hidden');
      $('roundInfo').innerHTML =
        `<h2>ROUND ${round}/${total}</h2><div class="sub">${themeName}</div><div class="sub" style="font-style:italic">"${themeSub}"</div>`;
    },

    scoreboard(standings) {
      const el = $('scoreboard');
      el.classList.remove('hidden');
      el.innerHTML = '<h3>STANDINGS</h3>' + standings.map((p, i) =>
        `<div class="sbrow ${p.isPlayer ? 'you' : ''}">
           <span class="nm">${i + 1}. ${p.name}</span><span class="pts">${p.score.toFixed(1)}</span>
         </div>`).join('');
    },

    outfitTags(items) {
      const el = $('outfitTags');
      if (!items || !items.length) { el.classList.add('hidden'); return; }
      el.classList.remove('hidden');
      const tags = new Set();
      items.forEach(it => it.tags.forEach(t => tags.add(t)));
      el.innerHTML = [...tags].sort().map(t => `<span>${t}</span>`).join('');
    },

    quote(jurorName, jurorRole, mark, text) {
      $('quoteJuror').textContent = `${jurorName} — ${jurorRole}`;
      $('quoteMark').textContent = mark == null ? '' : mark.toFixed(1);
      $('quoteText').textContent = `\u201C${text}\u201D`;
      $('quoteCard').classList.remove('hidden');
    },
    quoteHide() { $('quoteCard').classList.add('hidden'); },

    flash() {
      const f = $('flash');
      f.classList.add('on');
      RC.wait(.09).then(() => f.classList.remove('on'));
    },

    /* ---------------- dresser ---------------- */
    currentTab: null,
    picks: {},

    openDresser(cats, onPick, onSend) {
      this.picks = {};
      this._cats = cats;
      $('dresser').classList.remove('hidden');
      const tabs = $('dresserCats');
      tabs.innerHTML = '';
      cats.forEach((c, i) => {
        const el = document.createElement('div');
        el.className = 'catTab';
        el.dataset.cat = c.id;
        el.innerHTML = `${c.name}<span class="st" data-st="${c.id}">—</span>`;
        el.onclick = () => { this.currentTab = c.id; this._refresh(); };
        tabs.appendChild(el);
      });
      this.currentTab = cats[0].id;
      document.getElementById('btnSend').onclick = () => onSend(this.picks);
      document.getElementById('btnRandom').onclick = () => {
        cats.forEach(c => {
          const it = RC.pick(c.items);
          this.picks[c.id] = it;
        });
        this._refresh();
        onPick(null, true);
      };
      this._onPick = onPick;
      this._refresh();
    },

    _refresh() {
      document.querySelectorAll('.catTab').forEach(el => {
        const cid = el.dataset.cat;
        el.classList.toggle('active', cid === this.currentTab);
        el.querySelector('.st').textContent = this.picks[cid] ? '\u2713' : '—';
      });
      const cat = this._cats.find(c => c.id === this.currentTab);
      const grid = $('dresserGrid');
      grid.innerHTML = '';
      cat.items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'itemCard' + (this.picks[cat.id] === it ? ' sel' : '');
        card.innerHTML = `<h4>${it.name}</h4><div class="fl">${it.flavor}</div>
          <div class="tg">${it.tags.map(t => `<b>${t}</b>`).join('')}</div>`;
        card.onclick = () => {
          this.picks[cat.id] = it;
          this._refresh();
          this._onPick(cat.id, it);
        };
        grid.appendChild(card);
      });
      const cnt = Object.keys(this.picks).length;
      $('pickedList').innerHTML = cnt < 5
        ? `FILTH FASHION: <b>${cnt}/5</b> — pick one from every category`
        : `OUTFIT SEALED: <b>${Object.values(this.picks).map(i => i.name).join(' + ')}</b>`;
      $('btnSend').disabled = cnt < 5;
    },

    closeDresser() { $('dresser').classList.add('hidden'); },

    /* ---------------- round results ---------------- */
    showRoundBoard(title, standings, isFinal) {
      $('roundBoardTitle').textContent = title;
      const rows = $('roundBoardRows');
      rows.innerHTML = '';
      standings.forEach((p, i) => {
        const r = document.createElement('div');
        r.className = 'fbRow' + (i === 0 ? ' winner' : '') + (p.isPlayer ? ' you' : '');
        r.innerHTML = `<span class="rank">#${i + 1}</span>
          <span class="nm">${p.name}</span>
          <span class="pts">${p.score.toFixed(1)}</span>
          ${p.roundScore !== undefined ? `<span style="color:#6a8a2a;font-size:13px">+${p.roundScore.toFixed(1)} this round</span>` : ''}`;
        rows.appendChild(r);
      });
      $('btnNext').textContent = isFinal ? 'THE VERDICT, FINAL →' : 'NEXT ROUND →';
      $('roundBoard').classList.remove('hidden');
    },
    hideRoundBoard() { $('roundBoard').classList.add('hidden'); },

    finale(winner, standings) {
      $('finaleKicker').textContent = 'THE FYLTH AGENDA CONCLUDES';
      $('finaleKicker').textContent = 'THE FILTH AGENDA CONCLUDES';
      $('finaleName').textContent = winner.name;
      $('finaleSub').textContent = winner.isPlayer
        ? 'THE CROWN IS YOURS, VERMIN. THE JURY HATES THEMSELVES FOR LOVING YOU.'
        : `${winner.name} WINS THE CROWN. YOU ARE INVITED BACK. THAT IS ALSO THE PUNISHMENT.`;
      const rows = $('finaleRows');
      rows.innerHTML = '';
      standings.forEach((p, i) => {
        const r = document.createElement('div');
        r.className = 'fbRow' + (i === 0 ? ' winner' : '') + (p.isPlayer ? ' you' : '');
        r.innerHTML = `<span class="rank">#${i + 1}</span>
          <span class="nm">${p.name}</span>
          <span class="pts">${p.score.toFixed(1)}</span>`;
        rows.appendChild(r);
      });
      $('finale').classList.remove('hidden');
    },
    finaleHide() { $('finale').classList.add('hidden'); },

    hideTitle() { $('titleScreen').classList.add('hidden'); },
    showTitle() {
      $('titleScreen').classList.remove('hidden');
    },
    setName(n) { $('playerName').textContent = n; },

    err(msg) {
      const el = $('errlog');
      const d = document.createElement('div');
      d.textContent = '[err] ' + msg;
      el.appendChild(d);
      while (el.children.length > 4) el.removeChild(el.firstChild);
    }
  };
})();
