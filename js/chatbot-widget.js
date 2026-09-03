(function() {
  const WELCOME = "Bonjour ! Je suis Flora, votre conseillère de l'Atelier Galaad. 🌸 Comment puis-je vous aider aujourd'hui ?";

  const QUICK_CHIPS_INIT = ['Mariage', 'Bouquet cadeau', 'Prix & tarifs', 'Fleurs de saison', 'Livraison'];

  const RESPONSES = [
    {
      keywords: ['mariage', 'noces', 'cérémonie', 'wedding'],
      text: "Félicitations pour votre mariage ! Nous proposons des compositions florales sur-mesure pour votre grand jour. Souhaitez-vous obtenir un devis personnalisé ?",
      chips: ['Obtenir un devis', 'Voir les styles', 'Prix mariage'],
      action: { label: 'Demander un devis', href: 'devis-mariage.html' }
    },
    {
      keywords: ['prix', 'tarif', 'budget', 'coût', 'coute', 'combien'],
      text: "Nos bouquets démarrent à partir de 25€. Pour les mariages, les compositions commencent à 120€ pour un bouquet de mariée. Voulez-vous utiliser notre simulateur de prix ?",
      chips: ['Simulateur de prix', 'Bouquet mariage', 'Livraison'],
      action: { label: 'Simuler mon prix', href: 'simulateur-prix.html' }
    },
    {
      keywords: ['pivoine', 'pivoines'],
      text: "La pivoine est l'une de nos fleurs phares — voluptueuse et romantique. Disponible en rose, blanc et corail, surtout au printemps et en été.",
      product: { nom: 'Pivoine', prix: 4.50, desc: 'Reine des fleurs, romantique et voluptueuse', icon: 'flower-2' },
      chips: ['Voir d\'autres fleurs', 'Créer un bouquet', 'Prix & tarifs']
    },
    {
      keywords: ['rose', 'roses'],
      text: "La rose est notre fleur la plus populaire, disponible toute l'année dans de nombreuses couleurs. Un grand classique indémodable.",
      product: { nom: 'Rose', prix: 2.80, desc: 'Symbole d\'élégance, disponible toute l\'année', icon: 'flower' },
      chips: ['Bouquet de roses', 'Mariage', 'Livraison']
    },
    {
      keywords: ['tulipe', 'tulipes'],
      text: "Les tulipes sont gracieuses et colorées, parfaites pour tout événement. Disponibles au printemps dans de nombreuses teintes.",
      product: { nom: 'Tulipe', prix: 1.90, desc: 'Gracieuse et colorée, idéale pour toute occasion', icon: 'flower-2' },
      chips: ['Créer un bouquet', 'Fleurs de saison']
    },
    {
      keywords: ['livraison', 'livrer', 'commander', 'commande'],
      text: "Nous livrons dans tout Paris et la région parisienne. La livraison est offerte dès 80€ d'achat. Délai : 24 à 48h selon disponibilité.",
      chips: ['Commander un bouquet', 'Prix livraison', 'Zone de livraison']
    },
    {
      keywords: ['saison', 'disponible', 'disponibles', 'maintenant', 'actuellement'],
      text: "En ce moment, nous recommandons particulièrement les pivoines, les dahlias, les anémones et le mimosa. Des fleurs de saison toujours plus belles !",
      chips: ['Pivoine', 'Dahlia', 'Créer un bouquet']
    },
    {
      keywords: ['bouquet', 'créer', 'composer', 'composition'],
      text: "Utilisez notre Créateur de Bouquet pour composer visuellement votre arrangement idéal et obtenir une estimation de prix instantanée.",
      chips: ['Ouvrir le créateur', 'Prix & tarifs'],
      action: { label: 'Créer mon bouquet', href: 'generateur-bouquet.html' }
    },
    {
      keywords: ['bonjour', 'salut', 'hello', 'bonsoir'],
      text: "Bonjour ! Bienvenue à l'Atelier Galaad. Je suis Flora, votre conseillère florale. Comment puis-je vous aider ?",
      chips: ['Mariage', 'Bouquet cadeau', 'Prix & tarifs']
    },
    {
      keywords: ['merci'],
      text: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Nous sommes là pour rendre votre expérience florale exceptionnelle.",
      chips: ['Autre question', 'Devis mariage', 'Nos fleurs']
    },
  ];

  const DEFAULT_RESPONSE = {
    text: "Je ne suis pas sûre de comprendre votre demande. Voici ce que je peux vous aider à trouver :",
    chips: ['Mariage', 'Prix & tarifs', 'Nos fleurs', 'Livraison', 'Créer un bouquet']
  };

  // Inject widget HTML
  function injectWidget() {
    const html = `
      <button class="chat-trigger" id="chat-trigger" aria-label="Ouvrir le chat">
        <div class="chat-badge" id="chat-badge">1</div>
        <svg class="icon-chat" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg class="icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Chat Atelier Galaad">
        <div class="chat-header">
          <div class="chat-header-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="chat-header-info">
            <div class="chat-header-name">Flora — Atelier Galaad</div>
            <div class="chat-header-status"><div class="status-dot"></div> En ligne · Répond en quelques minutes</div>
          </div>
          <button class="chat-header-close" id="chat-close" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-chips" id="chat-chips"></div>
        <div class="chat-input-bar">
          <input type="text" class="chat-input" id="chat-input" placeholder="Écrivez votre message..." autocomplete="off" />
          <button class="chat-send" id="chat-send" aria-label="Envoyer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const r of RESPONSES) {
      if (r.keywords.some(k => lower.includes(k))) return r;
    }
    return DEFAULT_RESPONSE;
  }

  function addMessage(content, role, extra) {
    const msgs = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    
    let avatarHtml = '';
    if (role === 'bot') {
      avatarHtml = `<div class="msg-avatar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`;
    }

    let productHtml = '';
    if (extra && extra.product) {
      const p = extra.product;
      productHtml = `
        <div class="chat-product-card">
          <div class="chat-product-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="chat-product-info">
            <div class="chat-product-name">${p.nom}</div>
            <div class="chat-product-desc">${p.desc}</div>
          </div>
          <div class="chat-product-price">${p.prix.toFixed(2)}€</div>
        </div>
      `;
    }

    let actionHtml = '';
    if (extra && extra.action) {
      actionHtml = `<a href="${extra.action.href}" class="btn btn-primary btn-xs" style="margin-top:8px;display:inline-flex;">${extra.action.label}</a>`;
    }

    wrap.innerHTML = `
      ${avatarHtml}
      <div>
        <div class="msg-bubble">${content}${productHtml}${actionHtml}</div>
      </div>
    `;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const msgs = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'msg bot msg-typing';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <div class="msg-avatar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div class="msg-bubble"><div class="typing-dots"><span>.</span><span>.</span><span>.</span></div></div>
    `;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  function setChips(chips) {
    const container = document.getElementById('chat-chips');
    container.innerHTML = chips.map(c =>
      `<button class="chat-chip" onclick="window._chatSend('${c}')">${c}</button>`
    ).join('');
  }

  function respond(userText) {
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      const r = getResponse(userText);
      addMessage(r.text, 'bot', { product: r.product, action: r.action });
      if (r.chips) setChips(r.chips);
    }, 1100 + Math.random() * 400);
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    respond(text);
  }

  window._chatSend = sendMessage;

  function togglePanel() {
    const trigger = document.getElementById('chat-trigger');
    const panel = document.getElementById('chat-panel');
    const badge = document.getElementById('chat-badge');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    trigger.classList.toggle('open');
    badge.classList.remove('show');
    if (!isOpen && document.getElementById('chat-messages').children.length === 0) {
      setTimeout(() => {
        const typing = addTyping();
        setTimeout(() => {
          typing.remove();
          addMessage("Bonjour et bienvenue à l'Atelier Galaad ! Je suis Flora, votre conseillère florale. Comment puis-je vous aider ?", 'bot');
          setChips(QUICK_CHIPS_INIT);
        }, 1000);
      }, 200);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectWidget();
    document.getElementById('chat-trigger').addEventListener('click', togglePanel);
    document.getElementById('chat-close').addEventListener('click', togglePanel);
    document.getElementById('chat-send').addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      sendMessage(input.value);
    });
    document.getElementById('chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        sendMessage(e.target.value);
      }
    });
    setTimeout(() => {
      const badge = document.getElementById('chat-badge');
      if (badge) badge.classList.add('show');
    }, 3000);
  });
})();
