/**
 * generateur.js — Atelier Galaad
 * Créateur de bouquet avec rendu SVG fleurs réalistes 3D / Photoréaliste
 */

const GenState = {
  style: 'champetre', couleur: 'rose-pastel', forme: 'rond', taille: 2,
  selectedFleurs: {}, // { "fleurId": quantity }
  lastAdded: null
};

// Fonction pour assombrir/éclaircir une couleur hex (effet 3D)
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);
  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);
  R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;
  R = Math.round(R); G = Math.round(G); B = Math.round(B);
  let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
  return "#"+RR+GG+BB;
}

/* ── Positions 3D (% du canvas 400×420, z: 0=arrière, 100=avant) ── */
const POSITIONS = {
  rond: [
    // Arrière-plan (z: 10)
    {x:20,y:20,z:10},{x:50,y:10,z:10},{x:80,y:20,z:10},
    {x:15,y:40,z:15},{x:85,y:40,z:15},{x:20,y:70,z:15},{x:80,y:70,z:15},
    // Milieu-arrière (z: 30)
    {x:35,y:25,z:30},{x:65,y:25,z:30},{x:25,y:55,z:30},{x:75,y:55,z:30},
    // Centre-milieu (z: 50)
    {x:50,y:35,z:50},{x:35,y:75,z:50},{x:65,y:75,z:50},{x:50,y:85,z:50},
    {x:35,y:45,z:50},{x:65,y:45,z:50},
    // Avant-plan (z: 80)
    {x:45,y:55,z:80},{x:55,y:55,z:80},{x:50,y:65,z:85},
    // Cœur (z: 100)
    {x:50,y:50,z:100}
  ],
  cascade: [
    {x:65,y:10,z:10},{x:78,y:22,z:15},{x:85,y:15,z:10},
    {x:40,y:20,z:20},{x:30,y:40,z:20},{x:20,y:60,z:20},{x:15,y:85,z:10},
    {x:60,y:30,z:40},{x:74,y:42,z:45},{x:52,y:50,z:50},{x:68,y:60,z:55},
    {x:40,y:64,z:45},{x:56,y:74,z:50},{x:32,y:80,z:40},{x:48,y:90,z:45},
    {x:22,y:92,z:35},{x:38,y:98,z:40},
    {x:55,y:30,z:70},{x:40,y:45,z:75},{x:50,y:60,z:80},
    {x:55,y:45,z:90},{x:45,y:75,z:85},{x:25,y:95,z:80},{x:70,y:35,z:85}
  ],
  brassee: [
    {x:30,y:30,z:20},{x:50,y:20,z:10},{x:70,y:30,z:20},
    {x:20,y:45,z:30},{x:80,y:45,z:30},{x:30,y:60,z:40},{x:70,y:60,z:40},
    {x:20,y:75,z:50},{x:80,y:75,z:50},{x:35,y:90,z:60},{x:55,y:90,z:60},
    {x:45,y:25,z:40},{x:25,y:35,z:50},{x:65,y:35,z:50},
    {x:40,y:40,z:60},{x:60,y:40,z:60},{x:50,y:55,z:70},{x:40,y:75,z:80},{x:60,y:75,z:80},
    {x:45,y:50,z:90},{x:65,y:50,z:90},{x:50,y:35,z:100},{x:35,y:45,z:100},{x:75,y:65,z:85}
  ]
};

