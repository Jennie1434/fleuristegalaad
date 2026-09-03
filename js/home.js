document.addEventListener('DOMContentLoaded', () => {

  /* ── Render seasonal flowers ── */
  const container = document.getElementById('seasonal-flowers');
  if (container) {
    const flowers = (typeof CATALOGUE !== 'undefined' && CATALOGUE.fleurs)
      ? CATALOGUE.fleurs.slice(0, 6)
      : [
          { nom: 'Pivoine',       saison: 'Printemps',    prix: 4.50 },
          { nom: 'Rose',          saison: 'Toute année',  prix: 2.80 },
          { nom: 'Tulipe',        saison: 'Printemps',    prix: 1.90 },
          { nom: 'Hortensia',     saison: 'Été',          prix: 5.20 },
          { nom: 'Dahlia',        saison: 'Automne',      prix: 3.80 },
          { nom: 'Anémone',       saison: 'Hiver',        prix: 2.50 },
        ];

    const flowerSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

    container.innerHTML = flowers.map((f, i) => `
      <div class="flower-card reveal" style="transition-delay:${i * 0.07}s;">
        <div class="flower-icon-wrap">${flowerSVG}</div>
        <div class="flower-info">
          <div class="flower-name">${f.nom}</div>
          <div class="flower-season">${f.saison}</div>
        </div>
        <div class="flower-price">${(f.prix || 0).toFixed(2)}€<small style="font-size:.55em;font-family:var(--font-sans);color:var(--text-muted);font-weight:400">/tige</small></div>
      </div>
    `).join('');

    // Re-observe newly injected reveals
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    container.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  /* ── Animate stat counters ── */
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const dur = 1800;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        el.textContent = Math.round(ease * target) + (target >= 100 ? '+' : '');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  /* ── Subtle hero parallax ── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `translateY(${y * 0.18}px)`;
      }
    }, { passive: true });
  }

});
