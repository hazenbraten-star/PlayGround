/* tiny error tracer: stack first line into #errlog */
window.addEventListener('error', e => {
  const st = (e.error && e.error.stack) || '';
  RC.ui && RC.ui.err && RC.ui.err(e.message + ' @ ' + st.split('\n').slice(1, 3).map(s => s.trim().slice(0, 140)).join(' || '));
});
