/* ================= data.js — all game content, fully data-driven ========
   Add a new theme / category / item / jury member / AI rat merely by
   pushing an object into the matching table. UI + judging read these. */
(function () {
  const RC = window.RC;

  /* ---------- style tags shared by themes, items, jury biases ---------- */
  RC.TAGS = ['PUNK', 'GLITZ', 'TRASH', 'DECAY', 'TOXIC', 'INDUSTRIAL', 'MEDICAL', 'MILITARY', 'BAROQUE', 'VERMIN'];

  /* ---------- runway themes (weights over tags) ---------- */
  RC.THEMES = [
    {
      id: 'toxic-chic', name: 'TOXIC CHIC', sub: 'poison is a palette',
      quote: ['MAGGOT VANDAME', 'You will drip contamination or you will drip off my list.'],
      weights: { TOXIC: 3.0, GLITZ: 2.0, MEDICAL: 1.5, TRASH: .6 }
    },
    {
      id: 'sewer-baroque', name: 'SEWER BAROQUE', sub: 'filth, but with drapes',
      quote: ['DOROTEA FLEABITE', 'Give me rococo rot. Give me curtains crying in the damp.'],
      weights: { BAROQUE: 3.0, DECAY: 2.2, GLITZ: 1.2, MILITARY: .5 }
    },
    {
      id: 'rust-rot', name: 'RUST & ROT', sub: 'the machine eating itself',
      quote: ['BIG WHISKER', 'Every surface must be either oxidizing or decomposing. Excellence.'],
      weights: { DECAY: 3.0, INDUSTRIAL: 2.4, TRASH: 1.2, PUNK: .6 }
    },
    {
      id: 'plague-walk', name: 'PANDEMIC RUNWAY', sub: 'compliance is optional, contagion is not',
      quote: ['DOROTEA FLEABITE', 'Triage chic, darlings. Triage chic.'],
      weights: { MEDICAL: 3.0, TOXIC: 2.2, MILITARY: 1.2, INDUSTRIAL: .6 }
    },
    {
      id: 'gutter-glamour', name: 'GUTTER GLAMOUR', sub: 'the atheist tinsel of the deep',
      quote: ['MAGGOT VANDAME', 'I want sparkle that has personally been thrown on the ground.'],
      weights: { GLITZ: 3.0, TRASH: 2.0, PUNK: 1.4, VERMIN: .8 }
    },
    {
      id: 'leather-factory', name: 'INDUSTRIAL LEATHER', sub: 'sweat, steam, overtime',
      quote: ['BIG WHISKER', 'Production goals: puncture resistance. Beauty: secondary but required.'],
      weights: { INDUSTRIAL: 3.0, PUNK: 2.2, MILITARY: 1.6, MEDICAL: .5 }
    },
    {
      id: 'trash-couture', name: 'TRASH COUTURE', sub: 'born in a bin raised by bins',
      quote: ['MAGGOT VANDAME', 'It must look borrowed from a bin nobody will ever claim.'],
      weights: { TRASH: 3.0, PUNK: 2.0, DECAY: 1.6, TOXIC: .8 }
    },
    {
      id: 'fermal-formal', name: 'FERAL FORMAL', sub: 'eveningwear of the colony',
      quote: ['DOROTEA FLEABITE', 'Whiskers freshly oiled. Tails brushed. Monsters, dress up.'],
      weights: { VERMIN: 3.0, BAROQUE: 2.2, MILITARY: 1.0, MEDICAL: 1.0 }
    },
  ];

  /* ---------- wardrobe. 6 categories, pick 5 randomly each round ---- */
  function item(id, name, flavor, tags, flair, build, p) {
    return { id, name, flavor, tags, flair, build, p: p || {} };
  }
  function cat(id, name, icon, items) { return { id, name, icon, items }; }

  RC.CATEGORIES = [
    cat('head', 'HEAD GEAR', '\u{1F3A9}', [
      item('head1', 'GAS MASK OF REGRET', 'Smells like 1974 in there.', ['TOXIC', 'MEDICAL'], .9, 'gasMask'),
      item('head2', 'STREET CONE CHAPEAU', 'Municipality hates this trick.', ['TRASH', 'INDUSTRIAL'], .7, 'coneHat'),
      item('head3', 'CEMENT FEDORA', 'Waterproof. Bone-crushing. Dapper.', ['INDUSTRIAL', 'BAROQUE'], .8, 'concreteFedora'),
      item('head4', 'RATSKULL CROWN', 'Eleven rat kings preceded you.', ['GLITZ', 'VERMIN'], 1.0, 'skullCrown'),
      item('head5', "WELDER'S VISOR", 'You can see a little. Not well.', ['INDUSTRIAL'], .6, 'weldMask'),
      item('head6', 'MOHAWK (LOANED)', "It was somebody else's hair. Then it wasn't.", ['PUNK'], .8, 'hairMohawk'),
      item('head7', 'HUBCAP TIARA', 'A crown, but it unlatches.', ['TRASH', 'GLITZ'], .9, 'hubcapTiara'),
      item('head8', 'BIOHAZARD BALACLAVA', 'Tells you before you ask.', ['MEDICAL', 'TOXIC'], .7, 'balaclava'),
      item('head9', 'THE DAY-OLD WIG', 'Structurally, hair. Functionally, a sponge.', ['GLITZ', 'DECAY'], .8, 'dayWig'),
      item('head10', 'CANCER SOMBRERO', 'Twenty unfiltered statements.', ['PUNK', 'TOXIC'], .9, 'cigSombrero'),
    ]),
    cat('top', 'TOP WEAR', '\u{1F455}', [
      item('top1', 'RIPPED BIKER JACKET', 'Someone ripped it. That someone is the jacket.', ['PUNK', 'INDUSTRIAL'], .9, 'jacket', { tex: 'leather' }),
      item('top2', 'STRAITJACKET, CUSTOM', 'Jacket, tailored to your worst self. You have not escaped a tailor since.', ['MEDICAL'], .9, 'straitcoat'),
      item('top3', 'HALF-SHAVED FUR COAT', 'Shaved down the middle for drama.', ['GLITZ', 'DECAY'], 1.0, 'furCoat'),
      item('top4', 'TRASH BAG PONCHO', 'Scent: Sunday.', ['TRASH', 'TOXIC'], .8, 'poncho'),
      item('top5', 'CHAINMAIL SINGLET', 'Chainmail for the runway, obviously.', ['INDUSTRIAL', 'GLITZ'], 1.0, 'chainSinglet'),
      item('top6', 'OBSOLETE HAZMAT TOP', 'Rating: was laughed at by chemicals.', ['TOXIC', 'MEDICAL'], .8, 'hazmatTop'),
      item('top7', 'BARBED-WIRE SWEATER', 'Hugs back.', ['PUNK', 'INDUSTRIAL'], .9, 'barbedSweater'),
      item('top8', 'MOTH-EATEN TUX', 'The moths wear the butterflies now.', ['BAROQUE', 'DECAY'], .9, 'tuxMoth'),
      item('top9', 'ACID RAINCOAT', 'Candid yellow. Gleams like a hazard.', ['TOXIC', 'GLITZ'], .9, 'vinylRaincoat'),
      item('top10', 'FLY-BLOWN MORNING SUIT', 'For morning weddings. Of rats.', ['DECAY', 'BAROQUE'], .9, 'morningSuit'),
    ]),
    cat('legs', 'LEG WEAR', '\u{1F456}', [
      item('leg1', 'BONDAGE PANTS', 'Chains everywhere. Zero locks working.', ['PUNK'], .8, 'bondagePants'),
      item('leg2', 'CAMO PARATROOPER GRIME', 'Camouflage found you already.', ['MILITARY'], .7, 'camoPants'),
      item('leg3', 'MOLDY LONG-JOHNS', 'Stripes. Then stripes of mold.', ['DECAY'], .7, 'longjohns'),
      item('leg4', 'FISHNET GAM SLEEVES', 'The fish are disgusted. The net is fine.', ['GLITZ', 'PUNK'], .9, 'fishnetLegs'),
      item('leg5', 'FLOODED RUBBER WADERS', 'Still holding the original flood.', ['TOXIC', 'INDUSTRIAL'], .8, 'waders'),
      item('leg6', 'HOSPITAL SCRUBS (BOTTOM)', 'Culture says no. Fabric says yes.', ['MEDICAL'], .6, 'scrubsBottom'),
      item('leg7', 'GRAVY BREECHES', 'Baroque breeches with documented sauce history.', ['BAROQUE', 'DECAY'], .9, 'gravyBreeches'),
      item('leg8', "CARGO SHORTS (IT'S -15\u00B0C)", 'Pockets keep the knees company anyway.', ['TRASH'], .7, 'winterShorts'),
      item('leg9', 'BIN-LINER TIGHTS', 'Sheer? No. Sealed.', ['TRASH', 'TOXIC'], .8, 'binTights'),
      item('leg10', 'HIGH-VOLTAGE UTILITY CHAPS', 'Chaps for climbing furniture you should not climb.', ['INDUSTRIAL', 'MILITARY'], .9, 'utilityChaps'),
    ]),
    cat('feet', 'FOOTWEAR', '\u{1F462}', [
      item('ft1', 'CONSTRUCTION PLATFORMS', 'Eyelets rusted into an architecture.', ['INDUSTRIAL'], .7, 'bootStack', { h: 1.25, tex: 'rust', color: 0x6a4a2a }),
      item('ft2', 'MOLD STILETTOS', 'The mold is load-bearing.', ['GLITZ', 'DECAY'], 1.0, 'bootStack', { h: 1.1, thin: true, color: 0x2b2b2b, sheen: true }),
      item('ft3', 'SANDALS + DRESS SOCKS', 'Nothing left to prove.', ['TRASH'], .7, 'sandals'),
      item('ft4', 'MAGNIFICENT CLOWN BOOTS', 'Exaggerated. Honorable. Red.', ['PUNK', 'GLITZ'], .9, 'bootStack', { h: 1.45, wide: true, color: 0x7a1f1a }),
      item('ft5', 'PLASTER CLOGS', 'Set during a previous mud event.', ['DECAY', 'MEDICAL'], .8, 'bootStack', { h: 1.0, tex: 'plaster' }),
      item('ft6', 'STILTS OF UNLAWFUL HEIGHT', 'Viewing gallery now below you.', ['INDUSTRIAL', 'PUNK'], 1.0, 'stilts'),
      item('ft7', 'HOSPITAL SLIPPERS', 'Velcro perished. Faith remains.', ['MEDICAL'], .6, 'slippers'),
      item('ft8', 'FISH FLOPS', 'Sole material: sardine.', ['TRASH', 'TOXIC'], .9, 'sandals', { fish: true }),
      item('ft9', 'BAROQUE BUCKLE PUMPS', 'Buckles ornamental. Gravy functional.', ['BAROQUE'], .8, 'bootStack', { h: .95, tex: 'velvet' }),
      item('ft10', 'RUSTED RAILROAD BOOTS', 'Steam punch guaranteed.', ['INDUSTRIAL', 'PUNK'], .8, 'bootStack', { h: 1.15, tex: 'rust' }),
    ]),
    cat('acc', 'ACCESSORY', '\u{26D3}', [
      item('ac1', 'SPIKED COLLAR OF SHAME', 'Spikes: yours. Shame: jury-proven.', ['PUNK'], .8, 'spikedCollar'),
      item('ac2', 'PADLOCK BREASTPLATE', 'Chains + unknown locks. Keys: none.', ['INDUSTRIAL'], .9, 'chestChains'),
      item('ac3', 'SKULL SHOULDER PADS', 'Whose skulls? Society failed them.', ['GLITZ', 'PUNK'], 1.0, 'skullPauldrons'),
      item('ac4', 'EMOTIONAL SUPPORT RAT', 'It judges, quietly, in its own tongue.', ['VERMIN'], 1.0, 'petRat'),
      item('ac5', 'IV DRIP, SELF-ADMINISTERED', 'Fluids yellow but relatable.', ['MEDICAL'], .8, 'ivDrip'),
      item('ac6', 'CHRISTMAS LIGHTS, PERMANENT', 'Wrapped on since some December.', ['GLITZ', 'TRASH'], .9, 'lightGarland'),
      item('ac7', 'CLOUD OF "SOAP"', 'Airborne perfume claiming innocence.', ['GLITZ', 'TOXIC'], .7, 'perfumeCloud'),
      item('ac8', 'SCARF, VOMIT-CURATED', 'Pattern chosen by the body itself.', ['DECAY', 'BAROQUE'], .9, 'vomitScarf'),
      item('ac9', 'PRISON SLEEVE TATTOOS', 'Crooked anchors. Sacred rats.', ['PUNK'], .8, 'tattooSleeves'),
      item('ac10', 'UTILITY BELT OF WRENCHES', 'Every wrench has a reason, none good.', ['INDUSTRIAL', 'MILITARY'], .8, 'wrenchBelt'),
    ]),
    cat('prop', 'STATEMENT PROP', '\u2692', [
      item('pr1', 'RUSTED STREET SIGN', 'ONE WAY. Always was.', ['INDUSTRIAL', 'PUNK'], .8, 'signProp'),
      item('pr2', 'TRAVEL COFFIN (CARRY-ON)', 'Fits overhead. Fire marshal disagrees, historically.', ['BAROQUE', 'DECAY'], 1.0, 'coffinBack'),
      item('pr3', 'PORCELAIN HANDBAG', 'Toilet seat with a wrist strap and lies.', ['TRASH', 'GLITZ'], .9, 'throneBag'),
      item('pr4', 'UMBRELLA OF RUST', 'Opens sideways. Spares nobody.', ['INDUSTRIAL'], .7, 'umbrellaProp'),
      item('pr5', 'SEWER LEGION FLAG', 'A military scanner approved it. Once.', ['VERMIN', 'MILITARY'], .9, 'flagProp'),
      item('pr6', 'MOLOTOV BOUQUET', 'Flowers optional. Rage included.', ['TOXIC', 'PUNK'], 1.0, 'molotovProp'),
      item('pr7', 'FOAM FINGER, RUDE', 'Approximately one message tall.', ['PUNK', 'TRASH'], .7, 'foamProp'),
      item('pr8', 'UNLIT CANDELABRUM', 'Candles cost extra. Honor: free.', ['BAROQUE'], .8, 'candelabraProp'),
      item('pr9', 'DECORATIVE CHAINSAW', 'The blade is fake. It still threatens warmly.', ['INDUSTRIAL', 'PUNK'], .9, 'chainsawProp'),
      item('pr10', 'OCCUPIED BIRDCAGE VEIL', 'Bird stays in. Standards stay high.', ['GLITZ', 'VERMIN'], 1.0, 'cageVeil'),
    ]),
  ];

  /* ---------- jury (data-driven; add more if the booth expands) ------ */
  RC.JURY = [
    {
      id: 'maggot', name: 'MAGGOT VANDAME', role: 'FOUNDING HAUTE-VERMIN',
      fav: {}, // tags this juror rewards extra
      hates: {},
      desc: 'Founded the scene. Forgives nothing. Wears sunglasses to mourn dead ideas.',
      // scores -> verdict lines
      tiers: [
        { min: 8, lines: ['Filth elevated to doctrine.', 'I have seen bubonic splendor, and this is it.', 'The colony is weeping with pride.'] },
        { min: 6.4, lines: ['Competent rot. Not doctrine yet.', 'Decent grime. Where is the wound in it?', 'You smell like a promise. Keep it.'] },
        { min: 5, lines: ['This is merely dirty, not filthy.', 'Clean in spirit. That is the crime.', 'Acceptable. The season disagrees.'] },
        { min: -1, lines: ['Get this laundry off my runway.', 'A dressing room accident, still steaming.', 'You wasted filth that was meant for better rats.'] },
      ]
    },
    {
      id: 'dorotea', name: 'DOROTEA FLEABITE', role: 'COUTURE ELEGIST',
      fav: { BAROQUE: 1.2, VERMIN: .8 },
      hates: {},
      desc: 'Writes obituaries in verse. Sees mercy in a mold stain.',
      tiers: [
        { min: 8, lines: ['A requiem sewn from whiskers. I am undone.', 'Decay has never been so well-dressed.', 'The damp itself applauds.'] },
        { min: 6.4, lines: ['Poetic, with mild structural leaks.', 'There is a ballad in those stains. Keep digging.', 'Tender rot. Nearly romantic.'] },
        { min: 5, lines: ['Charming, but the filth feels rehearsed.', 'The narrative lacks a moral wound.', 'A tourist\u2019s idea of sewerage.'] },
        { min: -1, lines: ['This outfit has never known suffering.', 'A brochure posing as couture.', 'I applaud the ambition, not the carrion.'] },
      ]
    },
    {
      id: 'whisker', name: 'BIG WHISKER', role: 'SEWER C.E.O.',
      fav: { INDUSTRIAL: 1.2, MILITARY: 1.0 },
      hates: { GLITZ: -.4 },
      desc: 'Third generation sewage magnate. Rates outfits in throughput.',
      tiers: [
        { min: 8, lines: ['Excellent puncture potential. Approved for mass production.', 'Filth turns a margin. Well optimized.', 'This will ship in volume.'] },
        { min: 6.4, lines: ['Viable. Contains minor design residues.', 'Strong asset. Weak brand magnetic.', 'Acceptable throughput. Approve.'] },
        { min: 5, lines: ['Passes audit. Barely.', 'Filth predicted, not expressed.', 'Sold as-is. Clearance.'] },
        { min: -1, lines: ['A cost center. On legs.', 'Would fail inspection in any sewer.', 'Send it down the drain. No, literally.'] },
      ]
    },
  ];

  /* ---------- contestant identities (AI + player rosters) ------------ */
  RC.RAT_NAMES = [
    'RONNIE ROTGUT', 'MADAME PLAGUE', 'GARBAGE GARY', 'LIL\u2019 PEW-PEW', 'COUNTESS DRIPS',
    'SCURVY SAM', 'TOASTY NORA', 'DUKE OF GNIBBLES', 'FILTHY FRANNIE', 'BARON VON MOLD',
    'SNIFFLES MCGRAW', 'IRMA INTESTINE', 'PAPA SCAB', 'VERMINA VELVET', 'TWITCH & TWERK',
    'GRANDMA MILDEW', 'TREMBLE TERRY', 'CATHEXIS THE HAIRY', 'BLEEDING BEATRICE', 'WALLY WEASEL',
  ];
  RC.PLAYER_NAMES = [
    'VOLUNTEER #7', 'THE NEW MEAT', 'TEMP RAT (UNSIGNED)', 'SUBJECT: DRESSED', 'LATE ADDITION, NO CONSULTATION',
  ];

  /* ---------- weapons-free random rat spec --------------------------- */
  RC.randomRatSpec = function () {
    const furs = [0x4a3b2a, 0x58514a, 0x26211d, 0x6a5a40, 0x444035, 0x3a2f22];
    const skins = [0xcdb59b, 0xa8a6a0, 0xb6c1a8, 0xc4a688, 0xb59b8f];
    const irises = [0x2a6d5c, 0x50421f, 0x3a4b6d, 0x6d2a2a, 0x1f1f1f];
    const hairStyles = ['bald', 'messy', 'mohawk', 'scrags', 'pigtails'];
    return {
      fur: RC.pick(furs),
      skin: RC.pick(skins),
      iris: RC.pick(irises),
      hairStyle: RC.pick(hairStyles),
      hairColor: RC.pick([0x181310, 0x2b1f12, 0x54431f, 0x0d0d0d, 0x6a2f18]),
      earSize: RC.rand(.75, 1.5),
      snoutLen: RC.rand(.13, .30),
      teethSize: RC.rand(.7, 1.5),
      hunch: RC.rand(.05, .42),
      scale: RC.rand(.94, 1.08),
      width: RC.rand(.9, 1.15),
      belly: RC.rand(.85, 1.5),
      warts: RC.ri(0, 6),
      scars: RC.ri(0, 3),
      droop: RC.rand(0, 1),
      limp: Math.random() < .25,
      baldPatch: RC.rand(0, .9),
      pose: RC.ri(0, 2),
    };
  };
})();
