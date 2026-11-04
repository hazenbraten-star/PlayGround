/* ================= util: math + promise-based tweens ================= */
(function () {
  const RC = window.RC = {};

  RC.rand = (a, b) => a + Math.random() * (b - a);
  RC.ri = (a, b) => Math.floor(RC.rand(a, b + 1));
  RC.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  RC.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  RC.lerp = (a, b, t) => a + (b - a) * t;
  RC.smooth = t => { t = RC.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  RC.shuffled = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ---------- tween engine, driven by the main loop ---------- */
  RC.Tweens = {
    list: [],
    add(t) {
      t = Object.assign({ t: 0, dur: 1, ease: RC.smooth, onUpdate: () => {}, resolve: null }, t);
      this.list.push(t);
      return new Promise(res => { t.resolve = res; });
    },
    update(dt) {
      let i = 0;
      while (i < this.list.length) {
        const tw = this.list[i];
        tw.t += dt;
        const k = RC.clamp(tw.t / tw.dur, 0, 1);
        try { tw.onUpdate(tw.ease(k), k); } catch (e) { console.error(e); }
        if (k >= 1) {
          this.list.splice(i, 1);
          if (tw.resolve) tw.resolve();
        } else i++;
      }
    },
    clear() { this.list = []; },
    /* resolve everything at once (skip button) */
    finishAll() {
      const L = this.list; this.list = [];
      L.forEach(tw => { try { tw.onUpdate(1, 1); } catch (e) {} if (tw.resolve) tw.resolve(); });
    }
  };

  RC.wait = ms => RC.Tweens.add({ dur: ms / 1000, onUpdate: () => {} });

  /* tween any object property */
  RC.tweenProp = function (obj, prop, to, dur, ease) {
    const from = obj[prop];
    return RC.Tweens.add({
      dur, ease,
      onUpdate: k => { obj[prop] = RC.lerp(from, to, k); }
    });
  };

  /* tween a THREE.Vector3 */
  RC.tweenVec = function (v, to, dur, ease) {
    const fx = v.x, fy = v.y, fz = v.z;
    return RC.Tweens.add({
      dur, ease,
      onUpdate: k => { v.set(RC.lerp(fx, to.x, k), RC.lerp(fy, to.y, k), RC.lerp(fz, to.z, k)); }
    });
  };

  /* build a disposable THREE.Group helper */
  RC.mesh = function (geo, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };

  /* dispose geometries under a node (materials are cached globally) */
  RC.disposeTree = function (root) {
    if (!root || !root.traverse) { console.warn('[RC] disposeTree skipped non-object'); return; }
    root.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.isPoints) o.material.dispose();
    });
    if (root.parent) root.parent.remove(root);
  };
})();
