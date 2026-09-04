const SimState = {
  arrangement: null,
  fleurs: {}, // { fleurId: qty }
  format: 'moyen',
  extras: { emballage: false, ruban: false, carte: false, livraison: false, voeux: false },
};

const FORMAT_MULT = { petit: 0.7, moyen: 1.0, grand: 1.4 };
const EXTRAS_PRICES = { emballage: 8, ruban: 5, carte: 3, livraison: 12, voeux: 3 };

function init() {
  renderArrangements();
  renderFleurs();
  setupFormatListeners();
  setupExtrasListeners();
  document.getElementById('sim-reset').addEventListener('click', resetAll);
  
  // Modal listeners
  const submitBtn = document.getElementById('sim-submit');
  if(submitBtn) submitBtn.addEventListener('click', openModal);
  
  const closeBtn = document.getElementById('sim-modal-close');
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  
  const form = document.getElementById('sim-form');
  if(form) form.addEventListener('submit', handleFormSubmit);

  recalculate();
}

function renderArrangements() {
  const container = document.getElementById('sim-arrangements');
  container.innerHTML = CATALOGUE.arrangements.map(a => `
    <div class="arr-card" data-id="${a.id}" onclick="selectArrangement('${a.id}')">
      <div class="arr-card-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
      </div>
      <div class="arr-card-name">${a.nom}</div>
      <div class="arr-card-price">dès ${a.prix_base.toFixed(2)}€</div>
    </div>
  `).join('');
}

function renderFleurs() {
  const container = document.getElementById('sim-fleurs');
  container.innerHTML = CATALOGUE.fleurs.map(f => `
    <div class="fleur-btn-wrapper">
      <div class="fleur-btn" id="btn-fleur-${f.id}" onclick="toggleFleur('${f.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div class="fleur-btn-inner">
          <div class="fleur-btn-name">${f.nom}</div>
          <div class="fleur-btn-price">${f.prix.toFixed(2)}€ / tige</div>
        </div>
      </div>
      <div class="fleur-qty hidden" id="qty-fleur-${f.id}">
        <button class="qty-btn" onclick="changeQty('${f.id}', -1)">-</button>
        <div class="qty-val" id="val-fleur-${f.id}">1</div>
        <button class="qty-btn" onclick="changeQty('${f.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function selectArrangement(id) {
  SimState.arrangement = SimState.arrangement === id ? null : id;
  document.querySelectorAll('.arr-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id && SimState.arrangement === id);
  });
  recalculate();
}

function toggleFleur(id) {
  const btn = document.getElementById(`btn-fleur-${id}`);
  const qtyWrap = document.getElementById(`qty-fleur-${id}`);
  
  if (SimState.fleurs[id]) {
    delete SimState.fleurs[id];
    btn.classList.remove('selected');
    qtyWrap.classList.add('hidden');
  } else {
    SimState.fleurs[id] = 1;
    btn.classList.add('selected');
    qtyWrap.classList.remove('hidden');
    document.getElementById(`val-fleur-${id}`).innerText = '1';
  }
  recalculate();
}

function changeQty(id, delta) {
  if (!SimState.fleurs[id]) return;
  SimState.fleurs[id] += delta;
  if (SimState.fleurs[id] < 1) SimState.fleurs[id] = 1;
  document.getElementById(`val-fleur-${id}`).innerText = SimState.fleurs[id];
  recalculate();
}

function setupFormatListeners() {
  document.querySelectorAll('.format-card').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      SimState.format = el.dataset.format;
      recalculate();
    });
  });
}

function setupExtrasListeners() {
  document.querySelectorAll('.extra-row').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.extra;
      SimState.extras[key] = !SimState.extras[key];
      el.classList.toggle('selected', SimState.extras[key]);
      recalculate();
    });
  });
}

function recalculate() {
  let total = 0;
  const breakdown = [];
  const mult = FORMAT_MULT[SimState.format];

  if (SimState.arrangement) {
    const arr = CATALOGUE.arrangements.find(a => a.id === SimState.arrangement);
    const cost = arr.prix_base * mult;
    total += cost;
    breakdown.push({ name: `Base: ${arr.nom} (${SimState.format})`, price: cost });
  }

  for (const [id, qty] of Object.entries(SimState.fleurs)) {
    const fleur = CATALOGUE.fleurs.find(f => f.id === id);
    const cost = fleur.prix * qty * mult;
    total += cost;
    breakdown.push({ name: `${fleur.nom} (x${qty})`, price: cost });
  }

  for (const [key, active] of Object.entries(SimState.extras)) {
    if (active) {
      const cost = EXTRAS_PRICES[key];
      total += cost;
      let name = key.charAt(0).toUpperCase() + key.slice(1);
      breakdown.push({ name: name, price: cost });
    }
  }

  updatePanel(total, breakdown);
}

function updatePanel(total, breakdown) {
  const totalEl = document.getElementById('sim-total');
  animateNumber(totalEl, total);

  const bdContainer = document.getElementById('sim-breakdown');
  if (breakdown.length === 0) {
    bdContainer.innerHTML = '<div class="breakdown-empty">Sélectionnez une base ou des fleurs pour commencer.</div>';
  } else {
    bdContainer.innerHTML = breakdown.map(item => `
      <div class="breakdown-item">
        <span class="breakdown-name">${item.name}</span>
        <span class="breakdown-price">${item.price.toFixed(2)}€</span>
      </div>
    `).join('');
  }
}

function animateNumber(el, to) {
  const from = parseFloat(el.innerText) || 0;
  const duration = 400;
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const current = from + (to - from) * progress;
    el.innerText = current.toFixed(2);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function resetAll() {
  SimState.arrangement = null;
  SimState.fleurs = {};
  SimState.format = 'moyen';
  for(let k in SimState.extras) SimState.extras[k] = false;

  document.querySelectorAll('.arr-card, .fleur-btn, .extra-row').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.fleur-qty').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.format-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.format === 'moyen');
  });

  recalculate();
}

/* ════════════════════════════════════
   MODAL & SUBMIT
════════════════════════════════════ */
function openModal() {
  const total = document.getElementById('sim-total').innerText;
  if (parseFloat(total) === 0) {
    if(window.showToast) window.showToast('Veuillez composer un bouquet avant de commander.');
    else alert('Veuillez composer un bouquet avant de commander.');
    return;
  }
  
  const priceDisplay = document.getElementById('modal-price-display');
  if (priceDisplay) {
    priceDisplay.innerHTML = `Montant estimé : <strong>${total}€</strong>`;
  }
  
  const modal = document.getElementById('sim-modal');
  if(modal) {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    modal.querySelector('.modal').style.transform = 'translateY(0)';
  }
}

function closeModal() {
  const modal = document.getElementById('sim-modal');
  if(modal) {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    modal.querySelector('.modal').style.transform = 'translateY(20px)';
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  closeModal();
  
  // Fake loading / success
  setTimeout(() => {
    if(window.showToast) {
      window.showToast('Demande envoyée ! Nous vous contactons sous 24h 🌸');
    } else {
      alert('Demande envoyée ! Nous vous contactons sous 24h 🌸');
    }
    resetAll();
  }, 400);
}

document.addEventListener('DOMContentLoaded', init);