/* ── Couleurs par fleur ── */
const FLOWER_PALETTE = {
  rose:       { petale:'#E8607A', petale2:'#C04060', coeur:'#8B1A3A', feuille:'#5A8040' },
  pivoine:    { petale:'#F0B0C8', petale2:'#E080A8', coeur:'#C05080', feuille:'#4A7030' },
  tulipe:     { petale:'#E84060', petale2:'#C02040', coeur:'#FF8090', feuille:'#508040' },
  hortensia:  { petale:'#90A8E0', petale2:'#6080C8', coeur:'#FFFFFF', feuille:'#3A6040' },
  lys:        { petale:'#F8EAD0', petale2:'#E8C890', coeur:'#C8903A', feuille:'#4A6830' },
  freesia:    { petale:'#F4DC60', petale2:'#DCA820', coeur:'#8A6000', feuille:'#4A7040' },
  renoncule:  { petale:'#F4A060', petale2:'#E07030', coeur:'#804020', feuille:'#508040' },
  eucalyptus: { petale:'#90B898', petale2:'#609870', coeur:'#304830', feuille:'#487858' },
  mimosa:     { petale:'#F8E040', petale2:'#E0B800', coeur:'#806000', feuille:'#5A8030' },
  anemone:    { petale:'#7858C0', petale2:'#5038A8', coeur:'#1A1440', feuille:'#3A6030' },
  lavande:    { petale:'#B090D8', petale2:'#8060C0', coeur:'#5040A0', feuille:'#485828' },
  orchidee:   { petale:'#D898C8', petale2:'#B060A8', coeur:'#FFFDE8', feuille:'#3A6040' },
  dahlia:     { petale:'#E06040', petale2:'#B83020', coeur:'#601810', feuille:'#508038' },
  gypsophile: { petale:'#FAFAFA', petale2:'#E8E0EC', coeur:'#D0C0D8', feuille:'#4A6838' },
  muguet:     { petale:'#F0F8F0', petale2:'#D8ECD8', coeur:'#90B888', feuille:'#3A7030' }
};

const FORMAT_MULT = { 1: 1, 2: 1.5, 3: 2.2 };

/* ══════════════════════════════════
   SVG FLEURS 3D (Gradients & Ombres)
══════════════════════════════════ */
function getFill(id, type) {
  return `url(#grad-${id}-${type})`;
}

