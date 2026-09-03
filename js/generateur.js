const State = {
    style: 'champetre',
    couleur: 'rose-pastel',
    forme: 'rond',
    taille: 2, // 1-3
    selectedFleurs: [] // array of fleur ids
};

const POSITIONS = {
    rond: [
        {x: 50, y: 10}, {x: 75, y: 18}, {x: 90, y: 40}, {x: 88, y: 65},
        {x: 70, y: 82}, {x: 45, y: 88}, {x: 22, y: 80}, {x: 8, y: 58},
        {x: 10, y: 33}, {x: 25, y: 15}, {x: 50, y: 50}, {x: 60, y: 35}
    ],
    cascade: [
        {x: 70, y: 5}, {x: 80, y: 20}, {x: 60, y: 30}, {x: 75, y: 45},
        {x: 50, y: 55}, {x: 65, y: 65}, {x: 40, y: 70}, {x: 55, y: 80},
        {x: 30, y: 85}, {x: 45, y: 92}, {x: 20, y: 90}, {x: 35, y: 75}
    ],
    brassee: [
        {x: 45, y: 45}, {x: 30, y: 30}, {x: 60, y: 35}, {x: 25, y: 55},
        {x: 65, y: 60}, {x: 40, y: 65}, {x: 55, y: 25}, {x: 35, y: 70},
        {x: 70, y: 45}, {x: 20, y: 40}, {x: 50, y: 75}, {x: 60, y: 70}
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    if (!window.CATALOGUE) {
        console.error("CATALOGUE not loaded");
        // Mock fallback if catalogue.js doesn't exist yet
        window.CATALOGUE = {
            styles: [{id: 'champetre', nom: 'Champêtre'}, {id: 'classique', nom: 'Classique'}, {id: 'moderne', nom: 'Moderne'}],
            couleurs: [{id: 'rose-pastel', nom: 'Rose Pastel', hex: '#FFD1DC'}, {id: 'blanc', nom: 'Blanc Pur', hex: '#FFFFFF'}, {id: 'rouge', nom: 'Rouge Passion', hex: '#E60000'}],
            fleurs: [
                {id: 'rose', nom: 'Rose', emoji: '🌹', prix: 4},
                {id: 'tulipe', nom: 'Tulipe', emoji: '🌷', prix: 3},
                {id: 'tournesol', nom: 'Tournesol', emoji: '🌻', prix: 5},
                {id: 'lys', nom: 'Lys', emoji: '⚜️', prix: 6},
                {id: 'marguerite', nom: 'Marguerite', emoji: '🌼', prix: 2},
                {id: 'fleur-cerisier', nom: 'Cerisier', emoji: '🌸', prix: 3}
            ]
        };
    }
    
    // Set initial defaults if possible
    if(window.CATALOGUE.styles.length > 0) State.style = window.CATALOGUE.styles[0].id;
    if(window.CATALOGUE.couleurs.length > 0) State.couleur = window.CATALOGUE.couleurs[0].id;
    
    renderStyleOptions();
    renderCouleurOptions();
    renderFormeOptions();
    renderFleursGrid();
    
    document.getElementById('taille-slider').addEventListener('input', (e) => {
        State.taille = parseInt(e.target.value);
        updatePrice();
        renderBouquet();
    });
    
    document.getElementById('btn-shuffle').addEventListener('click', shuffle);
    document.getElementById('btn-copy').addEventListener('click', copyComposition);
    
    updatePrice();
    generateName();
}

function renderStyleOptions() {
    const container = document.getElementById('style-container');
    container.innerHTML = '';
    window.CATALOGUE.styles.forEach(style => {
        const chip = document.createElement('div');
        chip.className = `style-chip ${State.style === style.id ? 'selected' : ''}`;
        chip.textContent = style.nom;
        chip.onclick = () => selectStyle(style.id);
        container.appendChild(chip);
    });
}

function renderCouleurOptions() {
    const container = document.getElementById('couleur-container');
    container.innerHTML = '';
    window.CATALOGUE.couleurs.forEach(couleur => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${State.couleur === couleur.id ? 'selected' : ''}`;
        swatch.style.backgroundColor = couleur.hex;
        swatch.title = couleur.nom;
        swatch.onclick = () => selectCouleur(couleur.id);
        container.appendChild(swatch);
    });
}

function renderFormeOptions() {
    document.querySelectorAll('.forme-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.forme === State.forme);
        card.onclick = () => selectForme(card.dataset.forme);
    });
}

function renderFleursGrid() {
    const grid = document.getElementById('fleurs-grid');
    grid.innerHTML = '';
    window.CATALOGUE.fleurs.forEach(fleur => {
        const isSelected = State.selectedFleurs.includes(fleur.id);
        const card = document.createElement('div');
        card.className = `flower-pick-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="selected-badge"><i data-lucide="check" class="w-3 h-3"></i></div>
            <div class="text-3xl mb-1">${fleur.emoji}</div>
            <div class="text-xs font-medium">${fleur.nom}</div>
            <div class="text-xs text-neutral-500">${fleur.prix}€</div>
        `;
        card.onclick = () => toggleFleur(fleur.id);
        grid.appendChild(card);
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function selectStyle(id) {
    State.style = id;
    renderStyleOptions();
    generateName();
}

function selectCouleur(id) {
    State.couleur = id;
    renderCouleurOptions();
    generateName();
}

function selectForme(id) {
    State.forme = id;
    renderFormeOptions();
    renderBouquet();
}

function toggleFleur(id) {
    const index = State.selectedFleurs.indexOf(id);
    if (index > -1) {
        State.selectedFleurs.splice(index, 1);
    } else {
        if (State.selectedFleurs.length < 12) {
            State.selectedFleurs.push(id);
        } else {
            alert('Vous avez atteint le nombre maximum de 12 fleurs différentes.');
            return;
        }
    }
    renderFleursGrid();
    updatePrice();
    generateName();
    renderBouquet();
    
    // Update summary
    const summary = document.getElementById('composition-summary');
    if (State.selectedFleurs.length === 0) {
        summary.textContent = 'Aucune fleur sélectionnée';
        summary.classList.add('italic', 'text-neutral-500');
    } else {
        const names = State.selectedFleurs.map(fid => {
            const f = window.CATALOGUE.fleurs.find(f => f.id === fid);
            return f ? f.nom : fid;
        });
        summary.textContent = names.join(', ');
        summary.classList.remove('italic', 'text-neutral-500');
    }
}

function updatePrice() {
    const total = State.selectedFleurs.reduce((sum, fid) => {
        const fleur = window.CATALOGUE.fleurs.find(f => f.id === fid);
        return sum + (fleur ? fleur.prix : 0);
    }, 0);
    
    // Calculate final price: total base prices * size multiplier * stem multiplier (default 3)
    const multiplier = State.taille * 3;
    const finalPrice = total * multiplier;
    
    document.getElementById('price-total').textContent = finalPrice > 0 ? `${finalPrice} €` : '0 €';
}

function generateName() {
    const styleObj = window.CATALOGUE.styles.find(s => s.id === State.style) || {nom: 'Sur-mesure'};
    const colObj = window.CATALOGUE.couleurs.find(c => c.id === State.couleur) || {nom: 'Coloré'};
    
    let suffix = '';
    if (State.selectedFleurs.length > 0) {
        const firstFleur = window.CATALOGUE.fleurs.find(f => f.id === State.selectedFleurs[0]);
        if (State.selectedFleurs.length === 1) {
            suffix = ` aux ${firstFleur ? firstFleur.nom : ''}s`;
        } else {
            const secondFleur = window.CATALOGUE.fleurs.find(f => f.id === State.selectedFleurs[1]);
            suffix = ` ${firstFleur ? firstFleur.nom : ''} & ${secondFleur ? secondFleur.nom : ''}`;
        }
    }
    
    document.getElementById('bouquet-name').textContent = `Bouquet ${styleObj.nom} ${colObj.nom}${suffix}`;
}

function renderBouquet(noise = false) {
    const canvas = document.getElementById('bouquet-canvas');
    const emptyState = document.getElementById('empty-state');
    
    // Clear old flowers
    canvas.querySelectorAll('.bouquet-flower').forEach(el => el.remove());
    
    if (State.selectedFleurs.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const positions = POSITIONS[State.forme] || POSITIONS.rond;
    
    // Fill array of flower emojis to display
    const flowersToDisplay = [];
    for (let i = 0; i < 12; i++) {
        // Cycle through selected flowers to fill up to 12 positions
        if (State.selectedFleurs.length > 0) {
            const fid = State.selectedFleurs[i % State.selectedFleurs.length];
            const fleur = window.CATALOGUE.fleurs.find(f => f.id === fid);
            if (fleur) {
                flowersToDisplay.push(fleur.emoji);
            }
        }
    }
    
    // Size scaling
    const scaleMap = {1: 0.8, 2: 1, 3: 1.2};
    const scale = scaleMap[State.taille] || 1;
    
    positions.forEach((pos, i) => {
        if (i >= flowersToDisplay.length) return;
        
        const emoji = flowersToDisplay[i];
        const el = document.createElement('div');
        el.className = 'bouquet-flower';
        el.textContent = emoji;
        
        let offsetX = noise ? (Math.random() - 0.5) * 30 : 0;
        let offsetY = noise ? (Math.random() - 0.5) * 30 : 0;
        let rot = noise ? (Math.random() - 0.5) * 60 : (Math.random() - 0.5) * 30;
        
        // Center alignment adjustments
        el.style.left = `calc(${pos.x}% - 30px)`;
        el.style.top = `calc(${pos.y}% - 30px)`;
        el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rot}deg)`;
        el.style.zIndex = Math.floor(pos.y); // lower flowers overlay higher ones
        
        canvas.appendChild(el);
        
        // entry animation
        if (noise && el.animate) {
            el.animate([
                { transform: `translate(0px, 0px) scale(0) rotate(0deg)` },
                { transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rot}deg)` }
            ], {
                duration: 400 + Math.random() * 200,
                easing: 'ease-out',
                fill: 'forwards'
            });
        }
    });
}

function shuffle() {
    renderBouquet(true);
}

function copyComposition() {
    if (State.selectedFleurs.length === 0) {
        alert("Ajoutez des fleurs d'abord !");
        return;
    }
    const names = State.selectedFleurs.map(fid => {
        const f = window.CATALOGUE.fleurs.find(f => f.id === fid);
        return f ? f.nom : fid;
    });
    const text = `Ma composition Atelier Galaad:\n- ${names.join('\n- ')}\n\nStyle: ${State.style}, Forme: ${State.forme}\nPrix estimé: ${document.getElementById('price-total').textContent}`;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btn-copy');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-2"></i> Copié !`;
        if (window.lucide) {
            lucide.createIcons();
        }
        setTimeout(() => {
            btn.innerHTML = originalText;
            if (window.lucide) {
                lucide.createIcons();
            }
        }, 2000);
    });
}
