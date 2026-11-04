/* ============================================================
   MERGE & FALL — data: regimes, tiers, history notes, events
   ============================================================ */
'use strict';

const COLS = 8;
const ROWS = 7;
const CELLS = COLS * ROWS;
const INK_MAX = 240;
const INK_REGEN = 5;
const SAVE_KEY = 'merge-and-fall-v1';
const CHAIN_ORDER = ['hitler', 'goebbels', 'himmler'];

const CHAINS = {
  hitler: {
    id: 'hitler',
    short: 'HITLER',
    name: 'Adolf Hitler',
    regime: 'The Hitler Regime',
    color: '#b84a42',
    accent: '#e07a63',
    stages: [
      'Agitator', 'Party Recruit', 'Beer-Hall Firebrand', 'Putschist',
      'Prison Pamphleteer', 'Party Leader', 'Election Spoiler', 'Reichstag Deputy',
      'Chancellor', 'Emergency Decreer', 'Enabling Act', 'Absolute Ruler',
      'Warmonger', 'Occupier', 'Total War', 'Cornered',
      'Bunker', 'Downfall'
    ],
    facts: [
      {
        level: 4,
        title: 'The Failed Putsch',
        text: 'Hitler’s 1923 Beer Hall Putsch failed. Convicted of treason, he served about nine months and used the trial as publicity for the Nazi movement.'
      },
      {
        level: 10,
        title: 'The Emergency Decrees',
        text: 'After the Reichstag fire in February 1933, emergency decrees suspended civil liberties. The Enabling Act followed in March, letting Hitler legislate without parliament.'
      },
      {
        level: 13,
        title: 'War and Mass Murder',
        text: 'The invasion of Poland in September 1939 began the Second World War. The regime’s racial ideology drove the Holocaust and mass murder across occupied Europe.'
      },
      {
        level: 18,
        title: 'The Bunker',
        text: 'Hitler killed himself in his Berlin bunker on 30 April 1945 as Soviet forces closed in. Nazi Germany surrendered days later. The regime’s crimes did not end with him.'
      }
    ]
  },

  goebbels: {
    id: 'goebbels',
    short: 'GOEBBELS',
    name: 'Joseph Goebbels',
    regime: 'The Propaganda Ministry',
    color: '#c49a3d',
    accent: '#e7bf6a',
    stages: [
      'Failed Novelist', 'Party Recruit', 'Street Agitator', 'Gauleiter',
      'Pamphleteer', 'Reichstag Deputy', 'Propaganda Chief', 'Minister of Lies',
      'Censor', 'Book Burner', 'Radio Voice', 'Rally Maestro',
      'Big Lie', 'Total War', 'Siege Minister', 'Cornered',
      'Bunker', 'Downfall'
    ],
    facts: [
      {
        level: 5,
        title: 'The Failed Writer',
        text: 'Goebbels joined the Nazi Party in 1924 after failed attempts at writing fiction and plays. He became one of the movement’s most skilled and ruthless propagandists.'
      },
      {
        level: 10,
        title: 'Book Burnings',
        text: 'In 1933 the regime staged public book burnings. Goebbels’ ministry took control of the press, radio, film and cultural life, turning them into instruments of propaganda.'
      },
      {
        level: 13,
        title: 'The Big Lie',
        text: 'Goebbels’ propaganda blended the “Big Lie” technique with the 1943 “total war” speech, mobilising the population while concealing the regime’s mass murder.'
      },
      {
        level: 18,
        title: 'The Bunker',
        text: 'In the Berlin bunker in 1945, Goebbels and his wife killed their six children and then themselves rather than surrender. His propaganda could not survive the defeat.'
      }
    ]
  },

  himmler: {
    id: 'himmler',
    short: 'HIMMLER',
    name: 'Heinrich Himmler',
    regime: 'The SS Apparatus',
    color: '#6f9aa4',
    accent: '#83bcc6',
    stages: [
      'Cadet', 'Party Runner', 'Chicken Farmer', 'Party Clerk',
      'Bodyguard', 'SS Organizer', 'Police Infiltrator', 'Reichsführer-SS',
      'Secret Police Chief', 'Camp Inspector', 'Terror Architect', 'Occupier',
      'Mass Murderer', 'Empire of Camps', 'Cornered', 'Disguised',
      'Captured', 'Downfall'
    ],
    facts: [
      {
        level: 6,
        title: 'The SS Organizer',
        text: 'Himmler joined the SS in 1925 and became Reichsführer-SS in 1929. He expanded a small bodyguard unit into a vast organisation loyal to the Nazi regime.'
      },
      {
        level: 9,
        title: 'Police and Terror',
        text: 'After 1933 Himmler built the SS and police apparatus, helped open the first concentration camps, and ran the secret police. Terror became an instrument of state policy.'
      },
      {
        level: 13,
        title: 'Architect of Genocide',
        text: 'Himmler was a central architect of the Holocaust and the camp system, directing mass murder across occupied Europe. The scale of the crime is central to the historical record.'
      },
      {
        level: 18,
        title: 'The Captured Bureaucrat',
        text: 'Captured by British forces in May 1945, Himmler killed himself with a cyanide capsule before he could be tried. He escaped a courtroom, not the verdict of history.'
      }
    ]
  }
};