const flowerShapes = {
  rose(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2');
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.45, py = cy - Math.cos(rad) * r * 0.45;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.4}" ry="${r*.55}" transform="rotate(${a+rot} ${px} ${py})" fill="${f1}" opacity=".95" filter="url(#drop-shadow)"/>`;
    });
    [36,108,180,252,324].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.2, py = cy - Math.cos(rad) * r * 0.2;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.28}" ry="${r*.4}" transform="rotate(${a+rot} ${px} ${py})" fill="${f2}" opacity=".98" filter="url(#drop-shadow)"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.15}" fill="url(#grad-${id}-c)"/><circle cx="${cx}" cy="${cy}" r="${r*.08}" fill="#FFEC80" opacity=".9"/>`;
    return svg;
  },
  pivoine(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2'), fc = `url(#grad-${id}-c)`;
    [{nb:7, dist:.5, rx:.38, ry:.55}, {nb:6, dist:.3, rx:.3, ry:.4}, {nb:5, dist:.15, rx:.25, ry:.3}].forEach(({nb, dist, rx, ry}, ring) => {
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 15;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 0 ? f1 : ring === 1 ? f2 : fc;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${r*rx}" ry="${r*ry}" transform="rotate(${a} ${px} ${py})" fill="${c}" opacity=".95" filter="url(#drop-shadow)"/>`;
      }
    });
    return svg;
  },
  tulipe(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2');
    [0,120,240].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.35, py = cy - Math.cos(rad) * r * 0.35;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.35}" ry="${r*.6}" transform="rotate(${a+rot} ${px} ${py})" fill="${f1}" opacity=".95" filter="url(#drop-shadow)"/>`;
    });
    [60,180,300].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.2, py = cy - Math.cos(rad) * r * 0.2;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.25}" ry="${r*.45}" transform="rotate(${a+rot} ${px} ${py})" fill="${f2}" opacity=".98"/>`;
    });
    return svg;
  },
  hortensia(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), fc = `url(#grad-${id}-c)`;
    const positions = [[0,0],[.4,0],[-.4,0],[0,.4],[0,-.4],[.3,.3],[-.3,.3],[.3,-.3],[-.3,-.3],[.5,.15],[-.5,.15],[0,.55]];
    positions.forEach(([dx, dy]) => {
      const px = cx + dx * r, py = cy + dy * r, sr = r * 0.25;
      [0,90,180,270].forEach(a => {
        const rad = (a + rot) * Math.PI / 180;
        svg += `<ellipse cx="${px + Math.sin(rad)*sr*.65}" cy="${py - Math.cos(rad)*sr*.65}" rx="${sr*.5}" ry="${sr*.35}" transform="rotate(${a+rot} ${px} ${py})" fill="${f1}" filter="url(#drop-shadow-small)"/>`;
      });
      svg += `<circle cx="${px}" cy="${py}" r="${sr*.25}" fill="${fc}"/>`;
    });
    return svg;
  },
  lys(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2'), fc = `url(#grad-${id}-c)`;
    [0,60,120,180,240,300].forEach((a, i) => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.45, py = cy - Math.cos(rad) * r * 0.45;
      const c = i % 2 === 0 ? f1 : f2;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.25}" ry="${r*.65}" transform="rotate(${a+rot} ${px} ${py})" fill="${c}" opacity=".95" filter="url(#drop-shadow)"/>`;
    });
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(rad)*r*.45}" y2="${cy-Math.cos(rad)*r*.45}" stroke="${FLOWER_PALETTE[id].coeur}" stroke-width="2"/>
              <circle cx="${cx+Math.sin(rad)*r*.45}" cy="${cy-Math.cos(rad)*r*.45}" r="3.5" fill="${FLOWER_PALETTE[id].coeur}" filter="url(#drop-shadow-small)"/>`;
    });
    return svg;
  },
  anemone(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), fc = `url(#grad-${id}-c)`;
    [0,51,103,154,206,257,309].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.4, py = cy - Math.cos(rad) * r * 0.4;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.4}" ry="${r*.5}" transform="rotate(${a+rot} ${px} ${py})" fill="${f1}" opacity=".95" filter="url(#drop-shadow)"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.28}" fill="${fc}"/>`;
    [0,45,90,135,180,225,270,315].forEach(a => {
      const rad = a * Math.PI / 180;
      svg += `<circle cx="${cx+Math.sin(rad)*r*.2}" cy="${cy-Math.cos(rad)*r*.2}" r="2.5" fill="#FFFFFF"/>`;
    });
    return svg;
  },
  dahlia(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2'), fc = `url(#grad-${id}-c)`;
    for (let ring = 3; ring >= 1; ring--) {
      const nb = ring * 8, dist = (ring / 3) * 0.5, pr = r * (0.15 + ring * 0.05);
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 12;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 3 ? f1 : ring === 2 ? f2 : fc;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${pr*.6}" ry="${pr*1.2}" transform="rotate(${a} ${px} ${py})" fill="${c}" opacity=".95" filter="url(#drop-shadow-small)"/>`;
      }
    }
    return svg;
  },
  lavande(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2');
    svg += `<line x1="${cx}" y1="${cy+r*.7}" x2="${cx}" y2="${cy-r*.6}" stroke="${FLOWER_PALETTE[id].feuille}" stroke-width="3" opacity=".9"/>`;
    const nb = 12;
    for (let i = 0; i < nb; i++) {
      const t = i / (nb - 1);
      const y = cy + r * (.6 - t * 1.3);
      const side = i % 2 === 0 ? 1 : -1;
      const x = cx + side * r * .15;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${r*.15}" ry="${r*.22}" fill="${i < 4 ? f2 : f1}" opacity=".95" filter="url(#drop-shadow-small)"/>`;
    }
    return svg;
  },
  gypsophile(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2');
    const dots = [[0,0],[.38,-.18],[-.35,-.22],[.18,.38],[-.28,.32],[.45,.1],[-.5,.08],[.1,-.45],[.28,.18],[-.18,.42],[.4,.3],[-.4,.2],[0,.5],[.5,-.2]];
    dots.forEach(([dx, dy]) => {
      const x = cx + dx * r, y = cy + dy * r;
      const s = r * (.18 + Math.random() * 0.12);
      [0,90,180,270].forEach(a => {
        const rad = a * Math.PI / 180;
        svg += `<ellipse cx="${x+Math.sin(rad)*s*.6}" cy="${y-Math.cos(rad)*s*.6}" rx="${s*.45}" ry="${s*.28}" transform="rotate(${a} ${x} ${y})" fill="${f1}" filter="url(#drop-shadow-small)"/>`;
      });
      svg += `<circle cx="${x}" cy="${y}" r="${s*.22}" fill="${f2}"/>`;
    });
    return svg;
  },
  muguet(id, cx, cy, r, rot) {
    let svg = '';
    const f1 = getFill(id, '1');
    svg += `<path d="M${cx},${cy+r*.7} Q${cx+r*.3},${cy} ${cx},${cy-r*.5}" fill="none" stroke="${FLOWER_PALETTE[id].feuille}" stroke-width="2.5" filter="url(#drop-shadow-small)"/>`;
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const x = cx + Math.sin(t * Math.PI) * r * .35;
      const y = cy + r * (.6 - t * 1.1);
      svg += `<path d="M${x},${y-r*.1} Q${x+r*.15},${y-r*.08} ${x+r*.15},${y+r*.1} Q${x+r*.15},${y+r*.2} ${x},${y+r*.2} Q${x-r*.15},${y+r*.2} ${x-r*.15},${y+r*.1} Q${x-r*.15},${y-r*.08} ${x},${y-r*.1} Z" fill="${f1}" opacity=".95" filter="url(#drop-shadow-small)"/>`;
      svg += `<line x1="${cx}" y1="${y}" x2="${x}" y2="${y}" stroke="${FLOWER_PALETTE[id].feuille}" stroke-width="1.5"/>`;
    }
    return svg;
  },
  generic(id, cx, cy, r, rot, nb = 5) {
    let svg = '';
    const f1 = getFill(id, '1'), f2 = getFill(id, '2'), fc = `url(#grad-${id}-c)`;
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * 360 + rot;
      const rad = a * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.45, py = cy - Math.cos(rad) * r * 0.45;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.35}" ry="${r*.55}" transform="rotate(${a} ${px} ${py})" fill="${i%2===0?f1:f2}" opacity=".95" filter="url(#drop-shadow)"/>`;
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.22}" fill="${fc}"/>`;
    return svg;
  }
};

