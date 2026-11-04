// Fashion data: categories, item pools, themes.

export const CATEGORIES = [
  { key: 'accessories', label: 'Accessoires' },
  { key: 'pants', label: 'Hosen' },
  { key: 'socks', label: 'Socken' },
  { key: 'shoes', label: 'Schuhe' },
  { key: 'tops', label: 'Oberteile' },
  { key: 'glasses', label: 'Brillen' },
  { key: 'hats', label: 'Hüte' },
  { key: 'piercings', label: 'Piercings' },
  { key: 'underwear', label: 'Unterwäsche' },
  { key: 'tattoos', label: 'Tattoos' },
];

export const THEMES = [
  { title: 'Barocke Strandparty für Untote', tags: ['baroque','beach','gothic','macabre','ornate'] },
  { title: 'Cyberpunk-Bauernhochzeit', tags: ['cyberpunk','rustic','futuristic','folk','neon'] },
  { title: 'Perverse victorianische Teeparty', tags: ['victorian','tea','perverse','ornate','lace'] },
  { title: 'Apokalyptische Strandmode für Adelige', tags: ['apocalypse','beach','noble','ruined','luxury'] },
  { title: 'Fetisch-Kloster Chic', tags: ['fetish','monastic','leather','modest','dark'] },
  { title: 'Römische Rave-Nacht', tags: ['roman','rave','ancient','neon','party'] },
  { title: 'Steampunk Strandnixe', tags: ['steampunk','beach','victorian','brass','marine'] },
  { title: 'Gothic Strandvolleyball', tags: ['gothic','beach','sport','dark','dramatic'] },
  { title: 'Renaissance Rave im Weltall', tags: ['renaissance','rave','space','ornate','neon'] },
  { title: 'Edle Bettler-Oper', tags: ['noble','poor','opera','dramatic','torn'] },
  { title: 'Neon-Schamanen-Ritual', tags: ['neon','shaman','tribal','spiritual','glow'] },
  { title: 'Absurde Adelsjagd im Regenwald', tags: ['noble','jungle','absurd','colonial','safari'] },
];

const T = (arr) => arr;

function item(id, name, color, tags) { return { id, name, color, tags }; }

