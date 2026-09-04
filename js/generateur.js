/**
 * generateur.js — Atelier Galaad
 * Créateur de bouquet avec rendu SVG fleurs réalistes (Version Garni & IA)
 */

const GenState = {
  style: 'champetre', couleur: 'rose-pastel', forme: 'rond', taille: 2,
  selectedFleurs: {}, // { "fleurId": quantity }
  lastAdded: null
};

/* ── Positions (% du canvas 400×420) ── */
// Beaucoup plus de positions pour un bouquet bien garni (chevauchement)
const POSITIONS = {
  rond: [
    // Outer ring (16)
    {x:50,y:10},{x:68,y:14},{x:83,y:24},{x:92,y:40},
    {x:95,y:55},{x:92,y:70},{x:83,y:86},{x:68,y:96},
    {x:50,y:100},{x:32,y:96},{x:17,y:86},{x:8,y:70},
    {x:5,y:55},{x:8,y:40},{x:17,y:24},{x:32,y:14},
    // Middle-outer ring (12)
    {x:50,y:25},{x:65,y:30},{x:78,y:45},{x:82,y:60},
    {x:75,y:75},{x:60,y:85},{x:40,y:85},{x:25,y:75},
    {x:18,y:60},{x:22,y:45},{x:35,y:30},{x:50,y:40},
    // Inner ring (8)
    {x:50,y:40},{x:62,y:48},{x:65,y:62},{x:50,y:70},
    {x:35,y:62},{x:38,y:48},{x:45,y:55},{x:55,y:55},
    // Center (4)
    {x:50,y:50},{x:48,y:58},{x:54,y:50},{x:50,y:45}
  ],
  cascade: [
    {x:65,y:10},{x:78,y:22},{x:60,y:30},{x:74,y:42},{x:52,y:50},{x:68,y:60},
    {x:40,y:64},{x:56,y:74},{x:32,y:80},{x:48,y:90},{x:22,y:92},{x:38,y:98},
    {x:85,y:15},{x:70,y:20},{x:82,y:35},{x:62,y:40},{x:75,y:55},{x:45,y:55},
    {x:60,y:70},{x:30,y:70},{x:45,y:85},{x:15,y:85},{x:30,y:100},{x:50,y:20},
    {x:80,y:50},{x:65,y:80},{x:35,y:90},{x:55,y:30},{x:40,y:45},{x:50,y:60},
    {x:55,y:45},{x:45,y:75},{x:25,y:95},{x:70,y:35}
  ],
  brassee: [
    {x:30,y:30},{x:50,y:20},{x:70,y:30},{x:20,y:45},{x:40,y:40},{x:60,y:40},
    {x:80,y:45},{x:30,y:60},{x:50,y:55},{x:70,y:60},{x:20,y:75},{x:40,y:75},
    {x:60,y:75},{x:80,y:75},{x:35,y:90},{x:55,y:90},{x:45,y:25},{x:25,y:35},
    {x:65,y:35},{x:15,y:55},{x:85,y:55},{x:35,y:70},{x:55,y:70},{x:25,y:85},
    {x:75,y:85},{x:45,y:50},{x:65,y:50},{x:50,y:35},{x:35,y:45},{x:75,y:65}
  ]
};

