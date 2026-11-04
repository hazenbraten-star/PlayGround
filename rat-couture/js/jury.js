/* ================= jury.js — judging brain (scoring + AI stylists) ==== */
(function () {
  const RC = window.RC;

  /* per-juror mark for one contestant */
  RC.judgeOutfit = function (items, theme, juror) {
    let base = 0, flair = 0;
    items.forEach(it => {
      let best = 0;
      it.tags.forEach(t => { best = Math.max(best, theme.weights[t] || 0); });
      base += best;
      flair += it.flair;
    });
    /* coherence: shared tags between chosen pieces */
    let coh = 0;
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const sh = items[i].tags.filter(t => items[j].tags.includes(t)).length;
        coh += sh * .45;
      }
    let fav = 0;
    items.forEach(it => it.tags.forEach(t => {
      fav += (juror.fav && juror.fav[t]) || 0;
      fav += (juror.hates && juror.hates[t]) || 0;
    }));
    const chaos = (Math.random() - .5) * 1.7 + Math.sin(items.length * 13.7 + theme.id.length) * .3;
    const raw = base * .30 + coh * .42 + flair * .62 + fav + chaos;
    return RC.clamp(Math.round(raw * 10) / 10, 1, 9.9);
  };

  RC.jurorLine = function (juror, mark) {
    const t = juror.tiers.find(t => mark >= t.min) || juror.tiers[juror.tiers.length - 1];
    return RC.pick(t.lines);
  };

  /* AI stylist: softmax over theme-fit + flair + greed, avoid duplicates */
  RC.aiPickOutfit = function (cats, theme, usedItems) {
    const picks = {};
    cats.forEach(cat => {
      const scored = cat.items.map(it => {
        if (usedItems.has(it.id)) return { it, w: -1e9 };
        let w = 0;
        it.tags.forEach(t => { w += theme.weights[t] || 0; });
        w += it.flair * 1.4 + Math.abs(RC.rand(0, 2.2)) - .8;
        return { it, w: Math.exp(w) };
      });
      const total = scored.reduce((s, o) => s + Math.max(o.w, 0), 0);
      let r = Math.random() * total;
      let chosen = scored.find(o => o.w > 0);
      for (const o of scored) {
        if (o.w <= 0) continue;
        r -= o.w;
        if (r <= 0) { chosen = o; break; }
      }
      picks[cat.id] = chosen.it;
      usedItems.add(chosen.it.id);
    });
    return picks;
  };
})();
