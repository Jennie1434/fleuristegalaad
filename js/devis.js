let currentStep = 1;
const totalSteps = 5;
const state = {
    date: '',
    ville: '',
    invites: 100,
    lieu: '',
    style: '',
    couleurs: [],
    bouquet: { type: 'none', price: 0 },
    demoiselles: { qty: 0, price: 45 },
    boutonnieres: { qty: 0, price: 15 },
    centres: { qty: 0, price: 80 },
    arche: { enabled: false, style: 'partielle', price: 600 },
    extras: []
};

document.addEventListener('DOMContentLoaded', () => {
    initCatalogueData();
    updateProgress();
    setupEventListeners();
});

function initCatalogueData() {
    const styleOptions = document.getElementById('style-options');
    const styles = (window.CATALOGUE && window.CATALOGUE.styles) ? window.CATALOGUE.styles : ['Romantique', 'Bohème', 'Classique', 'Champêtre', 'Moderne'];
    
    styles.forEach(style => {
        const lbl = document.createElement('label');
        lbl.className = 'option-card style-card';
        lbl.innerHTML = `
            <input type="radio" name="style" value="${style}">
            <div class="card-content"><h4>${style}</h4></div>
        `;
        styleOptions.appendChild(lbl);
    });

    const colorOptions = document.getElementById('color-options');
    const couleurs = (window.CATALOGUE && window.CATALOGUE.couleurs) ? window.CATALOGUE.couleurs : [
        { nom: 'Blanc', code: '#FFFFFF' }, { nom: 'Rose poudré', code: '#FFD1DC' },
        { nom: 'Bordeaux', code: '#800020' }, { nom: 'Pêche', code: '#FFE5B4' },
        { nom: 'Sauge', code: '#87A96B' }, { nom: 'Lavande', code: '#E6E6FA' }
    ];

    couleurs.forEach(color => {
        const lbl = document.createElement('label');
        lbl.className = 'color-swatch-container';
        lbl.innerHTML = `
            <input type="checkbox" name="couleurs" value="${color.nom}">
            <div class="color-swatch" style="background-color: ${color.code || color.hex || '#ccc'}" title="${color.nom}"></div>
            <span>${color.nom}</span>
        `;
        colorOptions.appendChild(lbl);
    });
}

function setupEventListeners() {
    // Styles
    document.getElementById('style-options').addEventListener('change', e => {
        state.style = e.target.value;
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        e.target.closest('.style-card').classList.add('selected');
    });

    // Colors limit to 3
    document.getElementById('color-options').addEventListener('change', e => {
        const checkboxes = document.querySelectorAll('input[name="couleurs"]:checked');
        if (checkboxes.length > 3) {
            e.target.checked = false;
            return;
        }
        state.couleurs = Array.from(checkboxes).map(cb => cb.value);
        document.querySelectorAll('.color-swatch-container').forEach(c => c.classList.remove('selected'));
        checkboxes.forEach(cb => cb.closest('.color-swatch-container').classList.add('selected'));
    });

    // Bouquets
    document.querySelectorAll('input[name="bouquet"]').forEach(radio => {
        radio.addEventListener('change', e => {
            state.bouquet.type = e.target.value;
            state.bouquet.price = parseFloat(e.target.dataset.price);
            document.querySelectorAll('input[name="bouquet"]').forEach(r => r.closest('.radio-card').classList.remove('selected'));
            e.target.closest('.radio-card').classList.add('selected');
        });
    });

    // Arche
    document.getElementById('arche-toggle').addEventListener('change', e => {
        state.arche.enabled = e.target.checked;
        if(e.target.checked) {
            const selectedStyle = document.querySelector('input[name="arche_style"]:checked');
            state.arche.style = selectedStyle.value;
            state.arche.price = parseFloat(selectedStyle.dataset.price);
        } else {
            state.arche.price = 0;
        }
    });

    document.querySelectorAll('input[name="arche_style"]').forEach(radio => {
        radio.addEventListener('change', e => {
            if(state.arche.enabled) {
                state.arche.style = e.target.value;
                state.arche.price = parseFloat(e.target.dataset.price);
            }
            document.querySelectorAll('input[name="arche_style"]').forEach(r => r.closest('.radio-card').classList.remove('selected'));
            e.target.closest('.radio-card').classList.add('selected');
        });
    });
}

function updateQty(item, change) {
    let newQty = state[item].qty + change;
    if (newQty < 0) newQty = 0;
    state[item].qty = newQty;
    document.getElementById(`qty-${item}`).innerText = newQty;
}

