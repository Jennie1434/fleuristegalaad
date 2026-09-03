document.addEventListener('DOMContentLoaded', () => {
    // Parallax hero effect
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
        });
    }

    // Number animation for stats
    const animateNumbers = () => {
        const stats = document.querySelectorAll('.hero-stat-num');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = Math.ceil(target / (duration / 16));
            let current = 0;
            
            const updateCount = () => {
                if (current < target) {
                    current += step;
                    if (current > target) current = target;
                    stat.textContent = current + (target > 100 ? '+' : '');
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target + (target > 100 ? '+' : '');
                }
            };
            
            // Start animation when element is in view
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCount();
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            
            observer.observe(stat);
        });
    };
    
    // Call number animation
    setTimeout(animateNumbers, 500); // Slight delay for entrance animation

    // Render seasonal flowers
    const flowerContainer = document.getElementById('seasonal-flowers');
    
    // Check if CATALOGUE is defined, use fallback if not
    const flowers = (typeof CATALOGUE !== 'undefined' && CATALOGUE.fleurs) ? 
                    CATALOGUE.fleurs.slice(0, 6) : 
                    [
                        { id: 'f1', nom: 'Pivoine Sarah Bernhardt', saison: 'Printemps', prixBase: 8 },
                        { id: 'f2', nom: 'Rose de Jardin David Austin', saison: 'Toute année', prixBase: 7 },
                        { id: 'f3', nom: 'Renoncule Cloni', saison: 'Printemps', prixBase: 6 },
                        { id: 'f4', nom: 'Dahlia Café au Lait', saison: 'Automne', prixBase: 5 },
                        { id: 'f5', nom: 'Hortensia Annabelle', saison: 'Été', prixBase: 12 },
                        { id: 'f6', nom: 'Anémone Mistral', saison: 'Hiver', prixBase: 4 }
                    ];

    if (flowerContainer && flowers.length > 0) {
        let html = '';
        flowers.forEach((flower, index) => {
            const delay = index * 0.1;
            html += `
                <a href="creations.html" class="flower-card reveal" style="transition-delay: ${delay}s">
                    <div class="flower-icon-wrap">
                        <i data-lucide="flower-2"></i>
                    </div>
                    <div class="flower-info">
                        <div class="flower-name">${flower.nom}</div>
                        <div class="flower-season">${flower.saison || 'Sélection'}</div>
                    </div>
                    <div class="flower-price">${flower.prixBase}€</div>
                </a>
            `;
        });
        
        flowerContainer.innerHTML = html;
        
        // Re-initialize Lucide icons for the newly injected HTML
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Observe newly added elements for reveal animation
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        
        document.querySelectorAll('.flower-card.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }
});