/* ── Couleurs par fleur ── */
const FLOWER_PALETTE = {
  rose:       { petale:'#E8607A', petale2:'#C04060', coeur:'#8B1A3A', feuille:'#5A8040' },
  pivoine:    { petale:'#F0B0C8', petale2:'#E080A8', coeur:'#C05080', feuille:'#4A7030' },
  tulipe:     { petale:'#E84060', petale2:'#C02040', coeur:'#FF8090', feuille:'#508040' },
  hortensia:  { petale:'#90A8E0', petale2:'#6080C8', coeur:'#FFFFFFDD', feuille:'#3A6040' },
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
   SVG FLEURS — formes uniques
══════════════════════════════════ */
const flowerShapes = {
  rose(cx, cy, r, rot, pal) {
    let svg = '';
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.52, py = cy - Math.cos(rad) * r * 0.52;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.38}" ry="${r*.52}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".92"/>`;
    });
    [36,108,180,252,324].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.28, py = cy - Math.cos(rad) * r * 0.28;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.26}" ry="${r*.34}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale2}" opacity=".95"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="${pal.coeur}"/><circle cx="${cx}" cy="${cy}" r="${r*.09}" fill="#FFEC80" opacity=".7"/>`;
    return svg;
  },
  pivoine(cx, cy, r, rot, pal) {
    let svg = '';
    [{nb:6, dist:.55, rx:.36, ry:.50},{nb:6, dist:.34, rx:.28, ry:.38},{nb:5, dist:.18, rx:.22, ry:.28}].forEach(({nb, dist, rx, ry}, ring) => {
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 15;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 0 ? pal.petale : ring === 1 ? pal.petale2 : pal.coeur;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${r*rx}" ry="${r*ry}" transform="rotate(${a} ${px} ${py})" fill="${c}" opacity="${.85 + ring*.05}"/>`;
      }
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.12}" fill="#FFEC80" opacity=".8"/>`;
    return svg;
  },
  tulipe(cx, cy, r, rot, pal) {
    let svg = '';
    [0,120,240].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.38, py = cy - Math.cos(rad) * r * 0.38;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.3}" ry="${r*.55}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".9"/>`;
    });
    [60,180,300].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.22, py = cy - Math.cos(rad) * r * 0.22;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.22}" ry="${r*.4}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale2}" opacity=".95"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.12}" fill="${pal.petale2}"/>`;
    return svg;
  },
  hortensia(cx, cy, r, rot, pal) {
    let svg = '';
    const positions = [[0,0],[.45,0],[-.45,0],[0,.45],[0,-.45],[.32,.32],[-.32,.32],[.32,-.32],[-.32,-.32],[.55,.2],[-.55,.2],[0,.6]];
    positions.slice(0, 9).forEach(([dx, dy]) => {
      const px = cx + dx * r, py = cy + dy * r, sr = r * 0.22;
      [0,90,180,270].forEach(a => {
        const rad = (a + rot) * Math.PI / 180;
        svg += `<ellipse cx="${px + Math.sin(rad)*sr*.7}" cy="${py - Math.cos(rad)*sr*.7}" rx="${sr*.55}" ry="${sr*.38}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".88"/>`;
      });
      svg += `<circle cx="${px}" cy="${py}" r="${sr*.3}" fill="${pal.coeur}"/>`;
    });
    return svg;
  },
  lys(cx, cy, r, rot, pal) {
    let svg = '';
    [0,60,120,180,240,300].forEach((a, i) => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.48, py = cy - Math.cos(rad) * r * 0.48;
      const c = i % 2 === 0 ? pal.petale : pal.petale2;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.22}" ry="${r*.58}" transform="rotate(${a+rot} ${px} ${py})" fill="${c}" opacity=".9"/>`;
    });
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(rad)*r*.4}" y2="${cy-Math.cos(rad)*r*.4}" stroke="${pal.coeur}" stroke-width="1.5" opacity=".7"/><circle cx="${cx+Math.sin(rad)*r*.4}" cy="${cy-Math.cos(rad)*r*.4}" r="2.5" fill="${pal.coeur}"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.14}" fill="${pal.petale2}" opacity=".8"/>`;
    return svg;
  },
  anemone(cx, cy, r, rot, pal) {
    let svg = '';
    [0,51,103,154,206,257,309].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.44, py = cy - Math.cos(rad) * r * 0.44;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.38}" ry="${r*.48}" transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".87"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.26}" fill="${pal.coeur}"/>`;
    [0,45,90,135,180,225,270,315].forEach(a => {
      const rad = a * Math.PI / 180;
      svg += `<circle cx="${cx+Math.sin(rad)*r*.18}" cy="${cy-Math.cos(rad)*r*.18}" r="2" fill="#FFFFFF" opacity=".8"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.06}" fill="#FFFDE0"/>`;
    return svg;
  },
  dahlia(cx, cy, r, rot, pal) {
    let svg = '';
    for (let ring = 3; ring >= 1; ring--) {
      const nb = ring * 6, dist = (ring / 3) * 0.5, pr = r * (0.16 + ring * 0.04);
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 8;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 3 ? pal.petale : ring === 2 ? pal.petale2 : pal.coeur;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${pr*.55}" ry="${pr}" transform="rotate(${a} ${px} ${py})" fill="${c}" opacity=".9"/>`;
      }
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.1}" fill="#FFEC80"/>`;
    return svg;
  },
  lavande(cx, cy, r, rot, pal) {
    let svg = '';
    svg += `<line x1="${cx}" y1="${cy+r*.7}" x2="${cx}" y2="${cy-r*.6}" stroke="${pal.feuille}" stroke-width="2.5" opacity=".8"/>`;
    const nb = 8;
    for (let i = 0; i < nb; i++) {
      const t = i / (nb - 1);
      const y = cy + r * (.6 - t * 1.2);
      const side = i % 2 === 0 ? 1 : -1;
      const x = cx + side * r * .18;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${r*.12}" ry="${r*.17}" fill="${i < 3 ? pal.petale2 : pal.petale}" opacity=".9"/>`;
    }
    svg += `<ellipse cx="${cx-r*.28}" cy="${cy+r*.2}" rx="${r*.14}" ry="${r*.28}" transform="rotate(-30 ${cx-r*.28} ${cy+r*.2})" fill="${pal.feuille}" opacity=".7"/>`;
    svg += `<ellipse cx="${cx+r*.28}" cy="${cy+r*.3}" rx="${r*.14}" ry="${r*.28}" transform="rotate(30 ${cx+r*.28} ${cy+r*.3})" fill="${pal.feuille}" opacity=".7"/>`;
    return svg;
  },
  gypsophile(cx, cy, r, rot, pal) {
    let svg = '';
    const dots = [[0,0],[.38,-.18],[-.35,-.22],[.18,.38],[-.28,.32],[.45,.1],[-.5,.08],[.1,-.45],[.28,.18],[-.18,.42],[.4,.3],[-.4,.2],[0,.5],[.5,-.2]];
    dots.forEach(([dx, dy]) => {
      const x = cx + dx * r, y = cy + dy * r;
      const s = r * (.18 + Math.random() * 0.12);
      [0,90,180,270].forEach(a => {
        const rad = a * Math.PI / 180;
        svg += `<ellipse cx="${x+Math.sin(rad)*s*.6}" cy="${y-Math.cos(rad)*s*.6}" rx="${s*.45}" ry="${s*.28}" transform="rotate(${a} ${x} ${y})" fill="${pal.petale}" opacity=".85"/>`;
      });
      svg += `<circle cx="${x}" cy="${y}" r="${s*.22}" fill="${pal.petale2}"/>`;
    });
    return svg;
  },
  muguet(cx, cy, r, rot, pal) {
    let svg = '';
    svg += `<path d="M${cx},${cy+r*.7} Q${cx+r*.3},${cy} ${cx},${cy-r*.5}" fill="none" stroke="${pal.feuille}" stroke-width="2"/>`;
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x = cx + Math.sin(t * Math.PI) * r * .35;
      const y = cy + r * (.6 - t * 1.1);
      svg += `<path d="M${x},${y-r*.08} Q${x+r*.12},${y-r*.06} ${x+r*.12},${y+r*.08} Q${x+r*.12},${y+r*.18} ${x},${y+r*.18} Q${x-r*.12},${y+r*.18} ${x-r*.12},${y+r*.08} Q${x-r*.12},${y-r*.06} ${x},${y-r*.08} Z" fill="${pal.petale}" opacity=".92"/>`;
      svg += `<line x1="${cx}" y1="${y}" x2="${x}" y2="${y}" stroke="${pal.feuille}" stroke-width="1.2" opacity=".6"/>`;
    }
    return svg;
  },
  generic(cx, cy, r, rot, pal, nb = 5) {
    let svg = '';
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * 360 + rot;
      const rad = a * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.45, py = cy - Math.cos(rad) * r * 0.45;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.35}" ry="${r*.5}" transform="rotate(${a} ${px} ${py})" fill="${i%2===0?pal.petale:pal.petale2}" opacity=".9"/>`;
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.2}" fill="${pal.coeur}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.08}" fill="#FFEC80" opacity=".8"/>`;
    return svg;
  }
};

