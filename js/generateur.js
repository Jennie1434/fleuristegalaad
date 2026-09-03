const GenState = {
  style: 'champetre',
  couleur: 'rose-pastel',
  forme: 'rond',
  taille: 2, // 1-3
  selectedFleurs: [], // array of fleur ids
};

const POSITIONS = {
  rond: [
    {x:50,y:8},{x:78,y:20},{x:92,y:48},{x:82,y:76},{x:58,y:90},{x:28,y:86},{x:8,y:62},{x:10,y:34},{x:28,y:14},{x:50,y:50},{x:35,y:50},{x:65,y:48}
  ],
  cascade: [
    {x:72,y:5},{x:85,y:20},{x:65,y:32},{x:80,y:46},{x:55,y:56},{x:72,y:68},{x:42,y:72},{x:60,y:82},{x:30,y:86},{x:48,y:92},{x:18,y:90},{x:35,y:78}
  ],
  brassee: [
    {x:48,y:45},{x:28,y:28},{x:62,y:32},{x:22,y:56},{x:68,y:60},{x:40,y:68},{x:58,y:22},{x:34,y:72},{x:72,y:42},{x:18,y:38},{x:52,y:76},{x:64,y:70}
  ]
};

const FLOWER_COLORS = {
  pivoine: 'linear-gradient(135deg, #E8A0B4, #C06080)',
  rose: 'linear-gradient(135deg, #D4607A, #9B2040)',
  tulipe: 'linear-gradient(135deg, #E85878, #A03050)',
  hortensia: 'linear-gradient(135deg, #8090D0, #5060A8)',
  lys: 'linear-gradient(135deg, #F5E8D0, #D4A870)',
  freesia: 'linear-gradient(135deg, #F0E060, #C8A820)',
  renoncule: 'linear-gradient(135deg, #F0A060, #C07030)',
  eucalyptus: 'linear-gradient(135deg, #80B090, #508060)',
  mimosa: 'linear-gradient(135deg, #F8E040, #D0B000)',
  anemone: 'linear-gradient(135deg, #6040A0, #402080)',
  lavande: 'linear-gradient(135deg, #A080C0, #7050A0)',
  orchidee: 'linear-gradient(135deg, #D090C0, #A06090)',
  dahlia: 'linear-gradient(135deg, #E06040, #B03020)',
  gypsophile: 'linear-gradient(135deg, #F8F0F4, #E0D0D8)',
  muguet: 'linear-gradient(135deg, #E8F0E8, #C0D8C0)',
};

const FLOWER_SVG = `<svg viewBox="0 0 100 100" width="32" height="32" fill="rgba(255,255,255,0.9)"><circle cx="50" cy="50" r="15"/><ellipse cx="50" cy="20" rx="12" ry="18" /><ellipse cx="50" cy="80" rx="12" ry="18"/><ellipse cx="20" cy="50" rx="18" ry="12"/><ellipse cx="80" cy="50" rx="18" ry="12"/><ellipse cx="29" cy="29" rx="10" ry="16" transform="rotate(45 29 29)"/><ellipse cx="71" cy="29" rx="10" ry="16" transform="rotate(-45 71 29)"/><ellipse cx="29" cy="71" rx="10" ry="16" transform="rotate(-45 29 71)"/><ellipse cx="71" cy="71" rx="10" ry="16" transform="rotate(45 71 71)"/></svg>`;

const STYLE_ICONS = {
  champetre: 'leaf',
  classique: 'crown',
  moderne: 'zap',
  boheme: 'feather',
  tropical: 'sun'
};

const FORMAT_MULT = { 1: 1, 2: 1.5, 3: 2.2 };

document.addEventListener('DOMContentLoaded', () => {
  init();
  // Ensure default state on mobile is visible
  if (window.innerWidth <= 900) {
    document.getElementById('panel-left').classList.add('active-tab');
  }
});

function init() {
  renderStyleCards();
  renderCouleurs();
  renderFlowerGrid();
  renderBouquet();
  updateRightFooter();
}