function getFlowerSVG(id, cx, cy, r, rot = 0) {
  const shapes = {
    rose:       () => flowerShapes.rose(id, cx, cy, r, rot),
    pivoine:    () => flowerShapes.pivoine(id, cx, cy, r, rot),
    tulipe:     () => flowerShapes.tulipe(id, cx, cy, r, rot),
    hortensia:  () => flowerShapes.hortensia(id, cx, cy, r, rot),
    lys:        () => flowerShapes.lys(id, cx, cy, r, rot),
    anemone:    () => flowerShapes.anemone(id, cx, cy, r, rot),
    dahlia:     () => flowerShapes.dahlia(id, cx, cy, r, rot),
    lavande:    () => flowerShapes.lavande(id, cx, cy, r, rot),
    gypsophile: () => flowerShapes.gypsophile(id, cx, cy, r, rot),
    muguet:     () => flowerShapes.muguet(id, cx, cy, r, rot),
  };
  return (shapes[id] || (() => flowerShapes.generic(id, cx, cy, r, rot)))();
}

/* ════════════════════════════════════
   GÉNÉRATION DES DEFINITIONS 3D
════════════════════════════════════ */
function generateSVGDefs() {
  let defs = `
    <defs>
      <filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="1" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
      </filter>
      <filter id="drop-shadow-small" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.5" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
      </filter>
      <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="15%" stop-color="#ffffff" stop-opacity="0.1"/>
        <stop offset="85%" stop-color="#ffffff" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8"/>
      </linearGradient>
      <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#99ccee" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#66aaff" stop-opacity="0.5"/>
      </linearGradient>
  `;
  
  Object.keys(FLOWER_PALETTE).forEach(id => {
    const pal = FLOWER_PALETTE[id];
    defs += `<radialGradient id="grad-${id}-1" cx="30%" cy="30%" r="70%">
               <stop offset="0%" stop-color="${shadeColor(pal.petale, 25)}"/>
               <stop offset="70%" stop-color="${pal.petale}"/>
               <stop offset="100%" stop-color="${shadeColor(pal.petale, -35)}"/>
             </radialGradient>`;
    defs += `<radialGradient id="grad-${id}-2" cx="30%" cy="30%" r="70%">
               <stop offset="0%" stop-color="${shadeColor(pal.petale2, 25)}"/>
               <stop offset="70%" stop-color="${pal.petale2}"/>
               <stop offset="100%" stop-color="${shadeColor(pal.petale2, -35)}"/>
             </radialGradient>`;
    defs += `<radialGradient id="grad-${id}-c" cx="40%" cy="40%" r="60%">
               <stop offset="0%" stop-color="${shadeColor(pal.coeur, 15)}"/>
               <stop offset="100%" stop-color="${shadeColor(pal.coeur, -20)}"/>
             </radialGradient>`;
  });
  defs += `</defs>`;
  return defs;
}