function getFlowerSVG(id, cx, cy, r, rot = 0) {
  const pal = FLOWER_PALETTE[id] || FLOWER_PALETTE.rose;
  const shapes = {
    rose:       () => flowerShapes.rose(cx, cy, r, rot, pal),
    pivoine:    () => flowerShapes.pivoine(cx, cy, r, rot, pal),
    tulipe:     () => flowerShapes.tulipe(cx, cy, r, rot, pal),
    hortensia:  () => flowerShapes.hortensia(cx, cy, r, rot, pal),
    lys:        () => flowerShapes.lys(cx, cy, r, rot, pal),
    anemone:    () => flowerShapes.anemone(cx, cy, r, rot, pal),
    dahlia:     () => flowerShapes.dahlia(cx, cy, r, rot, pal),
    lavande:    () => flowerShapes.lavande(cx, cy, r, rot, pal),
    gypsophile: () => flowerShapes.gypsophile(cx, cy, r, rot, pal),
    muguet:     () => flowerShapes.muguet(cx, cy, r, rot, pal),
  };
  return (shapes[id] || (() => flowerShapes.generic(cx, cy, r, rot, pal)))();
}

/* ════════════════════════════════════
   RENDU BOUQUET
════════════════════════════════════ */
function renderBouquet(newFleurId = null) {
  const canvasEl = document.getElementById('bouquet-canvas');
  if (!canvasEl) return;

  const W = canvasEl.offsetWidth  || 380;
  const H = canvasEl.offsetHeight || 420;

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
  
  // Générer un tableau plat des tiges
  let stemIds = [];
  
  // Ajout de feuillage de base pour garnir (Eucalyptus ou Gypsophile selon le style)
  const filler = GenState.style === 'boheme' || GenState.style === 'champetre' ? 'gypsophile' : 'eucalyptus';
  const fillerCount = Math.min(10, Math.ceil(totalFleurs * 0.6));
  for(let i=0; i<fillerCount; i++) stemIds.push(filler);

  // Ajout des fleurs choisies
  for (const [id, qty] of Object.entries(GenState.selectedFleurs)) {
    for (let i = 0; i < qty; i++) {
      stemIds.push(id);
    }
  }

  // Shuffle pour mélanger feuilles et fleurs et rendre ça organique
  // seeded random pour ne pas sauter à chaque rendu
  function seedRandom(s) {
    return function() {
      s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
  }
  let random = seedRandom(totalFleurs * 42); 
  stemIds.sort(() => random() - 0.5);

  const fleurSize = 24 + GenState.taille * 8; // taille ajustée

  const handleX = W / 2;
  const handleY = H * 0.92;

  let stemsPath = '';
  let flowerGroups = '';

  stemIds.forEach((fleurId, i) => {
    // on boucle sur les positions si plus de fleurs que de positions prévues
    const pos = basePositions[i % basePositions.length];
    
    // Ajout d'un petit bruit pour ne pas superposer exactement
    const noiseX = (random() - 0.5) * 12;
    const noiseY = (random() - 0.5) * 12;
    
    const cx = ((pos.x + noiseX) / 100) * W;
    const cy = ((pos.y + noiseY) / 100) * H * 0.85; 
    const r  = fleurId === 'eucalyptus' || fleurId === 'gypsophile' ? fleurSize * 0.8 : fleurSize;
    const rot = (i * 137.5) % 360; // angle doré pour variété

    // ── Tige ──
    const midX = (cx + handleX) / 2 + (random() - 0.5) * 20;
    const midY = cy + (handleY - cy) * 0.6;
    const stemColor = FLOWER_PALETTE[fleurId]?.feuille || '#508040';
    stemsPath += `<path d="M${cx},${cy+r*.7} Q${midX},${midY} ${handleX},${handleY}" fill="none" stroke="${stemColor}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`;

    // ── Tête de fleur ──
    const isNew = fleurId === newFleurId && i === stemIds.length - 1;
    const animClass = isNew ? 'flower-bloom' : '';
    const animStyle = isNew ? `animation-delay:0s` : ''; // instant

    flowerGroups += `
      <g class="${animClass}" style="${animStyle}" transform-origin="${cx} ${cy}">
        ${getFlowerSVG(fleurId, cx, cy, r, rot)}
      </g>`;
  });

  const ribbon = `
    <ellipse cx="${handleX}" cy="${handleY}" rx="22" ry="10" fill="#C9A96E" opacity=".9"/>
    <rect x="${handleX-8}" y="${handleY}" width="16" height="28" rx="3" fill="#B08840" opacity=".8"/>
    <path d="M${handleX-22},${handleY} L${handleX},${handleY-14} L${handleX+22},${handleY}" fill="rgba(201,169,110,0.3)"/>`;

  canvasEl.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <style>
        .flower-bloom { animation: fleurBloom 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        @keyframes fleurBloom {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      </style>
      ${stemsPath}
      ${ribbon}
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
    // Calcul du total pour limiter (ex: 25 fleurs max)
    let total = Object.values(GenState.selectedFleurs).reduce((a,b)=>a+b, 0);
    if (delta > 0 && total >= 25) {
      if (window.showToast) window.showToast('Maximum 25 fleurs par bouquet');
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

function shuffle() { renderBouquet(); } // Render has random noise already

function copyComposition() {
  const name = (document.getElementById('bouquet-name') || {}).textContent || '';
  const comp = (document.getElementById('composition-text') || {}).textContent || '';
  navigator.clipboard.writeText(`${name}\n${comp}`).then(() => { if (window.showToast) window.showToast('Composition copiée !'); });
}

function orderBouquet() { window.location.href = 'simulateur-prix.html'; }

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
  // Prendre les 2 fleurs les plus nombreuses
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
           if (totalQty + f.qty > 25) return; // limit
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