/* ---------------- portraits (original stylised caricatures) ---------------- */

function portraitSVG(id, level = 1) {
  const hi = level >= 12;
  if (id === 'hitler') {
    return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true">
      <rect width="64" height="64" fill="#b99a72"/>
      <circle cx="32" cy="30" r="23" fill="#cbb08a" opacity=".38"/>
      <path d="M7 66 Q8 45 32 45 Q56 45 57 66Z" fill="#292326"/>
      <path d="M32 45 L24 65 L28.5 66 L32 53 L35.5 66 L40 65Z" fill="#1d191b"/>
      <path d="M27.5 45 L32 52 L36.5 45 L34 42.5 L30 42.5Z" fill="#e5dac4"/>
      <path d="M31 49 L33 49 L35 62.5 L32 65 L29 62.5Z" fill="#8f2626"/>
      <rect x="28.5" y="38" width="7" height="8" fill="#c9a175"/>
      <ellipse cx="18.5" cy="29" rx="2.3" ry="3.8" fill="#cfa579"/>
      <ellipse cx="45.5" cy="29" rx="2.3" ry="3.8" fill="#cfa579"/>
      <ellipse cx="32" cy="28" rx="13" ry="16" fill="#d9b184"/>
      <path d="M18.2 27 Q17 10 33 9 Q48 10 46 27 Q44 17.5 37 15.2 Q26 13.4 22 22Z" fill="#2a211d"/>
      <path d="M21 18 Q26 13.4 34 13.2" stroke="#3d312a" stroke-width="1.1" fill="none"/>
      <path d="M24 24.4 Q27 23.2 30 24.4" stroke="#3a2b22" stroke-width="1.3" fill="none"/>
      <path d="M34 24.4 Q37 23.2 40 24.4" stroke="#3a2b22" stroke-width="1.3" fill="none"/>
      <ellipse cx="27" cy="27.6" rx="1.5" ry="1.1" fill="#2a211d"/>
      <ellipse cx="37" cy="27.6" rx="1.5" ry="1.1" fill="#2a211d"/>
      <path d="M32 28 L30.9 33.8 Q32 34.8 33.1 33.8" stroke="#b0845e" stroke-width="1" fill="none"/>
      <rect x="27.4" y="35" width="9.2" height="3.2" rx="1" fill="#2a211d"/>
      <path d="M29 41 Q32 42.3 35 41" stroke="#8a5a45" stroke-width="1.1" fill="none"/>
      <path d="M23 36 Q24 40 27 42" stroke="#bd9068" stroke-width=".7" fill="none" opacity=".55"/>
      ${hi ? '<rect x="37.5" y="50" width="4" height="1.8" fill="#c9a45f"/><rect x="39" y="54" width="1" height="7" fill="#c9a45f"/>' : ''}
    </svg>`;
  }

  if (id === 'goebbels') {
    return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true">
      <rect width="64" height="64" fill="#b49a70"/>
      <circle cx="32" cy="30" r="22" fill="#c9ad83" opacity=".4"/>
      <path d="M7 66 Q9 45 32 45 Q55 45 57 66Z" fill="#2b2628"/>
      <path d="M32 45 L26 65 L29.5 66 L32 54 L34.5 66 L38 65Z" fill="#1d191b"/>
      <path d="M28.5 45 L32 51 L35.5 45 L33.5 42.5 L30.5 42.5Z" fill="#e8ddc7"/>
      <path d="M31.1 48 L32.9 48 L34 61 L32 64 L30 61Z" fill="#9a7424"/>
      <rect x="29" y="38" width="6" height="8" fill="#c69f76"/>
      <ellipse cx="20" cy="29" rx="2.1" ry="3.6" fill="#cba078"/>
      <ellipse cx="44" cy="29" rx="2.1" ry="3.6" fill="#cba078"/>
      <ellipse cx="32" cy="28.5" rx="11.6" ry="15.6" fill="#d8b184"/>
      <path d="M20.4 27.5 Q19.2 12.5 32 10.5 Q44.8 12.5 43.6 27.5 Q42 18 35 16.2 Q26 14.5 22.5 22.5Z" fill="#28211d"/>
      <path d="M22 22 Q25 16.5 33 15.6" stroke="#3d332c" stroke-width="1" fill="none"/>
      <path d="M25 25 Q27.5 23.7 30 25" stroke="#3a2b22" stroke-width="1.3" fill="none"/>
      <path d="M34 25 Q36.5 23.7 39 25" stroke="#3a2b22" stroke-width="1.3" fill="none"/>
      <ellipse cx="27.5" cy="28" rx="1.4" ry="1" fill="#2a211d"/>
      <ellipse cx="36.5" cy="28" rx="1.4" ry="1" fill="#2a211d"/>
      <path d="M32 28.5 L31 34 Q32 35 33 34" stroke="#ae835d" stroke-width=".9" fill="none"/>
      <path d="M29 38.5 Q32 39.3 35 38.5" stroke="#8a5a45" stroke-width="1.1" fill="none"/>
      <path d="M30.5 41 Q32 42 33.5 41" stroke="#9c6a52" stroke-width=".8" fill="none"/>
      <circle cx="39" cy="55" r="2.1" fill="#c9a45f" stroke="#7c5a24" stroke-width=".7"/>
      ${hi ? '<path d="M27 52 L29 54 L27 56" stroke="#e4c47d" stroke-width="1" fill="none"/>' : ''}
    </svg>`;
  }

  return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true">
    <rect width="64" height="64" fill="#9aa9a1"/>
    <circle cx="32" cy="30" r="22" fill="#b8c2b8" opacity=".38"/>
    <path d="M7 66 Q9 45 32 45 Q55 45 57 66Z" fill="#354246"/>
    <path d="M32 45 L24 65 L28 66 L32 54 L36 66 L40 65Z" fill="#252e31"/>
    <path d="M27 45 L32 51 L37 45 L35 42.5 L29 42.5Z" fill="#c9c3b3"/>
    <path d="M31 48 L33 48 L34.2 60 L32 62 L29.8 60Z" fill="#4b5d5f"/>
    <path d="M20 47 L22 55 L27 53 L25 45Z" fill="#2b3538"/>
    <path d="M44 47 L42 55 L37 53 L39 45Z" fill="#2b3538"/>
    <rect x="28.5" y="38" width="7" height="8" fill="#cba47b"/>
    <ellipse cx="18.8" cy="29" rx="2.2" ry="3.6" fill="#cba47b"/>
    <ellipse cx="45.2" cy="29" rx="2.2" ry="3.6" fill="#cba47b"/>
    <ellipse cx="32" cy="28.5" rx="12.4" ry="15.2" fill="#dcb98c"/>
    <path d="M19.5 26.5 Q18.5 13 32 11 Q45.5 13 44.5 26.5 Q42.5 18.5 36 17.5 Q27 16.5 22 23Z" fill="#3a332d"/>
    <path d="M21.5 20 Q25 15 32.5 14.5" stroke="#4d443b" stroke-width="1" fill="none"/>
    <circle cx="26.8" cy="29" r="4.1" fill="none" stroke="#2f2a24" stroke-width="1.15"/>
    <circle cx="37.2" cy="29" r="4.1" fill="none" stroke="#2f2a24" stroke-width="1.15"/>
    <path d="M30.9 28.6 Q32 27.6 33.1 28.6" stroke="#2f2a24" stroke-width="1" fill="none"/>
    <ellipse cx="26.8" cy="29.3" rx="1.1" ry=".9" fill="#2a211d"/>
    <ellipse cx="37.2" cy="29.3" rx="1.1" ry=".9" fill="#2a211d"/>
    <path d="M32 29 L31 34 Q32 34.8 33 34" stroke="#af855f" stroke-width=".9" fill="none"/>
    <path d="M29 38 Q32 38.7 35 38" stroke="#8a5a45" stroke-width="1" fill="none"/>
    <path d="M30 40.8 Q32 41.5 34 40.8" stroke="#9c6a52" stroke-width=".7" fill="none"/>
    <rect x="37" y="50" width="3.5" height="1.6" fill="#c9a45f"/>
    ${hi ? '<rect x="38.4" y="54" width="1" height="7" fill="#c9a45f"/><circle cx="39" cy="49.2" r="1.2" fill="#e4c47d"/>' : ''}
  </svg>`;
}

/* ---------------- historical interludes ---------------- */

const EVENTS = [
  {
    id: 'broadcast',
    tag: 'INTERLUDE · MEDIA',
    title: 'The Minister Takes the Airwaves',
    body: 'A propaganda broadcast is being prepared. In the archive, the signal is a loose thread waiting to be pulled.',
    quote: 'A lie repeated often enough becomes a policy. The record must be louder.',
    options: [
      { label: 'Jam the frequency', detail: '+90 ink', result: 'The broadcast collapses into static. Ink recovered.', apply(){ addInk(90); } },
      { label: 'Preserve the tape', detail: '+1,400 evidence', result: 'The recording is sealed as evidence. +1,400 evidence.', apply(){ addScore(1400); } }
    ]
  },
  {
    id: 'purge',
    tag: 'INTERLUDE · APPARATUS',
    title: 'A Rival Is Purged',
    body: 'The regime turns on itself. Himmler’s security men are moving against a rival faction, and the paperwork is flying.',
    quote: 'Tyranny consumes its own. The archive merely keeps the receipts.',
    options: [
      { label: 'Publish the infighting', detail: '+1,100 evidence', result: 'The split is documented. +1,100 evidence.', apply(){ addScore(1100); } },
      { label: 'Seize the files', detail: 'Next reconstructions spawn +1 tier · 30s', result: 'The files are seized. Reconstruction tier boosted for 30s.', apply(){ grantBuff('boostUntil', 30); } }
    ]
  },
  {
    id: 'press',
    tag: 'INTERLUDE · RESISTANCE',
    title: 'The Resistance Prints',
    body: 'A hidden press is running in a cellar. The regime’s censors are close; the choice is between hiding it and using it now.',
    quote: 'The archive has many rooms. Some of them are still dangerous.',
    options: [
      { label: 'Hide the press', detail: 'Free reconstruction · 20s', result: 'The press survives. Reconstruction is free for 20s.', apply(){ grantBuff('freeSpawnUntil', 20); } },
      { label: 'Flood the streets', detail: 'Double evidence · 25s', result: 'Leaflets flood the streets. Merge evidence doubled for 25s.', apply(){ grantBuff('doubleUntil', 25); } }
    ]
  },
  {
    id: 'bread',
    tag: 'INTERLUDE · HOME FRONT',
    title: 'Bread and Bayonets',
    body: 'The regime promised plenty and delivered queues. A warehouse of requisitioned grain has been found off the books.',
    quote: 'Every regime eventually meets the arithmetic of its own promises.',
    options: [
      { label: 'Open the granaries', detail: '+70 ink', result: 'The granaries open. +70 ink.', apply(){ addInk(70); } },
      { label: 'Record the failure', detail: '+900 evidence', result: 'The shortages are documented. +900 evidence.', apply(){ addScore(900); } }
    ]
  },
  {
    id: 'night',
    tag: 'INTERLUDE · SHELTER',
    title: 'The Long Night',
    body: 'A family is hiding in the archive’s back room. Searchlights sweep the street outside. The record can protect them.',
    quote: 'The smallest act of mercy can outlast the largest monument.',
    options: [
      { label: 'Shelter the hunted', detail: '+130 ink', result: 'They are safe for another night. +130 ink.', apply(){ addInk(130); } },
      { label: 'Keep the lamp burning', detail: 'Free fragment in every dossier', result: 'The lamp stays lit. A fragment is added to each dossier.', apply(){ spawnFree(1, 1); } }
    ]
  },
  {
    id: 'leak',
    tag: 'INTERLUDE · ARCHIVE',
    title: 'A Crate of Documents',
    body: 'A crate marked “do not open” has arrived. The seal is already broken. Somewhere inside is a page the regime wanted forgotten.',
    quote: 'Paper burns. Copies travel.',
    options: [
      { label: 'Unseal a dossier', detail: 'Declassify one historical note', result: 'A locked page slides free. A historical note is declassified.', apply(){ revealFact(); } },
      { label: 'Publish the leak', detail: '+1,600 evidence', result: 'The leak is published. +1,600 evidence.', apply(){ addScore(1600); } }
    ]
  },
  {
    id: 'uprising',
    tag: 'INTERLUDE · UPRISING',
    title: 'The Square Fills',
    body: 'Word travels faster than the censors. A crowd is gathering. For a moment, the regime’s certainty cracks.',
    quote: 'The archive is not neutral. It remembers who stood where.',
    options: [
      { label: 'Join the crowd', detail: 'Free reconstruction + double evidence · 20s', result: 'The square answers. Free reconstruction and double evidence for 20s.', apply(){ grantBuff('freeSpawnUntil', 20); grantBuff('doubleUntil', 20); } },
      { label: 'Guard the archive', detail: '+120 ink', result: 'The doors hold. +120 ink.', apply(){ addInk(120); } }
    ]
  },
  {
    id: 'trial',
    tag: 'INTERLUDE · RECORD',
    title: 'The Verdict Is Written',
    body: 'A researcher has reconstructed a page of testimony. It is not comfortable reading. It is necessary reading.',
    quote: 'History is not a court that closes. It is a record that keeps asking.',
    options: [
      { label: 'Read it aloud', detail: '+1,300 evidence', result: 'The testimony enters the record. +1,300 evidence.', apply(){ addScore(1300); } },
      { label: 'Cross-reference the files', detail: '+100 ink', result: 'The files align. +100 ink.', apply(){ addInk(100); } }
    ]
  }
];