/* ════════════════════════════════════
   RENDU BOUQUET
════════════════════════════════════ */
function renderBouquet(newFleurId = null) {
  const canvasEl = document.getElementById('bouquet-canvas');
  if (!canvasEl) return;

  const W = canvasEl.offsetWidth  || 400;
  const H = canvasEl.offsetHeight || 440;

  let totalFleurs = Object.values(GenState.selectedFleurs).reduce((a,b)=>a+b, 0);

  if (totalFleurs === 0) {
    canvasEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:0.4;color:white;gap:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style="font-family:var(--font-serif);font-size:1.1rem;font-style:italic;">Sélectionnez des fleurs</span>
      </div>`;
    if (document.getElementById('bouquet-name')) document.getElementById('bouquet-name').textContent = 'Votre bouquet';
    return;
  }

  const basePositions = POSITIONS[GenState.forme] || POSITIONS.rond;
  
  let stemList = [];
  
  const filler = GenState.style === 'boheme' || GenState.style === 'champetre' ? 'gypsophile' : 'eucalyptus';
  const fillerCount = Math.min(12, Math.ceil(totalFleurs * 0.7));
  for(let i=0; i<fillerCount; i++) stemList.push(filler);

  for (const [id, qty] of Object.entries(GenState.selectedFleurs)) {
    for (let i = 0; i < qty; i++) {
      stemList.push(id);
    }
  }

  function seedRandom(s) {
    return function() {
      s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
  }
  let random = seedRandom(totalFleurs * 42); 
  
  let renderList = stemList.map((id, i) => {
    const pos = basePositions[i % basePositions.length];
    return {
      id,
      x: pos.x + (random() - 0.5) * 15, // bruit spatial X
      y: pos.y + (random() - 0.5) * 15, // bruit spatial Y
      z: pos.z + (random() - 0.5) * 10, // bruit profondeur Z
      isNew: (id === newFleurId && i === stemList.length - 1)
    };
  });

  // Tri Z-Index pour la profondeur
  renderList.sort((a, b) => a.z - b.z);

  const fleurSize = 25 + GenState.taille * 9; 

  const handleX = W / 2;
  const handleY = H * 0.85;

  let stemsPath = '';
  let flowerGroups = '';

  renderList.forEach((item, index) => {
    const cx = (item.x / 100) * W;
    const cy = (item.y / 100) * H * 0.75; 
    
    // Scale en fonction de la profondeur Z
    const scaleZ = 0.6 + (item.z / 100) * 0.5; // de 0.6 à 1.1
    const r = (item.id === 'eucalyptus' || item.id === 'gypsophile') ? fleurSize * 0.8 * scaleZ : fleurSize * scaleZ;
    const rot = (index * 137.5) % 360; 

    // Tige
    const midX = (cx + handleX) / 2 + (random() - 0.5) * 30;
    const midY = cy + (handleY - cy) * 0.6;
    const stemColor = FLOWER_PALETTE[item.id]?.feuille || '#508040';
    stemsPath += `<path d="M${cx},${cy+r*.7} Q${midX},${midY} ${handleX},${handleY+40}" fill="none" stroke="${shadeColor(stemColor, -20)}" stroke-width="${3 * scaleZ}" stroke-linecap="round" opacity="0.9"/>`;

    // Tête
    const animClass = item.isNew ? 'flower-bloom' : '';
    flowerGroups += `
      <g class="${animClass}" transform-origin="${cx} ${cy}">
        ${getFlowerSVG(item.id, cx, cy, r, rot)}
      </g>`;
  });

  // Vase en verre photoréaliste
  const vase = `
    <g transform="translate(${handleX}, ${handleY})">
      <path d="M-22,25 L22,25 L16,80 L-16,80 Z" fill="url(#water)"/>
      <path d="M-28,0 L28,0 L22,20 L30,40 L20,95 L-20,95 L-30,40 L-22,20 Z" fill="url(#glass)" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.7"/>
      <path d="M-18,5 L-12,5 L-15,85 L-20,85 Z" fill="#ffffff" opacity="0.5" filter="blur(1px)"/>
      <ellipse cx="0" cy="0" rx="28" ry="8" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
      <ellipse cx="0" cy="95" rx="20" ry="6" fill="#ffffff" opacity="0.3"/>
    </g>
  `;

  canvasEl.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <style>
        .flower-bloom { animation: fleurBloom 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        @keyframes fleurBloom {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      </style>
      ${generateSVGDefs()}
      ${stemsPath}
      ${vase}
      ${flowerGroups}
    </svg>`;

  const nameEl = document.getElementById('bouquet-name');
  if (nameEl) nameEl.textContent = generateName();
}

/* ════════════════════════════════════
   INTERACTIONS
════════════════════════════════════ */
function changeQty(id, delta) {
  let current = GenState.selectedFleurs[id] || 0;
  let newQty = current + delta;
  
  if (newQty <= 0) {
    delete GenState.selectedFleurs[id];
  } else {
    let total = Object.values(GenState.selectedFleurs).reduce((a,b)=>a+b, 0);
    if (delta > 0 && total >= 30) {
      if (window.showToast) window.showToast('Maximum 30 fleurs par bouquet');
      return;
    }
    GenState.selectedFleurs[id] = newQty;
  }
  
  if (delta > 0) GenState.lastAdded = id;
  else GenState.lastAdded = null;
  
  renderFlowerGrid();
  renderBouquet(delta > 0 ? id : null);
  updateRightFooter();
}

function selectStyle(id) { GenState.style = id; renderStyleCards(); document.getElementById('bouquet-name').textContent = generateName(); }
function selectCouleur(id) { GenState.couleur = id; renderCouleurs(); document.getElementById('bouquet-name').textContent = generateName(); }
function selectForme(id) {
  GenState.forme = id;
  document.querySelectorAll('.forme-card').forEach(c => c.classList.remove('selected'));
  const btn = document.querySelector(`.forme-card[onclick*="${id}"]`);
  if (btn) btn.classList.add('selected');
  renderBouquet();
}
function setTaille(val) { GenState.taille = parseInt(val); renderBouquet(); updateRightFooter(); }
function shuffle() { renderBouquet(); }
function copyComposition() {
  const name = (document.getElementById('bouquet-name') || {}).textContent || '';
  const comp = (document.getElementById('composition-text') || {}).textContent || '';
  navigator.clipboard.writeText(`${name}\n${comp}`).then(() => { if (window.showToast) window.showToast('Composition copiée !'); });
}
function orderBouquet() {
  const total = document.getElementById('price-total').innerText;
  if (parseFloat(total) === 0 || total === '0 €') {
    if(window.showToast) window.showToast('Veuillez composer un bouquet avant de commander.');
    else alert('Veuillez composer un bouquet avant de commander.');
    return;
  }
  const priceDisplay = document.getElementById('gen-modal-price-display');
  if (priceDisplay) {
    priceDisplay.innerHTML = `Montant estimé : <strong>${total}</strong>`;
  }
  const modal = document.getElementById('gen-modal');
  if(modal) {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    modal.querySelector('.modal').style.transform = 'translateY(0)';
  }
}

/* ════════════════════════════════════
   RENDU INTERFACES
════════════════════════════════════ */
function renderStyleCards() {
  const container = document.getElementById('style-container');
  if (!container || !window.CATALOGUE || !CATALOGUE.styles) return;
  const ICONS = { champetre:'leaf', classique:'crown', moderne:'zap', boheme:'feather', tropical:'sun' };
  container.innerHTML = CATALOGUE.styles.map(s => `
    <div class="style-card ${GenState.style === s.id ? 'selected' : ''}" onclick="selectStyle('${s.id}')">
      <div class="style-card-icon"><i data-lucide="${ICONS[s.id]||'flower-2'}"></i></div>
      <div class="style-card-name">${s.nom}</div>
    </div>`).join('');
  if (window.lucide) lucide.createIcons();
}

function renderCouleurs() {
  const container = document.getElementById('color-container');
  if (!container || !window.CATALOGUE || !CATALOGUE.couleurs) return;
  container.innerHTML = CATALOGUE.couleurs.map(c => `
    <div class="color-swatch-item ${GenState.couleur === c.id ? 'selected' : ''}" onclick="selectCouleur('${c.id}')">
      <div class="color-swatch-circle" style="background:${c.hex||'#ccc'}"></div>
      <div class="swatch-name">${c.nom}</div>
    </div>`).join('');
}

function renderFlowerGrid() {
  const container = document.getElementById('flower-grid');
  if (!container || !window.CATALOGUE || !CATALOGUE.fleurs) return;
  
  container.innerHTML = CATALOGUE.fleurs.map(f => {
    const pal = FLOWER_PALETTE[f.id];
    const bg = pal ? `background:${pal.petale}` : 'background:#E8A0B4';
    const qty = GenState.selectedFleurs[f.id] || 0;
    const isSelected = qty > 0;
    
    return `
      <div class="flower-pick-card ${isSelected ? 'selected' : ''}" id="flower-card-${f.id}">
        <div class="flower-pick-icon" style="${bg};opacity:.85" onclick="changeQty('${f.id}', 1)"></div>
        <div class="flower-pick-name">${f.nom}</div>
        <div class="flower-pick-price">${f.prix.toFixed(2)}€/tige</div>
        <div class="fleur-qty" style="display:flex; justify-content:center; align-items:center; gap:12px; margin-top:12px;">
          <button class="qty-btn" onclick="changeQty('${f.id}', -1)" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:white;cursor:pointer;color:var(--dark);font-weight:bold;">-</button>
          <span style="font-size:1rem; font-weight:600; min-width:16px; text-align:center; color:var(--wine);">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${f.id}', 1)" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:white;cursor:pointer;color:var(--dark);font-weight:bold;">+</button>
        </div>
      </div>`;
  }).join('');
}

function updateRightFooter() {
  const compText = document.getElementById('composition-text');
  const priceEl = document.getElementById('price-total');
  if (!compText || !priceEl) return;

  const totalFleurs = Object.values(GenState.selectedFleurs).reduce((a,b)=>a+b, 0);
  if (totalFleurs === 0) {
    compText.textContent = 'Aucune fleur sélectionnée';
    priceEl.textContent = '0 €';
    return;
  }

  const names = [];
  let total = 0;
  for (const [id, qty] of Object.entries(GenState.selectedFleurs)) {
    const f = CATALOGUE.fleurs.find(f => f.id === id);
    if (f) {
      names.push(`${qty}x ${f.nom}`);
      total += f.prix * qty;
    }
  }
  
  compText.textContent = names.join(', ');
  priceEl.textContent = Math.round(total * (FORMAT_MULT[GenState.taille] || 1)) + ' €';
}

function generateName() {
  const styleNames = {champetre:'Champêtre',classique:'Classique',moderne:'Moderne',boheme:'Bohème',tropical:'Tropical'};
  let couleurNom = '';
  if (window.CATALOGUE && CATALOGUE.couleurs) {
    const c = CATALOGUE.couleurs.find(c => c.id === GenState.couleur);
    if (c) couleurNom = ` — ${c.nom}`;
  }
  
  let fleurNoms = '';
  const sorted = Object.entries(GenState.selectedFleurs).sort((a,b) => b[1] - a[1]).slice(0, 2);
  if (sorted.length > 0 && window.CATALOGUE && CATALOGUE.fleurs) {
    const names = sorted.map(([id]) => {
      const f = CATALOGUE.fleurs.find(f => f.id === id);
      return f ? f.nom : '';
    }).filter(Boolean);
    if (names.length) fleurNoms = ` aux ${names.join(' & ')}`;
  }
  return `Bouquet ${styleNames[GenState.style] || ''}${couleurNom}${fleurNoms}`;
}

/* ════════════════════════════════════
   INTEGRATION IA GEMINI
════════════════════════════════════ */
async function generateWithAI() {
  const inputEl = document.getElementById('ai-prompt-input');
  const btnEl = document.getElementById('ai-generate-btn');
  const text = inputEl.value.trim();
  if (!text) return;

  const oldBtnHtml = btnEl.innerHTML;
  btnEl.innerHTML = `<svg class="animate-spin" style="animation: spin 1s linear infinite; width:16px;height:16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Création...`;
  btnEl.disabled = true;

  const API_KEY = "AIzaSyBxPTOnzFvIR1VGs4mNjjocKH_fvZzc8Io";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const SYSTEM_PROMPT = `Tu es un maître artisan fleuriste. Un client te demande un bouquet : "${text}".
Tu dois créer une composition florale abondante et réaliste en utilisant EXACTEMENT les IDs suivants du catalogue.
Renvoie UNIQUEMENT un objet JSON (sans bloc markdown) avec cette structure exacte :
{
  "style": "champetre" | "classique" | "moderne" | "boheme" | "tropical",
  "couleur": "rose-pastel" | "rouge-passion" | "blanc-pur" | "jaune-solaire" | "violet-profond",
  "forme": "rond" | "cascade" | "brassee",
  "taille": 1 | 2 | 3,
  "fleurs": [
    {"id": "rose", "qty": 5},
    {"id": "pivoine", "qty": 3}
  ]
}
Liste des IDs disponibles pour les fleurs : ["rose", "pivoine", "tulipe", "hortensia", "lys", "freesia", "renoncule", "eucalyptus", "mimosa", "anemone", "lavande", "orchidee", "dahlia", "gypsophile", "muguet"].
Choisis entre 3 et 6 types de fleurs différents. Pour chaque fleur, attribue une quantité (qty) entre 2 et 8. Le total des tiges doit être entre 12 et 25 selon l'abondance voulue. Respecte strictement les couleurs et le style demandé.`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned: " + JSON.stringify(data));
    }
    const botRes = data.candidates[0].content.parts[0].text;
    
    const cleanJson = botRes.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const json = JSON.parse(cleanJson);

    if (json.style) GenState.style = json.style;
    if (json.couleur) GenState.couleur = json.couleur;
    if (json.forme) GenState.forme = json.forme;
    if (json.taille) {
      GenState.taille = json.taille;
      const tInput = document.getElementById('taille-input');
      if (tInput) tInput.value = json.taille;
    }
    
    if (json.fleurs && Array.isArray(json.fleurs)) {
      GenState.selectedFleurs = {};
      let totalQty = 0;
      json.fleurs.forEach(f => {
        if (f.id && f.qty && typeof f.qty === 'number') {
           if (totalQty + f.qty > 30) return; // limit
           GenState.selectedFleurs[f.id] = f.qty;
           totalQty += f.qty;
        }
      });
    }

    renderStyleCards();
    renderCouleurs();
    
    document.querySelectorAll('.forme-card').forEach(c => c.classList.remove('selected'));
    const btnF = document.querySelector(`.forme-card[onclick*="${GenState.forme}"]`);
    if (btnF) btnF.classList.add('selected');

    renderFlowerGrid();
    renderBouquet();
    updateRightFooter();
    
    if (window.innerWidth <= 900) {
      document.querySelector('[data-target="panel-center"]').click();
    }

  } catch (err) {
    console.error("AI Generation failed. Error:", err);
    if (window.showToast) window.showToast("Erreur lors de la création par IA.");
    else alert("Erreur lors de la création par IA. Consultez la console.");
  } finally {
    btnEl.innerHTML = oldBtnHtml;
    btnEl.disabled = false;
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderStyleCards();
  renderCouleurs();
  renderFlowerGrid();
  renderBouquet();
  updateRightFooter();

  window.addEventListener('resize', () => {
    if (Object.keys(GenState.selectedFleurs).length > 0) renderBouquet();
  });
  
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
});