function validateStep(n) {
    if (n === 1) {
        const date = document.getElementById('date-mariage').value;
        const ville = document.getElementById('ville-mariage').value;
        const lieu = document.getElementById('lieu-mariage').value;
        if (!date || !ville || !lieu) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return false;
        }
        state.date = date;
        state.ville = ville;
        state.lieu = lieu;
        state.invites = document.getElementById('invites-mariage').value;
    }
    if (n === 2) {
        if (!state.style) {
            alert('Veuillez sélectionner un style.');
            return false;
        }
    }
    return true;
}

function showStep(n) {
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`step-${n}`).classList.add('active');
    
    document.getElementById('btn-prev').style.display = n === 1 ? 'none' : 'inline-block';
    
    if (n === totalSteps) {
        document.getElementById('btn-next').style.display = 'none';
        document.getElementById('btn-submit').style.display = 'inline-block';
        buildRecap();
    } else {
        document.getElementById('btn-next').style.display = 'inline-block';
        document.getElementById('btn-submit').style.display = 'none';
    }
    
    currentStep = n;
    updateProgress();
}

function nextStep() {
    if (validateStep(currentStep) && currentStep < totalSteps) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function updateProgress() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    document.querySelectorAll('.step-indicator').forEach((ind, index) => {
        if (index < currentStep) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });
}

function buildRecap() {
    // Gather extras
    state.extras = [];
    const extraCheckboxes = document.querySelectorAll('#step-4 input[type="checkbox"]:checked');
    extraCheckboxes.forEach(cb => {
        const name = cb.name.replace('extra_', '');
        const price = parseFloat(cb.dataset.price);
        let label = cb.closest('.toggle-row').querySelector('h3').innerText;
        state.extras.push({ label, price });
    });

    let html = `
        <div class="recap-details">
            <p><strong>Date :</strong> ${state.date}</p>
            <p><strong>Lieu :</strong> ${state.ville} (${state.lieu})</p>
            <p><strong>Invités :</strong> ${state.invites}</p>
            <p><strong>Style :</strong> ${state.style}</p>
            <p><strong>Couleurs :</strong> ${state.couleurs.join(', ') || 'Non spécifié'}</p>
        </div>
        <table class="recap-table">
            <thead>
                <tr>
                    <th>Prestation</th>
                    <th>Qté</th>
                    <th>Prix U.</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    if (state.bouquet.type !== 'none') {
        html += `<tr><td>Bouquet mariée (${state.bouquet.type})</td><td>1</td><td>${state.bouquet.price}€</td><td>${state.bouquet.price}€</td></tr>`;
        total += state.bouquet.price;
    }
    if (state.demoiselles.qty > 0) {
        const t = state.demoiselles.qty * state.demoiselles.price;
        html += `<tr><td>Bouquets Demoiselles</td><td>${state.demoiselles.qty}</td><td>${state.demoiselles.price}€</td><td>${t}€</td></tr>`;
        total += t;
    }
    if (state.boutonnieres.qty > 0) {
        const t = state.boutonnieres.qty * state.boutonnieres.price;
        html += `<tr><td>Boutonnières</td><td>${state.boutonnieres.qty}</td><td>${state.boutonnieres.price}€</td><td>${t}€</td></tr>`;
        total += t;
    }
    if (state.centres.qty > 0) {
        const t = state.centres.qty * state.centres.price;
        html += `<tr><td>Centres de table</td><td>${state.centres.qty}</td><td>${state.centres.price}€</td><td>${t}€</td></tr>`;
        total += t;
    }
    if (state.arche.enabled) {
        html += `<tr><td>Arche Florale (${state.arche.style})</td><td>1</td><td>${state.arche.price}€</td><td>${state.arche.price}€</td></tr>`;
        total += state.arche.price;
    }
    
    state.extras.forEach(extra => {
        html += `<tr><td>${extra.label}</td><td>1</td><td>${extra.price}€</td><td>${extra.price}€</td></tr>`;
        total += extra.price;
    });

    html += `
            </tbody>
        </table>
        <div class="recap-total">
            Total estimé : <span>${total} €</span>
        </div>
        <p class="recap-note">* Ce devis est une estimation. Le prix final peut varier selon les fleurs de saison et vos exigences spécifiques.</p>
    `;

    document.getElementById('recap-content').innerHTML = html;
}

function showToast(message) {
    if (window.showToast) {
        window.showToast(message);
    } else {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

function handleSubmit() {
    const nom = document.getElementById('contact-nom').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    
    if (!nom || !email || !phone) {
        alert('Veuillez remplir vos coordonnées.');
        return;
    }
    
    showToast('Devis envoyé ! Nous vous contacterons sous 24h 🌸');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}
