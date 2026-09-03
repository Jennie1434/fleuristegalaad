/**
 * devis.js
 * Logic for the Atelier Galaad Wedding Quote Wizard
 */

const devisApp = {
    state: {
        step: 1,
        totalSteps: 5,
        // Step 1
        date: '', city: '', guests: 120, venue: null,
        // Step 2
        style: null, couleur: null,
        // Step 3
        bouquetMariee: 'luxe', demoiNb: 2, boutNb: 4, centresNb: 8, centreStyle: 'simple', arche: false, archeStyle: 'simple',
        // Step 4
        cheminTable: false, cheminMetres: 5, petales: false, couronne: false, livraison: false, installation: false, demontage: false,
    },

    init: function() {
        this.renderStyles();
        this.renderCouleurs();
        this.bindEvents();
        this.updateProgress();
        
        // Ensure arche is initialized correctly
        if (!this.state.arche) {
            document.getElementById('arche-options').style.display = 'none';
        }
    },

    bindEvents: function() {
        // Guests slider
        const guestsRange = document.getElementById('guests-range');
        const guestsDisplay = document.getElementById('guests-display');
        if (guestsRange && guestsDisplay) {
            guestsRange.addEventListener('input', (e) => {
                this.state.guests = parseInt(e.target.value);
                guestsDisplay.textContent = `${this.state.guests} invités`;
            });
        }

        // Form submit
        const form = document.getElementById('devis-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    showStep: function(n) {
        // Hide all
        document.querySelectorAll('.step-panel').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show target
        document.getElementById(`step-${n}`).classList.add('active');
        
        // Update bubbles
        document.querySelectorAll('.step-bubble').forEach((el, index) => {
            if (index + 1 < n) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (index + 1 === n) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });

        this.state.step = n;
        this.updateProgress();

        if (n === 5) {
            this.buildRecap();
        }

        // Scroll to top of wizard
        document.querySelector('.wizard-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    nextStep: function() {
        if (this.validateStep(this.state.step)) {
            if (this.state.step < this.state.totalSteps) {
                this.showStep(this.state.step + 1);
            }
        }
    },

    prevStep: function() {
        if (this.state.step > 1) {
            this.showStep(this.state.step - 1);
        }
    },

    validateStep: function(n) {
        if (n === 1) {
            const date = document.getElementById('date-input').value;
            if (!date) {
                if(window.showToast) window.showToast('Veuillez sélectionner une date.', 'error');
                return false;
            }
            if (!this.state.venue) {
                if(window.showToast) window.showToast('Veuillez sélectionner un type de lieu.', 'error');
                return false;
            }
        }
        if (n === 2) {
            if (!this.state.style) {
                if(window.showToast) window.showToast('Veuillez sélectionner un style floral.', 'error');
                return false;
            }
            if (!this.state.couleur) {
                if(window.showToast) window.showToast('Veuillez sélectionner une palette de couleurs.', 'error');
                return false;
            }
        }
        return true;
    },

    updateProgress: function() {
        const prog = document.getElementById('prog');
        if (prog) {
            const percentage = ((this.state.step - 1) / (this.state.totalSteps - 1)) * 100;
            prog.style.width = `${percentage}%`;
        }
    },

    renderStyles: function() {
        const container = document.getElementById('styles-container');
        if (!container || !window.CATALOGUE || !CATALOGUE.styles) return;

        let html = '';
        const styles = CATALOGUE.styles;
        
        // Define icons mapping for styles based on the prompt
        const icons = {
            'champetre': 'leaf',
            'classique': 'crown',
            'moderne': 'zap',
            'boheme': 'feather',
            'romantique': 'heart'
        };

        for (const [id, s] of Object.entries(styles)) {
            const iconName = icons[id] || 'sparkles';
            html += `
                <div class="option-card flex-row" onclick="devisApp.selectStyle('${id}')" id="style-${id}" style="display: flex; align-items: center; gap: 20px; padding: 16px 24px; text-align: left;">
                    <div class="option-card-icon" style="margin: 0; width: 48px; height: 48px;"><i data-lucide="${iconName}"></i></div>
                    <div>
                        <div class="option-card-label">${s.nom}</div>
                        <div class="option-card-desc" style="margin-top: 4px;">${s.description}</div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    },

    renderCouleurs: function() {
        const container = document.getElementById('couleurs-container');
        if (!container || !window.CATALOGUE || !CATALOGUE.couleurs) return;

        let html = '';
        const couleurs = CATALOGUE.couleurs;
        
        for (const [id, c] of Object.entries(couleurs)) {
            // Background style for swatch
            let bgStyle = '';
            if (c.valeurs.length === 1) {
                bgStyle = `background: ${c.valeurs[0]};`;
            } else {
                const gradient = c.valeurs.join(', ');
                bgStyle = `background: linear-gradient(135deg, ${gradient});`;
            }

            html += `
                <div class="color-swatch-wrap" onclick="devisApp.selectCouleur('${id}')">
                    <div class="color-swatch" id="couleur-${id}" style="${bgStyle}"></div>
                    <div class="swatch-label">${c.nom}</div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    selectVenue: function(type) {
        this.state.venue = type;
        // Update UI
        ['domaine', 'eglise', 'jardin', 'plage'].forEach(v => {
            const el = document.getElementById(`venue-${v}`);
            if (el) {
                if (v === type) el.classList.add('selected');
                else el.classList.remove('selected');
            }
        });
    },

    selectStyle: function(id) {
        this.state.style = id;
        if(window.CATALOGUE && CATALOGUE.styles) {
            Object.keys(CATALOGUE.styles).forEach(k => {
                const el = document.getElementById(`style-${k}`);
                if (el) {
                    if (k === id) el.classList.add('selected');
                    else el.classList.remove('selected');
                }
            });
        }
    },

    selectCouleur: function(id) {
        this.state.couleur = id;
        if(window.CATALOGUE && CATALOGUE.couleurs) {
            Object.keys(CATALOGUE.couleurs).forEach(k => {
                const el = document.getElementById(`couleur-${k}`);
                if (el) {
                    if (k === id) el.classList.add('selected');
                    else el.classList.remove('selected');
                }
            });
        }
    },

    selectBouquet: function(type) {
        this.state.bouquetMariee = type;
        ['simple', 'luxe', 'prestige'].forEach(t => {
            const el = document.getElementById(`bouquet-${t}`);
            if(el) {
                if(t === type) el.classList.add('selected');
                else el.classList.remove('selected');
            }
        });
    },

    updateQty: function(field, delta) {
        let val = this.state[field] + delta;
        if (val < 0) val = 0;
        
        // Limits
        if (field === 'demoiNb' && val > 8) val = 8;
        if (field === 'boutNb' && val > 10) val = 10;
        if (field === 'centresNb' && val > 30) val = 30;

        this.state[field] = val;
        const el = document.getElementById(`qty-${field}`);
        if(el) el.textContent = val;
    },

    selectCentre: function(type) {
        this.state.centreStyle = type;
        ['simple', 'luxe'].forEach(t => {
            const el = document.getElementById(`centre-${t}`);
            if(el) {
                if(t === type) el.classList.add('selected');
                else el.classList.remove('selected');
            }
        });
    },

    toggleArche: function(isChecked) {
        this.state.arche = isChecked;
        const opts = document.getElementById('arche-options');
        if(opts) {
            opts.style.display = isChecked ? 'grid' : 'none';
        }
        if(isChecked && !this.state.archeStyle) {
            this.selectArcheStyle('simple');
        }
    },

    selectArcheStyle: function(type) {
        this.state.archeStyle = type;
        ['simple', 'luxe', 'prestige'].forEach(t => {
            const el = document.getElementById(`arche-${t}`);
            if(el) {
                if(t === type) el.classList.add('selected');
                else el.classList.remove('selected');
            }
        });
    },

    toggleOption: function(field, isChecked) {
        this.state[field] = isChecked;
        if (field === 'cheminTable') {
            const wrap = document.getElementById('chemin-qty-wrap');
            if(wrap) wrap.style.display = isChecked ? 'flex' : 'none';
        }
    },

    updateState: function(field, val) {
        this.state[field] = val;
    },

    calcTotal: function() {
        if(!window.CATALOGUE || !CATALOGUE.tarifsMariage) return 0;
        const tarifs = CATALOGUE.tarifsMariage;
        let total = 0;

        // Bouquet mariée
        if(tarifs.bouquetMariee && tarifs.bouquetMariee[this.state.bouquetMariee]) {
            total += tarifs.bouquetMariee[this.state.bouquetMariee];
        }

        // Demoiselles & Boutonnières
        if(tarifs.bouquetDemoiselle) total += this.state.demoiNb * tarifs.bouquetDemoiselle.prix;
        if(tarifs.boutonniere) total += this.state.boutNb * tarifs.boutonniere.prix;

        // Centres
        if(tarifs.centreTable && tarifs.centreTable[this.state.centreStyle]) {
            total += this.state.centresNb * tarifs.centreTable[this.state.centreStyle];
        }

        // Arche
        if (this.state.arche && tarifs.archeCeremonie && tarifs.archeCeremonie[this.state.archeStyle]) {
            total += tarifs.archeCeremonie[this.state.archeStyle];
        }

        // Options
        if (this.state.cheminTable && tarifs.cheminsTable) {
            total += this.state.cheminMetres * tarifs.cheminsTable.prixParMetre;
        }
        if (this.state.petales) total += 80;
        if (this.state.couronne) total += 85;
        if (this.state.livraison) total += 50;
        if (this.state.installation) total += 120;
        if (this.state.demontage) total += 80;

        return total;
    },

    buildRecap: function() {
        const tbody = document.getElementById('recap-table-body');
        if (!tbody || !window.CATALOGUE || !CATALOGUE.tarifsMariage) return;
        const tarifs = CATALOGUE.tarifsMariage;

        let html = '';

        const addRow = (label, price) => {
            html += `<tr><td>${label}</td><td>${price} €</td></tr>`;
        };

        // Bouquet
        if(tarifs.bouquetMariee && tarifs.bouquetMariee[this.state.bouquetMariee]) {
            addRow(`Bouquet de la mariée (${this.state.bouquetMariee})`, tarifs.bouquetMariee[this.state.bouquetMariee]);
        }

        // Demoiselles
        if (this.state.demoiNb > 0) {
            addRow(`Bouquets demoiselles (${this.state.demoiNb})`, this.state.demoiNb * tarifs.bouquetDemoiselle.prix);
        }

        // Boutonnières
        if (this.state.boutNb > 0) {
            addRow(`Boutonnières (${this.state.boutNb})`, this.state.boutNb * tarifs.boutonniere.prix);
        }

        // Centres
        if (this.state.centresNb > 0 && tarifs.centreTable[this.state.centreStyle]) {
            addRow(`Centres de table ${this.state.centreStyle} (${this.state.centresNb})`, this.state.centresNb * tarifs.centreTable[this.state.centreStyle]);
        }

        // Arche
        if (this.state.arche && tarifs.archeCeremonie[this.state.archeStyle]) {
            addRow(`Arche florale (${this.state.archeStyle})`, tarifs.archeCeremonie[this.state.archeStyle]);
        }

        // Options
        if (this.state.cheminTable) {
            addRow(`Chemin de table (${this.state.cheminMetres}m)`, this.state.cheminMetres * tarifs.cheminsTable.prixParMetre);
        }
        if (this.state.petales) addRow("Pétales au sol", 80);
        if (this.state.couronne) addRow("Couronne de fleurs", 85);
        if (this.state.livraison) addRow("Livraison", 50);
        if (this.state.installation) addRow("Installation", 120);
        if (this.state.demontage) addRow("Démontage", 80);

        tbody.innerHTML = html;

        // Total
        const totalAmount = this.calcTotal();
        const totalEl = document.getElementById('recap-total-price');
        if (totalEl) {
            totalEl.textContent = `${totalAmount} €`;
        }
    },

    handleSubmit: function(e) {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Envoi en cours...';
        if(window.lucide) lucide.createIcons();
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            document.getElementById('recap-content').style.display = 'none';
            document.getElementById('step-5-actions').style.display = 'none';
            document.getElementById('success-state').style.display = 'block';
            
            if(window.lucide) lucide.createIcons();
            if(window.showToast) window.showToast('Demande envoyée avec succès !', 'success');
        }, 1500);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    devisApp.init();
});