export const ITEM_POOLS = {
  accessories: [
    item('a1','Goldene Halskette','#d4af37',['baroque','noble','ornate','luxury']),
    item('a2','Perlenkette','#f5f5dc',['victorian','noble','tea','lace']),
    item('a3','Lederarmband mit Nieten','#222',['fetish','punk','dark','leather']),
    item('a4','Seidenfächer','#ff69b4',['baroque','noble','tea','ornate']),
    item('a5','Neonarmreif','#00ffcc',['cyberpunk','rave','neon','party']),
    item('a6','Knochenanhänger','#e0e0e0',['macabre','gothic','tribal','shaman']),
    item('a7','Federschmuck','#8b4513',['tribal','shaman','jungle','ancient']),
    item('a8','Kristallamulett','#9370db',['spiritual','gothic','ornate','renaissance']),
    item('a9','Spitzenhandschuhe','#fff',['victorian','tea','lace','noble']),
    item('a10','Kettenhemd','#708090',['roman','ancient','noble','macabre']),
    item('a11','Samttasche','#800080',['baroque','noble','luxury','opera']),
    item('a12','Silberbrosche','#c0c0c0',['victorian','renaissance','ornate','noble']),
    item('a13','Neonhalsband','#ff00ff',['cyberpunk','fetish','neon','rave']),
    item('a14','Rosenkranz','#f5f5f5',['monastic','spiritual','modest','dark']),
    item('a15','Bronzegürtel','#cd7f32',['roman','ancient','steampunk','brass']),
    item('a16','Zerrissenes Halstuch','#556b2f',['apocalypse','ruined','poor','torn']),
    item('a17','Hologramm-Schärpe','#00ffff',['space','cyberpunk','futuristic','neon']),
    item('a18','Korallenkette','#ff7f50',['marine','beach','ancient','tribal']),
  ],
  pants: [
    item('p1','Barocke Kniebundhose','#8b0000',['baroque','noble','ornate']),
    item('p2','Cyber-Leggings','#1a1a2e',['cyberpunk','futuristic','neon']),
    item('p3','Zerrissene Jeans','#4682b4',['apocalypse','ruined','punk','torn']),
    item('p4','Victorianische Reithose','#5d4037',['victorian','noble','colonial']),
    item('p5','Lederhose','#8d6e63',['fetish','rustic','folk','leather']),
    item('p6','Römische Tunika-Hose','#f5deb3',['roman','ancient','modest']),
    item('p7','Steampunk Pluderhose','#b8860b',['steampunk','brass','victorian']),
    item('p8','Gothic Netzstrumpfhose','#2f2f2f',['gothic','dark','fetish','dramatic']),
    item('p9','Renaissance Hosenpuff','#daa520',['renaissance','ornate','noble']),
    item('p10','Astronautenanzug-Hose','#e0e0e0',['space','futuristic','cyberpunk']),
    item('p11','Mönchsgewand-Hose','#696969',['monastic','modest','spiritual']),
    item('p12','Jungle-Cargo','#228b22',['jungle','safari','colonial','rustic']),
    item('p13','Opern-Pumphose','#9400d3',['opera','noble','dramatic','ornate']),
    item('p14','Strandshorts','#00ced1',['beach','sport','marine']),
    item('p15','Zeremonielle Lendenschurz','#cd853f',['tribal','shaman','ancient']),
  ],
  socks: [
    item('s1','Seidenstrümpfe','#ffe4e1',['baroque','noble','victorian','lace']),
    item('s2','Neon-Socken','#39ff14',['cyberpunk','rave','neon','party']),
    item('s3','Zerlumpte Wollsocken','#a9a9a9',['apocalypse','poor','ruined','torn']),
    item('s4','Spitzenstrümpfe','#fff0f5',['victorian','tea','lace','noble']),
    item('s5','Lederstrümpfe','#3e2723',['fetish','leather','dark']),
    item('s6','Römische Sandalensocken','#deb887',['roman','ancient','modest']),
    item('s7','Brass-mesh Socken','#b87333',['steampunk','brass','victorian']),
    item('s8','Netzstrümpfe','#1c1c1c',['gothic','fetish','dark','dramatic']),
    item('s9','Renaissance Seidensocken','#ffd700',['renaissance','noble','ornate']),
    item('s10','Anti-Grav Socken','#b0e0e6',['space','futuristic','cyberpunk']),
    item('s11','Mönchssocken','#d3d3d3',['monastic','modest','spiritual']),
    item('s12','Jungle-Leinensocken','#8fbc8f',['jungle','safari','rustic']),
    item('s13','Opern-Seidenstrümpfe','#dda0dd',['opera','noble','dramatic']),
    item('s14','Strandsocken','#40e0d0',['beach','sport','marine']),
    item('s15','Tribal-Fußwickel','#a0522d',['tribal','shaman','ancient']),
  ],
  shoes: [
    item('sh1','Barocke Schnallenschuhe','#8b0000',['baroque','noble','ornate']),
    item('sh2','Cyber-Stiefel','#0a0a0a',['cyberpunk','futuristic','neon']),
    item('sh3','Zerfallene Stiefel','#556b2f',['apocalypse','ruined','poor']),
    item('sh4','Victorianische Stiefeletten','#3e2723',['victorian','noble','colonial']),
    item('sh5','Lederstiefel','#2f2f2f',['fetish','leather','dark']),
    item('sh6','Römische Sandalen','#deb887',['roman','ancient','modest']),
    item('sh7','Steampunk Stiefel','#8b4513',['steampunk','brass','victorian']),
    item('sh8','Gothic Plateauschuhe','#1c1c1c',['gothic','dramatic','dark']),
    item('sh9','Renaissance Pantoffeln','#daa520',['renaissance','noble','ornate']),
    item('sh10','Moon-Boots','#e0ffff',['space','futuristic','cyberpunk']),
    item('sh11','Mönchssandalen','#8b7355',['monastic','modest','spiritual']),
    item('sh12','Jungle-Stiefel','#228b22',['jungle','safari','colonial']),
    item('sh13','Opern-Pumps','#ff1493',['opera','noble','dramatic']),
    item('sh14','Strandsandalen','#00ced1',['beach','sport','marine']),
    item('sh15','Tribal-Fußschmuck','#a0522d',['tribal','shaman','ancient']),
  ],
  tops: [
    item('t1','Barockes Wams','#8b0000',['baroque','noble','ornate']),
    item('t2','Cyber-Jacke','#1a1a2e',['cyberpunk','futuristic','neon']),
    item('t3','Zerrissenes Hemd','#4682b4',['apocalypse','ruined','punk','torn']),
    item('t4','Victorianische Bluse','#f5f5dc',['victorian','tea','lace','noble']),
    item('t5','Lederkorsett','#2f2f2f',['fetish','leather','dark']),
    item('t6','Römische Tunika','#f5deb3',['roman','ancient','modest']),
    item('t7','Steampunk Weste','#b8860b',['steampunk','brass','victorian']),
    item('t8','Gothic Spitzenbluse','#1c1c1c',['gothic','dark','dramatic','lace']),
    item('t9','Renaissance Doppelwams','#daa520',['renaissance','noble','ornate']),
    item('t10','Raumanzug-Oberteil','#e0e0e0',['space','futuristic','cyberpunk']),
    item('t11','Mönchshabit','#696969',['monastic','modest','spiritual']),
    item('t12','Safari-Hemd','#8fbc8f',['jungle','safari','colonial','rustic']),
    item('t13','Opern-Cape','#9400d3',['opera','noble','dramatic','ornate']),
    item('t14','Strand-Bikini-Top','#ff69b4',['beach','sport','marine']),
    item('t15','Tribal-Brustpanzer','#a0522d',['tribal','shaman','ancient']),
  ],
  glasses: [
    item('g1','Barocke Lorgnette','#d4af37',['baroque','noble','ornate']),
    item('g2','Cyber-Visor','#00ffcc',['cyberpunk','futuristic','neon']),
    item('g3','Zerkratzte Brille','#a9a9a9',['apocalypse','ruined','poor']),
    item('g4','Victorianische Kneifer','#3e2723',['victorian','tea','noble']),
    item('g5','Leder-Augenmaske','#2f2f2f',['fetish','leather','dark']),
    item('g6','Römische Sonnenbrille','#deb887',['roman','ancient','marine']),
    item('g7','Steampunk Monokel','#b87333',['steampunk','brass','victorian']),
    item('g8','Gothic Netzbrille','#1c1c1c',['gothic','dark','dramatic']),
    item('g9','Renaissance Lupe','#daa520',['renaissance','noble','ornate']),
    item('g10','Holo-Visier','#00ffff',['space','futuristic','cyberpunk']),
    item('g11','Mönchs-Kapuze-Brille','#696969',['monastic','modest','spiritual']),
    item('g12','Dschungel-Sonnenbrille','#228b22',['jungle','safari','colonial']),
    item('g13','Opern-Fernglas','#9400d3',['opera','noble','dramatic']),
    item('g14','Strand-Sonnenbrille','#00ced1',['beach','sport','marine']),
    item('g15','Tribal-Farbschutz','#a0522d',['tribal','shaman','ancient']),
  ],
  hats: [
    item('h1','Barocke Perücke','#ffd700',['baroque','noble','ornate']),
    item('h2','Cyber-Kappe','#1a1a2e',['cyberpunk','futuristic','neon']),
    item('h3','Zerfetzte Mütze','#556b2f',['apocalypse','ruined','poor']),
    item('h4','Victorianischer Topfhut','#3e2723',['victorian','noble','colonial']),
    item('h5','Leder-Maske','#2f2f2f',['fetish','leather','dark']),
    item('h6','Römischer Lorbeerkranz','#deb887',['roman','ancient','noble']),
    item('h7','Steampunk Zylinder','#8b4513',['steampunk','brass','victorian']),
    item('h8','Gothic Hut mit Schleier','#1c1c1c',['gothic','dark','dramatic']),
    item('h9','Renaissance Barett','#daa520',['renaissance','noble','ornate']),
    item('h10','Raumhelm','#e0e0e0',['space','futuristic','cyberpunk']),
    item('h11','Mönchskapuze','#696969',['monastic','modest','spiritual']),
    item('h12','Safari-Hut','#8fbc8f',['jungle','safari','colonial']),
    item('h13','Opern-Diadem','#9400d3',['opera','noble','dramatic','ornate']),
    item('h14','Strandhut','#00ced1',['beach','sport','marine']),
    item('h15','Tribal-Federschmuck','#a0522d',['tribal','shaman','ancient']),
  ],
  piercings: [
    item('pi1','Goldener Nasenring','#d4af37',['baroque','noble','tribal']),
    item('pi2','Neon-Lippenring','#00ffcc',['cyberpunk','neon','rave','fetish']),
    item('pi3','Rostiger Ohrplug','#a9a9a9',['apocalypse','ruined','punk']),
    item('pi4','Victorianische Brosche am Ohr','#f5f5dc',['victorian','noble','lace']),
    item('pi5','Leder-Augenbrauenring','#2f2f2f',['fetish','leather','dark']),
    item('pi6','Römischer Ohrring','#deb887',['roman','ancient','noble']),
    item('pi7','Steampunk Zungenpiercing','#b87333',['steampunk','brass','futuristic']),
    item('pi8','Gothic Labret','#1c1c1c',['gothic','dark','dramatic']),
    item('pi9','Renaissance Perle am Ohr','#daa520',['renaissance','noble','ornate']),
    item('pi10','Holo-Piercing','#00ffff',['space','cyberpunk','futuristic']),
    item('pi11','Mönchs-Ohrplug','#696969',['monastic','modest','spiritual']),
    item('pi12','Jungle-Tusk','#228b22',['jungle','tribal','shaman']),
    item('pi13','Opern-Ohrring','#9400d3',['opera','noble','dramatic']),
    item('pi14','Strand-Bauchnabelpiercing','#00ced1',['beach','sport','marine']),
    item('pi15','Tribal-Nasenbein','#a0522d',['tribal','shaman','ancient']),
  ],
  underwear: [
    item('u1','Seiden-Unterhose','#ffe4e1',['baroque','noble','victorian','lace']),
    item('u2','Neon-String','#ff00ff',['cyberpunk','fetish','neon','rave']),
    item('u3','Zerlumpte Unterwäsche','#a9a9a9',['apocalypse','poor','ruined']),
    item('u4','Victorianisches Korsett','#f5f5dc',['victorian','tea','lace','noble']),
    item('u5','Leder-BH','#2f2f2f',['fetish','leather','dark']),
    item('u6','Römische Subligaculum','#deb887',['roman','ancient','modest']),
    item('u7','Steampunk Korsett','#b8860b',['steampunk','brass','victorian']),
    item('u8','Gothic Corsage','#1c1c1c',['gothic','dark','dramatic']),
    item('u9','Renaissance Mieder','#daa520',['renaissance','noble','ornate']),
    item('u10','Raumwäsche','#e0e0e0',['space','futuristic','cyberpunk']),
    item('u11','Mönchsgewand','#696969',['monastic','modest','spiritual']),
    item('u12','Jungle-Lendenschurz','#8fbc8f',['jungle','tribal','safari']),
    item('u13','Opern-Unterrock','#dda0dd',['opera','noble','dramatic']),
    item('u14','Strand-Bikini','#ff69b4',['beach','sport','marine']),
    item('u15','Tribal-Hüftschurz','#a0522d',['tribal','shaman','ancient']),
  ],
  tattoos: [
    item('ta1','Barocke Lilien-Tattoos','#8b0000',['baroque','noble','ornate']),
    item('ta2','Cyber-Circuit-Tattoos','#00ffcc',['cyberpunk','futuristic','neon']),
    item('ta3','Zerkratzte Narben-Tattoos','#556b2f',['apocalypse','ruined','punk']),
    item('ta4','Victorianische Rosen-Tattoos','#ff69b4',['victorian','tea','noble','lace']),
    item('ta5','Tribal-Leder-Tattoos','#2f2f2f',['fetish','tribal','dark']),
    item('ta6','Römische Lorbeer-Tattoos','#deb887',['roman','ancient','noble']),
    item('ta7','Steampunk Zahnrad-Tattoos','#b87333',['steampunk','brass','victorian']),
    item('ta8','Gothic Dornen-Tattoos','#1c1c1c',['gothic','dark','dramatic']),
    item('ta9','Renaissance Ornament-Tattoos','#daa520',['renaissance','noble','ornate']),
    item('ta10','Holo-Sternkarten-Tattoos','#00ffff',['space','cyberpunk','futuristic']),
    item('ta11','Mönchs-Mantra-Tattoos','#696969',['monastic','modest','spiritual']),
    item('ta12','Jungle-Tier-Tattoos','#228b22',['jungle','tribal','shaman']),
    item('ta13','Opern-Masken-Tattoos','#9400d3',['opera','noble','dramatic']),
    item('ta14','Wellen-Tattoos','#00ced1',['beach','sport','marine']),
    item('ta15','Schamanen-Spirit-Tattoos','#a0522d',['tribal','shaman','ancient','spiritual']),
  ],
};

export const OPPONENTS = ['Luna','Rex','Mira','Otto'];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOptions(pool, n = 5) {
  return shuffle(pool).slice(0, n);
}

export function scoreItem(theme, item) {
  let score = 5;
  for (const tag of item.tags) if (theme.tags.includes(tag)) score += 4;
  score += Math.floor(Math.random() * 3);
  return score;
}

export function scoreOutfit(theme, outfit) {
  let total = 0;
  for (const cat of CATEGORIES) {
    const it = outfit[cat.key];
    if (it) total += scoreItem(theme, it);
  }
  return total;
}

export function bestChoice(theme, options) {
  // pick option with max score (with small noise)
  let best = options[0];
  let bestScore = -1;
  for (const opt of options) {
    const s = scoreItem(theme, opt) + Math.random() * 2;
    if (s > bestScore) { bestScore = s; best = opt; }
  }
  return best;
}