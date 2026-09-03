// simulateur.js

const State = {
    arrangement: null,
    fleurs: {}, // {id: quantity}
    taille: 'moyen', // petit|moyen|grand
    extras: {} // {key: boolean}
};

const TAILLE_MULT = { petit: 0.7, moyen: 1.0, grand: 1.4 };
const EXTRAS_PRICES = { emballage: 8, ruban: 5, carte: 3, livraison: 12, installation: 25 };
const EXTRAS_NAMES = { emballage: 'Emballage premium', ruban: 'Ruban satin', carte: 'Carte message', livraison: 'Livraison Paris', installation: 'Installation sur place' };

let currentTotal = 0;

function init() {
    renderArrangements();
    renderFleurs();
    recalculate();
}

function renderArrangements() {
    const container = document.getElementById('arrangement-container');
    if (!container || !window.CATALOGUE || !window.CATALOGUE.arrangements) return;

    container.innerHTML = window.CATALOGUE.arrangements.map(arr => `
        <div class="arrangement-card ${State.arrangement === arr.id ? 'selected' : ''}" onclick="selectArrangement('${arr.id}')" id="arr-${arr.id}">
            <span class="arrangement-emoji">${arr.emoji || '🌸'}</span>
            <span class="arrangement-name">${arr.nom}</span>
            <span class="arrangement-price">Base: ${arr.prix_base}€</span>
        </div>
    `).join('');
}

function renderFleurs() {
    const container = document.getElementById('fleur-container');
    if (!container || !window.CATALOGUE || !window.CATALOGUE.fleurs) return;

    container.innerHTML = window.CATALOGUE.fleurs.map(fleur => {
        const qty = State.fleurs[fleur.id] || 0;
        const isSelected = qty > 0;
        return `
            <div class="fleur-btn ${isSelected ? 'selected' : ''}" id="fleur-${fleur.id}" onclick="if(!event.target.closest('.qty-controls')) toggleFleur('${fleur.id}')">
                <span class="fleur-emoji">${fleur.emoji || '🌿'}</span>
                <div class="fleur-info">
                    <span class="fleur-name">${fleur.nom}</span>
                    <span class="fleur-price">${fleur.prix}€/tige</span>
                </div>
                ${isSelected ? `
                <div class="qty-controls">
                    <button class="qty-btn" onclick="event.stopPropagation(); changeQty('${fleur.id}', -1)">-</button>
                    <span>${qty}</span>
                    <button class="qty-btn" onclick="event.stopPropagation(); changeQty('${fleur.id}', 1)">+</button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function selectArrangement(id) {
    if (State.arrangement === id) {
        State.arrangement = null;
    } else {
        State.arrangement = id;
    }
    renderArrangements();
    recalculate();
}

function toggleFleur(id) {
    if (State.fleurs[id]) {
        delete State.fleurs[id];
    } else {
        State.fleurs[id] = 1;
    }
    renderFleurs();
    recalculate();
}

function changeQty(id, delta) {
    if (State.fleurs[id]) {
        State.fleurs[id] += delta;
        if (State.fleurs[id] <= 0) {
            delete State.fleurs[id];
        }
    }
    renderFleurs();
    recalculate();
}

function selectTaille(t) {
    State.taille = t;
    recalculate();
}

function toggleExtra(key) {
    State.extras[key] = !State.extras[key];
    recalculate();
}

function recalculate() {
    let base = 0;
    const breakdown = [];

    // Arrangement
    if (State.arrangement && window.CATALOGUE && window.CATALOGUE.arrangements) {
        const arr = window.CATALOGUE.arrangements.find(a => a.id === State.arrangement);
        if (arr) {
            base += arr.prix_base;
            breakdown.push({ name: \`Arrangement: \${arr.nom}\`, price: arr.prix_base });
        }
    }

    // Fleurs
    if (window.CATALOGUE && window.CATALOGUE.fleurs) {
        let fleursTotal = 0;
        for (const [id, qty] of Object.entries(State.fleurs)) {
            const fleur = window.CATALOGUE.fleurs.find(f => f.id === id);
            if (fleur) {
                const p = fleur.prix * qty;
                fleursTotal += p;
                breakdown.push({ name: \`\${qty}x \${fleur.nom}\`, price: p });
            }
        }
        base += fleursTotal;
    }

    // Taille
    const mult = TAILLE_MULT[State.taille] || 1.0;
    let total = base * mult;
    
    if (mult !== 1.0 && base > 0) {
        const diff = (base * mult) - base;
        breakdown.push({ name: \`Taille \${State.taille.charAt(0).toUpperCase() + State.taille.slice(1)} (x\${mult})\`, price: diff });
    }

    // Extras
    for (const [key, isSelected] of Object.entries(State.extras)) {
        if (isSelected) {
            total += EXTRAS_PRICES[key];
            breakdown.push({ name: EXTRAS_NAMES[key], price: EXTRAS_PRICES[key] });
        }
    }

    updatePanel(breakdown, Math.round(total));
}

function updatePanel(breakdown, newTotal) {
    const list = document.getElementById('price-breakdown');
    if (list) {
        if (breakdown.length === 0) {
            list.innerHTML = '<li><span class="item-name" style="color:#999">Aucun élément sélectionné</span></li>';
        } else {
            list.innerHTML = breakdown.map(item => `
                <li>
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price > 0 ? '+' : ''}${Math.round(item.price)}€</span>
                </li>
            `).join('');
        }
    }

    const totalEl = document.getElementById('price-total');
    if (totalEl) {
        animateNumber(totalEl, currentTotal, newTotal);
        currentTotal = newTotal;
    }
}

function animateNumber(el, from, to) {
    const duration = 500;
    const start = performance.now();
    
    requestAnimationFrame(function update(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;
        
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = from + (to - from) * ease;
        
        el.textContent = Math.round(current) + '€';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    });
}

function openModal() {
    document.getElementById('request-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('request-modal').classList.remove('active');
}

function resetAll() {
    State.arrangement = null;
    State.fleurs = {};
    State.taille = 'moyen';
    State.extras = {};
    
    // reset radios
    const radios = document.querySelectorAll('input[name="taille"]');
    radios.forEach(r => {
        if (r.value === 'moyen') r.checked = true;
    });

    // reset checkboxes
    const checkboxes = document.querySelectorAll('.extras-list input[type="checkbox"]');
    checkboxes.forEach(c => c.checked = false);

    renderArrangements();
    renderFleurs();
    recalculate();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
