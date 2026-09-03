// js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const quickChips = document.getElementById('quick-chips');
    const occasionChips = document.getElementById('occasion-chips');

    let conversationHistory = [];
    let context = 'start';

    // Populate Sidebar Occasions
    if (window.CATALOGUE && window.CATALOGUE.occasions && occasionChips) {
        window.CATALOGUE.occasions.forEach(occ => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = occ.name;
            chip.addEventListener('click', () => {
                chatInput.value = `Quelles fleurs pour ${occ.name.toLowerCase()} ?`;
                sendMessage();
            });
            occasionChips.appendChild(chip);
        });
    }

    const defaultSuggestions = [
        "Un bouquet pour un mariage",
        "Je cherche des pivoines",
        "Quels sont vos prix ?"
    ];

    function init() {
        updateChips(defaultSuggestions);
        setTimeout(() => {
            addMessage("Bonjour ! Je suis la Conseillère Galaad. Comment puis-je vous aider à trouver la composition florale parfaite aujourd'hui ?", 'bot');
        }, 800);
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        addMessage(text, 'user');
        
        conversationHistory.push({ role: 'user', content: text });
        
        showTyping();
        
        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response.text, 'bot', response.cards);
            conversationHistory.push({ role: 'bot', content: response.text });
            
            if (response.suggestions) {
                updateChips(response.suggestions);
            }
        }, 1200);
    }

    function getBotResponse(text) {
        const lowerText = text.toLowerCase();
        let response = {
            text: "Je n'ai pas tout à fait compris. Pourriez-vous préciser ? Vous cherchez des fleurs pour une occasion particulière, ou une variété spécifique comme des roses ou des pivoines ?",
            suggestions: defaultSuggestions
        };
        let cards = [];
        let foundMatch = false;

        const catalogue = window.CATALOGUE || { fleurs: [], arrangements: [] };
        const allProducts = [...(catalogue.fleurs || []), ...(catalogue.arrangements || [])];

        const matchProduct = (query) => {
            return allProducts.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        };

        // Keywords Matching
        if (lowerText.includes('mariage') || lowerText.includes('wedding')) {
            response.text = "Félicitations ! Pour un mariage, nous recommandons des tons doux et romantiques. Voici quelques-unes de nos créations les plus appréciées pour cette belle occasion.";
            cards = matchProduct('mariage');
            if(cards.length === 0) cards = allProducts.slice(0, 2);
            response.suggestions = ["Bouquet de mariée", "Décoration de salle", "Boutonnières"];
            foundMatch = true;
        } 
        else if (lowerText.includes('prix') || lowerText.includes('budget') || lowerText.includes('tarif')) {
            response.text = "Nos prix varient selon les fleurs et la taille de la composition. Les bouquets simples commencent autour de 35€, et nos grandes compositions sur mesure peuvent aller jusqu'à 150€ ou plus. Quel est votre budget approximatif ?";
            response.suggestions = ["Moins de 50€", "Entre 50€ et 100€", "Plus de 100€"];
            foundMatch = true;
        }
        else if (lowerText.includes('pivoine') || lowerText.includes('peony')) {
            response.text = "Les pivoines sont magnifiques ! Elles sont généralement de saison de fin avril à fin juin. Voici ce que nous proposons actuellement :";
            cards = matchProduct('pivoine');
            foundMatch = true;
        }
        else if (lowerText.includes('rose')) {
            response.text = "Les roses sont un classique intemporel. Nous travaillons avec des roses de producteurs locaux, très parfumées. Voici quelques options :";
            cards = matchProduct('rose');
            foundMatch = true;
        }
        else if (lowerText.includes('tulipe')) {
            response.text = "Ah, les tulipes ! Le symbole du printemps. Elles sont parfaites pour apporter de la couleur et de la joie.";
            cards = matchProduct('tulipe');
            foundMatch = true;
        }
        else if (lowerText.includes('hortensia')) {
            response.text = "L'hortensia est fantastique pour créer du volume et une ambiance champêtre chic.";
            cards = matchProduct('hortensia');
            foundMatch = true;
        }
        else if (lowerText.includes('lavande') || lowerText.includes('orchidée')) {
            response.text = "C'est un excellent choix. Ces fleurs apportent beaucoup de caractère et d'élégance à nos compositions.";
        }
        else if (lowerText.includes('livraison') || lowerText.includes('delivery')) {
            response.text = "Nous livrons sur toute l'agglomération dans la journée pour toute commande passée avant 14h. Les frais de livraison sont de 9,90€, et offerts à partir de 80€ d'achat.";
            response.suggestions = ["Zone de livraison", "Click & Collect"];
            foundMatch = true;
        }
        else if (lowerText.includes('saison') || lowerText.includes('disponible')) {
            response.text = "Nous privilégions toujours les fleurs de saison pour garantir leur fraîcheur et leur beauté. En ce moment, nous avons de magnifiques arrivages !";
            cards = allProducts.slice(0, 2);
            foundMatch = true;
        }
        else if (lowerText.includes('merci') || lowerText.includes('bonjour')) {
            response.text = "C'est un plaisir ! Avez-vous besoin d'autres renseignements ?";
            response.suggestions = defaultSuggestions;
            foundMatch = true;
        }
        else if (lowerText.includes('anniversaire')) {
            response.text = "Un anniversaire mérite de belles fleurs ! Un bouquet coloré ou la fleur préférée de la personne fera toujours plaisir.";
            cards = allProducts.slice(1, 3);
            foundMatch = true;
        }
        else if (lowerText.includes('deuil')) {
            response.text = "Toutes nos condoléances. Nous réalisons des couronnes, coussins et raquettes avec des fleurs sobres et élégantes pour rendre un bel hommage.";
            foundMatch = true;
        }

        response.cards = cards.slice(0, 3); // Max 3 cards
        return response;
    }

    function showTyping() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    function hideTyping() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function addMessage(text, role, cards = []) {
        hideTyping();
        
        const wrapper = document.createElement('div');
        wrapper.className = `message ${role}`;
        
        const textNode = document.createElement('div');
        textNode.innerHTML = text;
        wrapper.appendChild(textNode);

        if (cards && cards.length > 0) {
            cards.forEach(product => {
                wrapper.innerHTML += renderProductCard(product);
            });
        }

        chatMessages.appendChild(wrapper);
        scrollToBottom();
        
        if(window.lucide) {
            lucide.createIcons({ root: wrapper });
        }
    }

    function renderProductCard(product) {
        // Fallback image if not provided
        const img = product.image || 'assets/images/logo.jpg';
        const price = product.price ? `${product.price}€` : '';
        return `
            <a href="#" class="product-card-inline">
                <img src="${img}" alt="${product.name}">
                <div class="product-info-inline">
                    <h4>${product.name}</h4>
                    <p>${price}</p>
                </div>
            </a>
        `;
    }

    function updateChips(suggestions) {
        quickChips.innerHTML = '';
        suggestions.forEach(text => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = text;
            chip.addEventListener('click', () => {
                chatInput.value = text;
                sendMessage();
            });
            quickChips.appendChild(chip);
        });
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Start
    init();
});
