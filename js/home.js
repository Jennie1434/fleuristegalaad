// ============================================
// ATELIER GALAAD — Homepage JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Render seasonal flowers (first 6)
  const container = document.getElementById('seasonal-flowers');
  if (container && window.CATALOGUE) {
    const flowers = CATALOGUE.fleurs.slice(0, 6);
    container.innerHTML = flowers.map((f, i) => `
      <div class="flower-card reveal delay-${i + 1}" onclick="window.location='catalogue-chat.html'">
        <div class="flower-emoji">${f.emoji}</div>
        <div class="flower-info">
          <div class="flower-name">${f.nom}</div>
          <div class="flower-season">${f.saison}</div>
          <div class="flower-desc">${f.description}</div>
        </div>
        <div class="flower-price">${f.prix.toFixed(2)}€<small style="font-size:0.6em;color:var(--text-muted)">/tige</small></div>
      </div>
    `).join('');

    // Re-run reveal observer for newly created elements
    const newEls = container.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
    }, { threshold: 0.1 });
    newEls.forEach(el => observer.observe(el));
  }

  // Parallax hero
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
    }, { passive: true });
  }
});