function renderStyleCards() {
  const container = document.getElementById('style-container');
  if (!container || !window.CATALOGUE || !CATALOGUE.styles) return;
  
  container.innerHTML = CATALOGUE.styles.map(style => `
    <div class="style-card ${GenState.style === style.id ? 'selected' : ''}" onclick="selectStyle('${style.id}')">
      <div class="style-card-icon">
        <i data-lucide="${STYLE_ICONS[style.id] || 'flower'}"></i>
      </div>
      <div class="style-card-name">${style.nom}</div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function renderCouleurs() {
  const container = document.getElementById('color-container');
  if (!container || !window.CATALOGUE || !CATALOGUE.couleurs) return;
  
  container.innerHTML = CATALOGUE.couleurs.map(couleur => `
    <div class="color-swatch-item ${GenState.couleur === couleur.id ? 'selected' : ''}" onclick="selectCouleur('${couleur.id}')">
      <div class="color-swatch-circle" style="background: ${couleur.hex};"></div>
      <div class="swatch-name">${couleur.nom}</div>
    </div>
  `).join('');
}

function renderFlowerGrid() {
  const container = document.getElementById('flower-grid');
  if (!container || !window.CATALOGUE || !CATALOGUE.fleurs) return;
  
  container.innerHTML = CATALOGUE.fleurs.map(fleur => {
    const isSelected = GenState.selectedFleurs.includes(fleur.id);
    return `
      <div class="flower-pick-card ${isSelected ? 'selected' : ''}" onclick="toggleFleur('${fleur.id}')" id="flower-card-${fleur.id}">
        <div class="selected-badge"><i data-lucide="check" style="width:12px;height:12px;"></i></div>
        <div class="flower-pick-icon">
          <i data-lucide="flower-2"></i>
        </div>
        <div class="flower-pick-name">${fleur.nom}</div>
        <div class="flower-pick-price">${fleur.prix}€ / tige</div>
      </div>
    `;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

function selectStyle(id) {
  GenState.style = id;
  renderStyleCards();
  document.getElementById('bouquet-name').innerText = generateName();
}

function selectCouleur(id) {
  GenState.couleur = id;
  renderCouleurs();
  document.getElementById('bouquet-name').innerText = generateName();
}

function selectForme(id) {
  GenState.forme = id;
  document.querySelectorAll('.forme-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  renderBouquet();
}

function setTaille(val) {
  GenState.taille = parseInt(val);
  renderBouquet();
  updateRightFooter();
}

function toggleFleur(id) {
  const index = GenState.selectedFleurs.indexOf(id);
  if (index > -1) {
    GenState.selectedFleurs.splice(index, 1);
  } else {
    if (GenState.selectedFleurs.length < 12) {
      GenState.selectedFleurs.push(id);
    } else {
      if (window.showToast) window.showToast('Maximum 12 fleurs par composition');
      return;
    }
  }
  
  const card = document.getElementById(`flower-card-${id}`);
  if (card) {
    if (index > -1) card.classList.remove('selected');
    else card.classList.add('selected');
  }
  
  renderBouquet();
  updateRightFooter();
}

function renderBouquet() {
  const canvas = document.getElementById('bouquet-canvas');
  canvas.innerHTML = '';
  
  if (GenState.selectedFleurs.length === 0) {
    canvas.innerHTML = '<div class="preview-empty">Sélectionnez des fleurs pour composer votre bouquet.</div>';
    document.getElementById('bouquet-name').innerText = generateName();
    return;
  }
  
  const positions = POSITIONS[GenState.forme] || POSITIONS['rond'];
  
  GenState.selectedFleurs.forEach((fleurId, i) => {
    const pos = positions[i % positions.length];
    const size = 60 + (GenState.taille * 8);
    const bg = FLOWER_COLORS[fleurId] || FLOWER_COLORS.rose;
    
    const item = document.createElement('div');
    item.className = 'bouquet-flower-item';
    item.style.left = `${pos.x}%`;
    item.style.top = `${pos.y}%`;
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.background = bg;
    item.style.transform = 'translate(-50%, -50%)';
    item.innerHTML = FLOWER_SVG;
    
    canvas.appendChild(item);
  });
  
  document.getElementById('bouquet-name').innerText = generateName();
}

function generateName() {
  const styleNames = { champetre:'Champêtre', classique:'Classique', moderne:'Moderne', boheme:'Bohème', tropical:'Tropical' };
  
  let couleurObj = null;
  if (window.CATALOGUE && CATALOGUE.couleurs) {
    couleurObj = CATALOGUE.couleurs.find(c => c.id === GenState.couleur);
  }
  
  let fleurNames = [];
  if (window.CATALOGUE && CATALOGUE.fleurs && GenState.selectedFleurs.length > 0) {
    fleurNames = GenState.selectedFleurs.slice(0, 2).map(id => {
      const f = CATALOGUE.fleurs.find(f => f.id === id);
      return f ? f.nom : '';
    }).filter(Boolean);
  }
  
  let name = `Bouquet ${styleNames[GenState.style] || ''}`;
  if (couleurObj) name += ` — ${couleurObj.nom}`;
  if (fleurNames.length > 0) name += ` aux ${fleurNames.join(' & ')}`;
  
  return name;
}

function shuffle() {
  const canvas = document.getElementById('bouquet-canvas');
  const items = canvas.querySelectorAll('.bouquet-flower-item');
  items.forEach(item => {
    const currentLeft = parseFloat(item.style.left);
    const currentTop = parseFloat(item.style.top);
    
    const offsetLeft = (Math.random() - 0.5) * 15;
    const offsetTop = (Math.random() - 0.5) * 15;
    
    item.style.left = `${Math.max(5, Math.min(95, currentLeft + offsetLeft))}%`;
    item.style.top = `${Math.max(5, Math.min(95, currentTop + offsetTop))}%`;
  });
}

function updateRightFooter() {
  const compText = document.getElementById('composition-text');
  const priceTotal = document.getElementById('price-total');
  
  if (GenState.selectedFleurs.length === 0) {
    compText.innerText = 'Aucune fleur sélectionnée';
    priceTotal.innerText = '0 €';
    return;
  }
  
  if (!window.CATALOGUE || !CATALOGUE.fleurs) return;
  
  const names = GenState.selectedFleurs.map(id => {
    const f = CATALOGUE.fleurs.find(f => f.id === id);
    return f ? f.nom : id;
  });
  
  compText.innerText = names.join(', ');
  
  let basePrice = 0;
  GenState.selectedFleurs.forEach(id => {
    const f = CATALOGUE.fleurs.find(f => f.id === id);
    if (f) basePrice += f.prix * 3; // 3 tiges par fleur par défaut pour faire un bouquet
  });
  
  const total = basePrice * (FORMAT_MULT[GenState.taille] || 1);
  priceTotal.innerText = `${Math.round(total)} €`;
}

function copyComposition() {
  const text = document.getElementById('bouquet-name').innerText + '\n' + document.getElementById('composition-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    if (window.showToast) window.showToast('Composition copiée !');
  }).catch(err => console.error('Error copying', err));
}

function orderBouquet() {
  window.location.href = 'simulateur-prix.html';
}
