/**
 * devis.js — Atelier Galaad
 * Wizard 5 étapes pour devis mariage
 */

const devisApp = {
  state: {
    step: 1, totalSteps: 5,
    // Étape 1
    date: '', city: '', guests: 120, venue: null,
    // Étape 2
    style: null, couleur: null,
    // Étape 3
    bouquetMariee: 'luxe', demoiNb: 2, boutNb: 4,
    centresNb: 8, centreStyle: 'simple',
    arche: false, archeStyle: 'simple',
    // Étape 4
    cheminTable: false, cheminMetres: 5,
    petales: false, couronne: false, livraison: false,
    installation: false, demontage: false,
  },

  init() {
    this.renderStyles();
    this.renderCouleurs();
    this.bindEvents();
    this.updateProgress();
    this.updateStepIndicator(1);
    // Hide arche options by default
    const archeOpts = document.getElementById('arche-options');
    if (archeOpts) archeOpts.style.display = 'none';
  },

  bindEvents() {
    // Guests slider
    const range = document.getElementById('guests-range');
    const display = document.getElementById('guests-display');
    if (range && display) {
      range.addEventListener('input', (e) => {
        this.state.guests = parseInt(e.target.value);
        display.textContent = this.state.guests;
        // Update range fill
        const pct = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100;
        e.target.style.background = `linear-gradient(90deg, var(--wine) ${pct}%, var(--border) ${pct}%)`;
      });
    }
    // Form submit
    const form = document.getElementById('devis-form');
    if (form) form.addEventListener('submit', this.handleSubmit.bind(this));
  },

  /* ── Navigation ── */
  showStep(n) {
    // Panels
    document.querySelectorAll('.dv-panel').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`step-${n}`);
    if (target) target.classList.add('active');

    this.state.step = n;
    this.updateProgress();
    this.updateStepIndicator(n);

    if (n === 5) this.buildRecap();

    const main = document.querySelector('.devis-main');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  nextStep() {
    if (this.validateStep(this.state.step) && this.state.step < this.state.totalSteps) {
      this.showStep(this.state.step + 1);
    }
  },

  prevStep() {
    if (this.state.step > 1) this.showStep(this.state.step - 1);
  },

  validateStep(n) {
    const toast = window.showToast || ((m) => alert(m));
    if (n === 1) {
      if (!document.getElementById('date-input').value) {
        toast('Veuillez sélectionner une date.'); return false;
      }
      if (!this.state.venue) {
        toast('Veuillez sélectionner un type de lieu.'); return false;
      }
    }
    if (n === 2) {
      if (!this.state.style) {
        toast('Veuillez sélectionner un style floral.'); return false;
      }
      if (!this.state.couleur) {
        toast('Veuillez sélectionner une palette de couleurs.'); return false;
      }
    }
    return true;
  },

  updateProgress() {
    const prog = document.getElementById('prog');
    if (prog) {
      const pct = ((this.state.step - 1) / (this.state.totalSteps - 1)) * 100;
      prog.style.width = pct + '%';
    }
  },

  updateStepIndicator(n) {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`dv-step-${i}`);
      if (!el) continue;
      el.classList.remove('active', 'done');
      if (i < n)  el.classList.add('done');
      if (i === n) el.classList.add('active');
    }
  },

  /* ── Rendu des styles ── */
  renderStyles() {
    const container = document.getElementById('styles-container');
    if (!container) return;

    const styles = (window.CATALOGUE && CATALOGUE.styles)
      ? CATALOGUE.styles
      : [
          { id: 'champetre',  nom: 'Champêtre',  description: 'Naturel, sauvage, herbes folles' },
          { id: 'classique',  nom: 'Classique',  description: 'Élégant, symétrique, raffiné' },
          { id: 'moderne',    nom: 'Moderne',    description: 'Graphique, épuré, architectural' },
          { id: 'boheme',     nom: 'Bohème',     description: 'Romantique, poétique, libre' },
          { id: 'tropical',   nom: 'Tropical',   description: 'Exotique, vibrant, original' },
        ];

    const list = Array.isArray(styles) ? styles : Object.entries(styles).map(([id, v]) => ({ id, ...v }));

    container.innerHTML = list.map(s => `
      <div class="dv-style-option" onclick="devisApp.selectStyle('${s.id}')" id="style-${s.id}">
        <div class="dv-style-dot"></div>
        <div>
          <div class="dv-style-name">${s.nom}</div>
          <div class="dv-style-desc">${s.description || ''}</div>
        </div>
      </div>
    `).join('');
  },

  /* ── Rendu des couleurs ── */
  renderCouleurs() {
    const container = document.getElementById('couleurs-container');
    if (!container) return;

    const couleurs = (window.CATALOGUE && CATALOGUE.couleurs)
      ? CATALOGUE.couleurs
      : [
          { id: 'blanc-creme', nom: 'Blanc & Crème', hex: '#F5F0E8' },
          { id: 'rose-pastel', nom: 'Rose pastel',   hex: '#F2BFCC' },
          { id: 'rose-vif',    nom: 'Rose vif',      hex: '#E8647A' },
          { id: 'rouge',       nom: 'Rouge passion', hex: '#C0392B' },
          { id: 'peche',       nom: 'Pêche & Corail',hex: '#E8936A' },
          { id: 'jaune',       nom: 'Jaune doré',    hex: '#F0C040' },
          { id: 'violet',      nom: 'Violet doux',   hex: '#9B7EC8' },
          { id: 'vert',        nom: 'Vert naturel',  hex: '#6B9E78' },
        ];

    const list = Array.isArray(couleurs) ? couleurs : Object.entries(couleurs).map(([id, v]) => ({ id, ...v }));

    container.innerHTML = list.map(c => {
      const bg = c.valeurs
        ? (c.valeurs.length > 1 ? `background:linear-gradient(135deg,${c.valeurs.join(',')})` : `background:${c.valeurs[0]}`)
        : `background:${c.hex || '#ccc'}`;
      return `
        <div class="dv-swatch" id="couleur-${c.id}" onclick="devisApp.selectCouleur('${c.id}')"
             style="${bg}" title="${c.nom}"></div>
      `;
    }).join('');
  },

  /* ── Sélections ── */
  selectVenue(type) {
    this.state.venue = type;
    ['domaine','eglise','jardin','plage'].forEach(v => {
      const el = document.getElementById(`venue-${v}`);
      if (el) el.classList.toggle('selected', v === type);
    });
  },

  selectStyle(id) {
    this.state.style = id;
    document.querySelectorAll('.dv-style-option').forEach(el => {
      el.classList.toggle('selected', el.id === `style-${id}`);
    });
  },

  selectCouleur(id) {
    this.state.couleur = id;
    document.querySelectorAll('.dv-swatch').forEach(el => {
      el.classList.toggle('selected', el.id === `couleur-${id}`);
    });
  },

  selectBouquet(type) {
    this.state.bouquetMariee = type;
    ['simple','luxe','prestige'].forEach(t => {
      const el = document.getElementById(`bouquet-${t}`);
      if (el) el.classList.toggle('selected', t === type);
    });
  },

  selectCentre(type) {
    this.state.centreStyle = type;
    ['simple','luxe'].forEach(t => {
      const el = document.getElementById(`centre-${t}`);
      if (el) el.classList.toggle('selected', t === type);
    });
  },

  toggleArche(checked) {
    this.state.arche = checked;
    const opts = document.getElementById('arche-options');
    if (opts) opts.style.display = checked ? 'grid' : 'none';
  },

  selectArcheStyle(type) {
    this.state.archeStyle = type;
    ['simple','luxe','prestige'].forEach(t => {
      const el = document.getElementById(`arche-${t}`);
      if (el) el.classList.toggle('selected', t === type);
    });
  },

  updateQty(key, delta) {
    this.state[key] = Math.max(0, (this.state[key] || 0) + delta);
    const el = document.getElementById(`qty-${key}`);
    if (el) el.textContent = this.state[key];
  },

  toggleOption(key, checked) {
    this.state[key] = checked;
    if (key === 'cheminTable') {
      const wrap = document.getElementById('chemin-qty-wrap');
      if (wrap) wrap.style.display = checked ? 'flex' : 'none';
    }
  },

  updateState(key, val) { this.state[key] = val; },

  /* ── Calcul des prix ── */
  calcTotal() {
    const S = this.state;
    const BOUQUET_PRICES = { simple: 120, luxe: 250, prestige: 450 };
    const CENTRE_PRICES  = { simple: 80,  luxe: 150 };
    const ARCHE_PRICES   = { simple: 450, luxe: 800, prestige: 1400 };

    let total = 0;
    const lines = [];

    const addLine = (label, amount) => {
      if (amount > 0) {
        total += amount;
        lines.push({ label, amount });
      }
    };

    addLine(`Bouquet de la Mariée (${S.bouquetMariee})`, BOUQUET_PRICES[S.bouquetMariee] || 250);
    if (S.demoiNb > 0) addLine(`Bouquets demoiselles (×${S.demoiNb})`, S.demoiNb * 65);
    if (S.boutNb > 0)  addLine(`Boutonnières (×${S.boutNb})`, S.boutNb * 18);
    if (S.centresNb > 0) addLine(`Centres de table ${S.centreStyle} (×${S.centresNb})`, S.centresNb * CENTRE_PRICES[S.centreStyle]);
    if (S.arche)       addLine(`Arche florale (${S.archeStyle})`, ARCHE_PRICES[S.archeStyle] || 450);
    if (S.cheminTable) addLine(`Chemin de table (${S.cheminMetres}m)`, S.cheminMetres * 45);
    if (S.petales)     addLine('Pétales au sol', 80);
    if (S.couronne)    addLine('Couronne de fleurs', 85);
    if (S.livraison)   addLine('Livraison', 50);
    if (S.installation) addLine('Installation sur place', 120);
    if (S.demontage)   addLine('Démontage', 80);

    return { total, lines };
  },

  /* ── Recap ── */
  buildRecap() {
    const { total, lines } = this.calcTotal();
    const tableEl = document.getElementById('recap-table-body');
    const totalEl = document.getElementById('recap-total-price');

    if (tableEl) {
      tableEl.innerHTML = lines.map(l => `
        <tr>
          <td>${l.label}</td>
          <td>${l.amount.toLocaleString('fr-FR')} €</td>
        </tr>
      `).join('');
    }
    if (totalEl) totalEl.textContent = total.toLocaleString('fr-FR') + ' €';
  },

  /* ── Soumission ── */
  handleSubmit(e) {
    e.preventDefault();
    document.getElementById('recap-content').style.display = 'none';
    document.getElementById('step-5-actions').style.display = 'none';
    document.getElementById('success-state').style.display = 'block';
    if (window.showToast) window.showToast('Demande envoyée ! Nous vous recontacterons sous 48h.');
  },
};

document.addEventListener('DOMContentLoaded', () => devisApp.init());
