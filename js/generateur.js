/**
 * generateur.js — Atelier Galaad
 * Créateur de bouquet avec rendu SVG fleurs réalistes
 */

const GenState = {
  style: 'champetre', couleur: 'rose-pastel', forme: 'rond', taille: 2,
  selectedFleurs: [], lastAdded: null
};

/* ── Positions (% du canvas 400×420) ── */
const POSITIONS = {
  rond: [
    {x:50,y:18},{x:73,y:26},{x:84,y:46},{x:78,y:66},
    {x:60,y:76},{x:38,y:76},{x:20,y:66},{x:16,y:46},
    {x:27,y:26},{x:50,y:48},{x:38,y:38},{x:62,y:38}
  ],
  cascade: [
    {x:65,y:10},{x:78,y:22},{x:60,y:30},{x:74,y:42},
    {x:52,y:50},{x:68,y:60},{x:40,y:64},{x:56,y:74},
    {x:30,y:78},{x:46,y:86},{x:22,y:84},{x:36,y:70}
  ],
  brassee: [
    {x:48,y:30},{x:30,y:22},{x:64,y:24},{x:22,y:42},
    {x:66,y:46},{x:40,y:56},{x:58,y:18},{x:34,y:64},
    {x:70,y:34},{x:20,y:55},{x:52,y:68},{x:62,y:60}
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

  /** Rose : pétales en ellipses concentriques */
  rose(cx, cy, r, rot, pal) {
    let svg = '';
    // 5 pétales externes
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.52, py = cy - Math.cos(rad) * r * 0.52;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.38}" ry="${r*.52}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".92"/>`;
    });
    // 5 pétales internes
    [36,108,180,252,324].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.28, py = cy - Math.cos(rad) * r * 0.28;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.26}" ry="${r*.34}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale2}" opacity=".95"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="${pal.coeur}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.09}" fill="#FFEC80" opacity=".7"/>`;
    return svg;
  },

  /** Pivoine : nombreux pétales arrondis en éventail */
  pivoine(cx, cy, r, rot, pal) {
    let svg = '';
    // 3 couches de pétales
    [
      {nb:6, dist:.55, rx:.36, ry:.50},
      {nb:6, dist:.34, rx:.28, ry:.38},
      {nb:5, dist:.18, rx:.22, ry:.28}
    ].forEach(({nb, dist, rx, ry}, ring) => {
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 15;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 0 ? pal.petale : ring === 1 ? pal.petale2 : pal.coeur;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${r*rx}" ry="${r*ry}"
          transform="rotate(${a} ${px} ${py})" fill="${c}" opacity="${.85 + ring*.05}"/>`;
      }
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.12}" fill="#FFEC80" opacity=".8"/>`;
    return svg;
  },

  /** Tulipe : 3 pétales extérieurs + 3 intérieurs en coupe */
  tulipe(cx, cy, r, rot, pal) {
    let svg = '';
    [0,120,240].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.38, py = cy - Math.cos(rad) * r * 0.38;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.3}" ry="${r*.55}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".9"/>`;
    });
    [60,180,300].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.22, py = cy - Math.cos(rad) * r * 0.22;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.22}" ry="${r*.4}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale2}" opacity=".95"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.12}" fill="${pal.petale2}"/>`;
    return svg;
  },

  /** Hortensia : cluster de 12 petites fleurs 4 pétales */
  hortensia(cx, cy, r, rot, pal) {
    let svg = '';
    const positions = [
      [0,0],[.45,0],[-.45,0],[0,.45],[0,-.45],
      [.32,.32],[-.32,.32],[.32,-.32],[-.32,-.32],
      [.55,.2],[-.55,.2],[0,.6]
    ];
    positions.slice(0, 9).forEach(([dx, dy]) => {
      const px = cx + dx * r, py = cy + dy * r, sr = r * 0.22;
      [0,90,180,270].forEach(a => {
        const rad = (a + rot) * Math.PI / 180;
        svg += `<ellipse cx="${px + Math.sin(rad)*sr*.7}" cy="${py - Math.cos(rad)*sr*.7}"
          rx="${sr*.55}" ry="${sr*.38}" transform="rotate(${a+rot} ${px} ${py})"
          fill="${pal.petale}" opacity=".88"/>`;
      });
      svg += `<circle cx="${px}" cy="${py}" r="${sr*.3}" fill="${pal.coeur}"/>`;
    });
    return svg;
  },

  /** Lys : 6 pétales longs et pointus + étamines */
  lys(cx, cy, r, rot, pal) {
    let svg = '';
    [0,60,120,180,240,300].forEach((a, i) => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.48, py = cy - Math.cos(rad) * r * 0.48;
      const c = i % 2 === 0 ? pal.petale : pal.petale2;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.22}" ry="${r*.58}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${c}" opacity=".9"/>`;
    });
    // Étamines
    [0,72,144,216,288].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(rad)*r*.4}" y2="${cy-Math.cos(rad)*r*.4}"
        stroke="${pal.coeur}" stroke-width="1.5" opacity=".7"/>
        <circle cx="${cx+Math.sin(rad)*r*.4}" cy="${cy-Math.cos(rad)*r*.4}" r="2.5" fill="${pal.coeur}"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.14}" fill="${pal.petale2}" opacity=".8"/>`;
    return svg;
  },

  /** Anémone : 5-7 pétales larges + centre foncé avec étamines */
  anemone(cx, cy, r, rot, pal) {
    let svg = '';
    [0,51,103,154,206,257,309].forEach(a => {
      const rad = (a + rot) * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.44, py = cy - Math.cos(rad) * r * 0.44;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.38}" ry="${r*.48}"
        transform="rotate(${a+rot} ${px} ${py})" fill="${pal.petale}" opacity=".87"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.26}" fill="${pal.coeur}"/>`;
    // Petites étamines blanches
    [0,45,90,135,180,225,270,315].forEach(a => {
      const rad = a * Math.PI / 180;
      svg += `<circle cx="${cx+Math.sin(rad)*r*.18}" cy="${cy-Math.cos(rad)*r*.18}"
        r="2" fill="#FFFFFF" opacity=".8"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.06}" fill="#FFFDE0"/>`;
    return svg;
  },

  /** Dahlia : nombreux pétales géométriques en lignes */
  dahlia(cx, cy, r, rot, pal) {
    let svg = '';
    for (let ring = 3; ring >= 1; ring--) {
      const nb = ring * 6, dist = (ring / 3) * 0.5, pr = r * (0.16 + ring * 0.04);
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 360 + rot + ring * 8;
        const rad = a * Math.PI / 180;
        const px = cx + Math.sin(rad) * r * dist, py = cy - Math.cos(rad) * r * dist;
        const c = ring === 3 ? pal.petale : ring === 2 ? pal.petale2 : pal.coeur;
        svg += `<ellipse cx="${px}" cy="${py}" rx="${pr*.55}" ry="${pr}"
          transform="rotate(${a} ${px} ${py})" fill="${c}" opacity=".9"/>`;
      }
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.1}" fill="#FFEC80"/>`;
    return svg;
  },

  /** Lavande : tige avec petits boutons violets */
  lavande(cx, cy, r, rot, pal) {
    let svg = '';
    // Tige centrale
    svg += `<line x1="${cx}" y1="${cy+r*.7}" x2="${cx}" y2="${cy-r*.6}"
      stroke="${pal.feuille}" stroke-width="2.5" opacity=".8"/>`;
    // Boutons sur la tige
    const nb = 8;
    for (let i = 0; i < nb; i++) {
      const t = i / (nb - 1);
      const y = cy + r * (.6 - t * 1.2);
      const side = i % 2 === 0 ? 1 : -1;
      const x = cx + side * r * .18;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${r*.12}" ry="${r*.17}"
        fill="${i < 3 ? pal.petale2 : pal.petale}" opacity=".9"/>`;
    }
    // Petites feuilles
    svg += `<ellipse cx="${cx-r*.28}" cy="${cy+r*.2}" rx="${r*.14}" ry="${r*.28}"
      transform="rotate(-30 ${cx-r*.28} ${cy+r*.2})" fill="${pal.feuille}" opacity=".7"/>`;
    svg += `<ellipse cx="${cx+r*.28}" cy="${cy+r*.3}" rx="${r*.14}" ry="${r*.28}"
      transform="rotate(30 ${cx+r*.28} ${cy+r*.3})" fill="${pal.feuille}" opacity=".7"/>`;
    return svg;
  },

  /** Gypsophile : nuage de mini-fleurs */
  gypsophile(cx, cy, r, rot, pal) {
    let svg = '';
    const dots = [
      [0,0],[.38,-.18],[-.35,-.22],[.18,.38],[-.28,.32],
      [.45,.1],[-.5,.08],[.1,-.45],[.28,.18],[-.18,.42],
      [.4,.3],[-.4,.2],[0,.5],[.5,-.2]
    ];
    dots.forEach(([dx, dy]) => {
      const x = cx + dx * r, y = cy + dy * r;
      const s = r * (.18 + Math.random() * 0.12);
      [0,90,180,270].forEach(a => {
        const rad = a * Math.PI / 180;
        svg += `<ellipse cx="${x+Math.sin(rad)*s*.6}" cy="${y-Math.cos(rad)*s*.6}"
          rx="${s*.45}" ry="${s*.28}" transform="rotate(${a} ${x} ${y})"
          fill="${pal.petale}" opacity=".85"/>`;
      });
      svg += `<circle cx="${x}" cy="${y}" r="${s*.22}" fill="${pal.petale2}"/>`;
    });
    return svg;
  },

  /** Muguet : petites clochettes sur tige courbe */
  muguet(cx, cy, r, rot, pal) {
    let svg = '';
    // Tige courbe
    svg += `<path d="M${cx},${cy+r*.7} Q${cx+r*.3},${cy} ${cx},${cy-r*.5}"
      fill="none" stroke="${pal.feuille}" stroke-width="2"/>`;
    // 6 clochettes
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x = cx + Math.sin(t * Math.PI) * r * .35;
      const y = cy + r * (.6 - t * 1.1);
      svg += `<path d="M${x},${y-r*.08} Q${x+r*.12},${y-r*.06} ${x+r*.12},${y+r*.08}
        Q${x+r*.12},${y+r*.18} ${x},${y+r*.18} Q${x-r*.12},${y+r*.18} ${x-r*.12},${y+r*.08}
        Q${x-r*.12},${y-r*.06} ${x},${y-r*.08} Z"
        fill="${pal.petale}" opacity=".92"/>`;
      // Petite ligne de la tige à la clochette
      svg += `<line x1="${cx}" y1="${y}" x2="${x}" y2="${y}"
        stroke="${pal.feuille}" stroke-width="1.2" opacity=".6"/>`;
    }
    return svg;
  },

  /** Fallback : renoncule / freesia / mimosa / orchidée (simplifiés) */
  generic(cx, cy, r, rot, pal, nb = 5) {
    let svg = '';
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * 360 + rot;
      const rad = a * Math.PI / 180;
      const px = cx + Math.sin(rad) * r * 0.45, py = cy - Math.cos(rad) * r * 0.45;
      svg += `<ellipse cx="${px}" cy="${py}" rx="${r*.35}" ry="${r*.5}"
        transform="rotate(${a} ${px} ${py})" fill="${i%2===0?pal.petale:pal.petale2}" opacity=".9"/>`;
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.2}" fill="${pal.coeur}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r*.08}" fill="#FFEC80" opacity=".8"/>`;
    return svg;
  }
};

/* ── Sélecteur de forme par ID ── */
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

  if (GenState.selectedFleurs.length === 0) {
    canvasEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:0.4;color:white;gap:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style="font-family:var(--font-serif);font-size:1.1rem;font-style:italic;">Sélectionnez des fleurs</span>
      </div>`;
    if (document.getElementById('bouquet-name')) document.getElementById('bouquet-name').textContent = 'Votre bouquet';
    return;
  }

  const positions = POSITIONS[GenState.forme] || POSITIONS.rond;
  const fleurSize = 28 + GenState.taille * 10; // rayon de chaque fleur

  // Point de convergence des tiges (centre bas)
  const handleX = W / 2;
  const handleY = H * 0.92;

  let stemsPath = '';
  let flowerGroups = '';

  GenState.selectedFleurs.forEach((fleurId, i) => {
    const pos = positions[i % positions.length];
    const cx = (pos.x / 100) * W;
    const cy = (pos.y / 100) * H * 0.85; // zone fleurs = 85% du canvas
    const r  = fleurSize;
    const rot = (i * 37) % 360; // rotation légèrement différente pour chaque fleur

    // ── Tige (courbe de Bézier vers le bas) ──
    const midX = (cx + handleX) / 2 + (Math.random() - 0.5) * 20;
    const midY = cy + (handleY - cy) * 0.6;
    const stemColor = FLOWER_PALETTE[fleurId]?.feuille || '#508040';
    stemsPath += `<path d="M${cx},${cy+r*.7} Q${midX},${midY} ${handleX},${handleY}"
      fill="none" stroke="${stemColor}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`;

    // Petite feuille sur la tige
    if (i < 8) {
      const lx = cx * 0.4 + handleX * 0.6;
      const ly = cy * 0.3 + handleY * 0.7;
      const la = -30 + (i % 2) * 60;
      stemsPath += `<ellipse cx="${lx}" cy="${ly}" rx="5" ry="9"
        transform="rotate(${la} ${lx} ${ly})" fill="${stemColor}" opacity=".65"/>`;
    }

    // ── Tête de fleur ──
    const isNew = fleurId === newFleurId && i === GenState.selectedFleurs.length - 1;
    const animClass = isNew ? 'flower-bloom' : '';
    const animStyle = isNew ? `animation-delay:${i * 0.05}s` : '';

    flowerGroups += `
      <g class="${animClass}" style="${animStyle}" transform-origin="${cx} ${cy}">
        ${getFlowerSVG(fleurId, cx, cy, r, rot)}
      </g>`;
  });

  // ── Ruban/manchon du bouquet ──
  const ribbon = `
    <ellipse cx="${handleX}" cy="${handleY}" rx="18" ry="8" fill="#C9A96E" opacity=".9"/>
    <rect x="${handleX-6}" y="${handleY}" width="12" height="22" rx="3" fill="#B08840" opacity=".8"/>
    <path d="M${handleX-18},${handleY} L${handleX},${handleY-12} L${handleX+18},${handleY}" 
      fill="rgba(201,169,110,0.3)"/>`;

  // ── Assemblage SVG ──
  canvasEl.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
         xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <style>
        .flower-bloom {
          animation: fleurBloom 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes fleurBloom {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      </style>

      <!-- Tiges -->
      ${stemsPath}

      <!-- Ruban -->
      ${ribbon}

      <!-- Fleurs (par-dessus les tiges) -->
      ${flowerGroups}
    </svg>`;

  // Nom du bouquet
  const nameEl = document.getElementById('bouquet-name');
  if (nameEl) nameEl.textContent = generateName();
}

/* ════════════════════════════════════
   INTERACTIONS
════════════════════════════════════ */
function toggleFleur(id) {
  const idx = GenState.selectedFleurs.indexOf(id);
  if (idx > -1) {
    GenState.selectedFleurs.splice(idx, 1);
    GenState.lastAdded = null;
    const card = document.getElementById(`flower-card-${id}`);
    if (card) card.classList.remove('selected');
    renderBouquet();
  } else {
    if (GenState.selectedFleurs.length >= 12) {
      if (window.showToast) window.showToast('Maximum 12 fleurs par composition');
      return;
    }
    GenState.selectedFleurs.push(id);
    GenState.lastAdded = id;
    const card = document.getElementById(`flower-card-${id}`);
    if (card) card.classList.add('selected');
    renderBouquet(id); // passe l'id pour animer la nouvelle fleur
  }
  updateRightFooter();
}

function selectStyle(id) {
  GenState.style = id;
  renderStyleCards();
  if (document.getElementById('bouquet-name'))
    document.getElementById('bouquet-name').textContent = generateName();
}

function selectCouleur(id) {
  GenState.couleur = id;
  renderCouleurs();
  if (document.getElementById('bouquet-name'))
    document.getElementById('bouquet-name').textContent = generateName();
}

function selectForme(id) {
  GenState.forme = id;
  document.querySelectorAll('.forme-card').forEach(c => c.classList.remove('selected'));
  const btn = document.querySelector(`.forme-card[data-forme="${id}"]`);
  if (btn) btn.classList.add('selected');
  renderBouquet();
}

function setTaille(val) {
  GenState.taille = parseInt(val);
  renderBouquet();
  updateRightFooter();
}

function shuffle() {
  // Shuffle ordre des fleurs pour les repositionner
  GenState.selectedFleurs = GenState.selectedFleurs.sort(() => Math.random() - 0.5);
  renderBouquet();
}

function copyComposition() {
  const name = (document.getElementById('bouquet-name') || {}).textContent || '';
  const comp = (document.getElementById('composition-text') || {}).textContent || '';
  navigator.clipboard.writeText(`${name}\n${comp}`)
    .then(() => { if (window.showToast) window.showToast('Composition copiée !'); });
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
    <div class="color-swatch-item ${GenState.couleur === c.id ? 'selected' : ''}"
         onclick="selectCouleur('${c.id}')">
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
    const isSelected = GenState.selectedFleurs.includes(f.id);
    return `
      <div class="flower-pick-card ${isSelected ? 'selected' : ''}"
           onclick="toggleFleur('${f.id}')" id="flower-card-${f.id}">
        <div class="selected-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="flower-pick-icon" style="${bg};opacity:.85"></div>
        <div class="flower-pick-name">${f.nom}</div>
        <div class="flower-pick-price">${f.prix}€/tige</div>
      </div>`;
  }).join('');
}

function updateRightFooter() {
  const compText  = document.getElementById('composition-text');
  const priceEl   = document.getElementById('price-total');
  if (!compText || !priceEl) return;

  if (GenState.selectedFleurs.length === 0) {
    compText.textContent = 'Aucune fleur sélectionnée';
    priceEl.textContent  = '0 €';
    return;
  }
  if (!window.CATALOGUE || !CATALOGUE.fleurs) return;

  const names = GenState.selectedFleurs.map(id => {
    const f = CATALOGUE.fleurs.find(f => f.id === id);
    return f ? f.nom : id;
  });
  compText.textContent = names.join(', ');

  let total = 0;
  GenState.selectedFleurs.forEach(id => {
    const f = CATALOGUE.fleurs.find(f => f.id === id);
    if (f) total += f.prix * 3;
  });
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
  if (window.CATALOGUE && CATALOGUE.fleurs && GenState.selectedFleurs.length > 0) {
    const names = GenState.selectedFleurs.slice(0, 2).map(id => {
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

  // UI Loading
  const oldBtnHtml = btnEl.innerHTML;
  btnEl.innerHTML = `<svg class="animate-spin" style="animation: spin 1s linear infinite; width:16px;height:16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Création...`;
  btnEl.disabled = true;

  const API_KEY = "AIzaSyBxPTOnzFvIR1VGs4mNjjocKH_fvZzc8Io";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const SYSTEM_PROMPT = `Tu es un artisan fleuriste de luxe. Un client te demande un bouquet : "${text}".
  Tu dois composer un bouquet en utilisant EXACTEMENT les IDs suivants du catalogue.
  Renvoie UNIQUEMENT un objet JSON (sans balise markdown de code) avec cette structure :
  {
    "style": "champetre" | "classique" | "moderne" | "boheme" | "tropical",
    "couleur": "rose-pastel" | "rouge-passion" | "blanc-pur" | "jaune-solaire" | "violet-profond",
    "forme": "rond" | "cascade" | "brassee",
    "taille": 1 | 2 | 3,
    "fleurs": ["rose", "pivoine", "tulipe", "hortensia", "lys", "freesia", "renoncule", "eucalyptus", "mimosa", "anemone", "lavande", "orchidee", "dahlia", "gypsophile", "muguet"] (choisis de 3 à 12 IDs parmi cette liste exacte selon la cohérence et le budget implicite)
  }`;

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
    
    // Nettoyage au cas où Gemini renvoie des balises Markdown ```json ... ```
    const cleanJson = botRes.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const json = JSON.parse(cleanJson);

    // Update state
    if (json.style) GenState.style = json.style;
    if (json.couleur) GenState.couleur = json.couleur;
    if (json.forme) GenState.forme = json.forme;
    if (json.taille) {
      GenState.taille = json.taille;
      const tInput = document.getElementById('taille-input');
      if (tInput) tInput.value = json.taille;
    }
    if (json.fleurs && Array.isArray(json.fleurs)) {
      GenState.selectedFleurs = json.fleurs.slice(0, 12);
    }

    // Refresh UI
    renderStyleCards();
    renderCouleurs();
    
    document.querySelectorAll('.forme-card').forEach(c => c.classList.remove('selected'));
    const btnF = document.querySelector(\`.forme-card[onclick*="\${GenState.forme}"]\`);
    if (btnF) btnF.classList.add('selected');

    renderFlowerGrid();
    renderBouquet();
    updateRightFooter();
    
    // Smooth scroll to preview on mobile
    if (window.innerWidth <= 900) {
      document.querySelector('[data-target="panel-center"]').click();
    }

  } catch (err) {
    console.error("AI Generation failed. Error:", err);
    if (window.showToast) window.showToast("Erreur lors de la création par IA.");
    else alert("Erreur lors de la création par IA. Consultez la console pour plus de détails.");
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

  // Resize → re-render
  window.addEventListener('resize', () => {
    if (GenState.selectedFleurs.length > 0) renderBouquet();
  });
  
  // Style for spinner
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = \`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\`;
    document.head.appendChild(style);
  }
});
