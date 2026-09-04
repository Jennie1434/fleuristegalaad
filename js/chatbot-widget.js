(function() {
  const API_KEY = "AIzaSyBxPTOnzFvIR1VGs4mNjjocKH_fvZzc8Io";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const QUICK_CHIPS_INIT = ['Mariage', 'Bouquet cadeau', 'Prix & tarifs', 'Fleurs de saison', 'Livraison'];

  let chatHistory = [];

  const SYSTEM_PROMPT = `Tu es Flora, la conseillère florale experte de l'Atelier Galaad, un fleuriste parisien haut de gamme.
Ton ton est élégant, poli, chaleureux et expert.
Tu dois aider les clients à choisir des fleurs, donner des conseils sur les bouquets, les mariages et les prix.
Voici quelques informations sur l'Atelier Galaad :
- Les bouquets démarrent à 25€.
- Pour les mariages, le bouquet de mariée commence à 120€. Il y a un devis mariage en ligne.
- Fleurs phares : Pivoines (printemps/été), Roses (toute l'année), Tulipes (printemps), Hortensias, Anémones.
- Livraison : Paris et région parisienne. Offerte dès 80€ d'achat. Délai : 24 à 48h.
Si le client veut composer un bouquet, recommande-lui le "Créateur de Bouquet" en ligne.
Si le client veut un devis mariage, recommande-lui le "Devis Mariage" en ligne.
Ne donne pas de conseils médicaux. Reste concentrée sur les fleurs. Sois concise (max 3 phrases). N'utilise pas de markdown complexe, juste du texte simple.`;

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
            <div class="chat-header-status"><div class="status-dot"></div> En ligne · IA Gemini</div>
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

  function addMessage(content, role) {
    const msgs = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    
    let avatarHtml = '';
    if (role === 'bot') {
      avatarHtml = `<div class="msg-avatar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`;
    }

    // Clean up basic markdown like **bold**
    let cleanContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    wrap.innerHTML = `
      ${avatarHtml}
      <div>
        <div class="msg-bubble">${cleanContent}</div>
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

  async function callGeminiAPI(userText) {
    chatHistory.push({ role: 'user', parts: [{ text: userText }] });

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: chatHistory
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      const botResponseText = data.candidates[0].content.parts[0].text;
      
      chatHistory.push({ role: 'model', parts: [{ text: botResponseText }] });
      return botResponseText;
    } catch (error) {
      console.error(error);
      chatHistory.pop(); // Remove user message from history on error
      return "Désolée, je rencontre un petit problème de connexion. Pouvez-vous réessayer ?";
    }
  }

  async function respond(userText) {
    const typing = addTyping();
    setChips([]); // Clear chips while typing
    
    const responseText = await callGeminiAPI(userText);
    
    typing.remove();
    addMessage(responseText, 'bot');
    
    // Propose contextual chips based on keywords (simple fallback)
    const lower = responseText.toLowerCase();
    let newChips = [];
    if (lower.includes('mariage')) newChips = ['Devis mariage', 'Créateur de bouquet'];
    else if (lower.includes('bouquet')) newChips = ['Créateur de bouquet', 'Fleurs de saison'];
    else newChips = QUICK_CHIPS_INIT;
    
    setChips(newChips);
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
          addMessage("Bonjour et bienvenue à l'Atelier Galaad ! Je suis Flora, votre conseillère florale propulsée par l'IA. Comment puis-je vous aider ?", 'bot');
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
