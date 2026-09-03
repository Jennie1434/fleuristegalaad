/* ════════════════════════════════════════
   ATELIER GALAAD — nav.js (clean)
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll → glass nav ── */
  const nav = document.getElementById('main-nav');
  if (nav) {
    const isTransparent = nav.dataset.transparent === 'true';
    const onScroll = () => {
      if (window.scrollY > 70) {
        nav.classList.add('nav-scrolled');
        nav.classList.remove('nav-transparent');
      } else {
        nav.classList.remove('nav-scrolled');
        if (isTransparent) nav.classList.add('nav-transparent');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger toggle ── */
  const burger = document.getElementById('nav-hamburger') || document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('open');
    });
  }

  /* ── Active link ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── Custom cursor ── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    const lerp = (a, b, t) => a + (b - a) * t;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    const loop = () => {
      rx = lerp(rx, mx, 0.14);
      ry = lerp(ry, my, 0.14);
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(1.6)'; ring.style.opacity = '0.25'; });
      el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)';   ring.style.opacity = '0.5';  });
    });
  } else {
    // Touch device: hide cursors
    if (dot)  dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ── Toast utility ── */
  window.showToast = (msg, duration = 3200) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, duration);
  };

});
