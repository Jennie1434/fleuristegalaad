/* ============================================
   ATELIER GALAAD — Catalogue de fleurs
   ============================================ */

const CATALOGUE = {
  fleurs: [
    { id: 'pivoine',     nom: 'Pivoine',         emoji: '🌸', prix: 4.50,  couleurs: ['rose', 'blanc', 'corail'], saison: 'Printemps-Été',    description: 'Reine des fleurs, voluptueuse et romantique.' },
    { id: 'rose',        nom: 'Rose',             emoji: '🌹', prix: 2.80,  couleurs: ['rouge', 'rose', 'blanc', 'jaune', 'pêche'], saison: 'Toute l\'année', description: 'Symbole universel de l\'amour et de l\'élégance.' },
    { id: 'tulipe',      nom: 'Tulipe',           emoji: '🌷', prix: 1.90,  couleurs: ['rouge', 'rose', 'violet', 'blanc', 'jaune'], saison: 'Printemps', description: 'Gracieuse et colorée, idéale pour tout événement.' },
    { id: 'hortensia',   nom: 'Hortensia',        emoji: '💐', prix: 6.00,  couleurs: ['bleu', 'rose', 'violet', 'blanc'], saison: 'Été',          description: 'Généreux et plein de caractère, effet volume garanti.' },
    { id: 'lys',         nom: 'Lys',              emoji: '🌼', prix: 3.50,  couleurs: ['blanc', 'rose', 'orange'], saison: 'Toute l\'année', description: 'Noble et parfumé, apporte majesté aux compositions.' },
    { id: 'freesia',     nom: 'Freesia',          emoji: '🌻', prix: 2.20,  couleurs: ['jaune', 'blanc', 'violet', 'rose'], saison: 'Printemps', description: 'Délicat et très parfumé, tonique et frais.' },
    { id: 'renoncule',   nom: 'Renoncule',        emoji: '🌺', prix: 3.20,  couleurs: ['rose', 'pêche', 'blanc', 'rouge', 'jaune'], saison: 'Printemps', description: 'Petite pivoine au charme irrésistible.' },
    { id: 'eucalyptus',  nom: 'Eucalyptus',       emoji: '🌿', prix: 2.00,  couleurs: ['vert'], saison: 'Toute l\'année', description: 'Verdure aromatique, parfaite pour structurer un bouquet.' },
    { id: 'mimosa',      nom: 'Mimosa',           emoji: '🌾', prix: 3.80,  couleurs: ['jaune'], saison: 'Hiver-Printemps', description: 'Soleil d\'hiver, nuage de douceur et de légèreté.' },
    { id: 'anemone',     nom: 'Anémone',          emoji: '💮', prix: 2.90,  couleurs: ['violet', 'blanc', 'rouge', 'rose'], saison: 'Hiver-Printemps', description: 'Graphique et moderne, contraste élégant.' },
    { id: 'lavande',     nom: 'Lavande',          emoji: '💜', prix: 1.80,  couleurs: ['violet'], saison: 'Été', description: 'Provençale et apaisante, parfum incomparable.' },
    { id: 'orchidee',    nom: 'Orchidée',         emoji: '🌸', prix: 7.50,  couleurs: ['blanc', 'violet', 'rose', 'jaune'], saison: 'Toute l\'année', description: 'Exotique et sophistiquée, le luxe végétal.' },
    { id: 'dahlia',      nom: 'Dahlia',           emoji: '🌻', prix: 4.00,  couleurs: ['rouge', 'orange', 'rose', 'violet', 'blanc'], saison: 'Été-Automne', description: 'Géométrique et audacieux, explosion de couleurs.' },
    { id: 'gypsophile',  nom: 'Gypsophile',       emoji: '❄️', prix: 1.50,  couleurs: ['blanc'], saison: 'Toute l\'année', description: 'Nuage de petites fleurs blanches, légèreté absolue.' },
    { id: 'muguet',      nom: 'Muguet',           emoji: '🌱', prix: 5.00,  couleurs: ['blanc'], saison: 'Printemps', description: 'Fleur du bonheur, parfum pur et délicat.' },
  ],

  arrangements: [
    { id: 'bouquet-simple',   nom: 'Bouquet simple',      prix_base: 25,  description: 'Bouquet rond classique, 12 à 15 tiges.',     image: '💐' },
    { id: 'bouquet-luxe',     nom: 'Bouquet luxe',        prix_base: 65,  description: 'Composition luxuriante, 25+ tiges premium.', image: '🌹' },
    { id: 'centre-table',     nom: 'Centre de table',     prix_base: 80,  description: 'Décoration florale pour table de réception.', image: '🌸' },
    { id: 'arche-florale',    nom: 'Arche florale',       prix_base: 350, description: 'Arche végétale pour cérémonie ou shooting.', image: '🌿' },
    { id: 'couronne',         nom: 'Couronne florale',    prix_base: 45,  description: 'Couronne de fleurs tressées, bohème et chic.', image: '👑' },
    { id: 'boutonniere',      nom: 'Boutonnière',         prix_base: 15,  description: 'Petite composition pour la veste du marié.',  image: '🌷' },
    { id: 'chemin-table',     nom: 'Chemin de table',     prix_base: 120, description: 'Composition végétale en longueur pour table.', image: '🌾' },
    { id: 'composition-urne', nom: 'Composition en urne', prix_base: 95,  description: 'Composition haute en urne ou vase sculpté.',  image: '🏺' },
  ],

  occasions: [
    { id: 'mariage',      nom: 'Mariage',       emoji: '💍', description: 'Bouquets de mariée, décorations de salle, arches' },
    { id: 'anniversaire', nom: 'Anniversaire',  emoji: '🎂', description: 'Bouquets festifs et compositions colorées' },
    { id: 'naissance',    nom: 'Naissance',     emoji: '👶', description: 'Compositions douces et pastels' },
    { id: 'deuil',        nom: 'Deuil',         emoji: '🕊️', description: 'Gerbes, couronnes et compositions sobres' },
    { id: 'saint-valentin', nom: 'Saint-Valentin', emoji: '❤️', description: 'Roses rouges et compositions romantiques' },
    { id: 'fete-des-meres', nom: 'Fête des mères', emoji: '🌷', description: 'Bouquets printaniers et délicats' },
    { id: 'corporate',    nom: 'Événement pro', emoji: '🏢', description: 'Décoration florale pour entreprises et événements' },
    { id: 'quotidien',    nom: 'Plaisir quotidien', emoji: '😊', description: 'Se faire plaisir ou faire plaisir' },
  ],

  styles: [
    { id: 'champetre',  nom: 'Champêtre',  emoji: '🌾', description: 'Naturel, sauvage, herbes folles' },
    { id: 'classique',  nom: 'Classique',  emoji: '🌹', description: 'Élégant, symétrique, raffiné' },
    { id: 'moderne',    nom: 'Moderne',    emoji: '🖤', description: 'Graphique, épuré, architectural' },
    { id: 'boheme',     nom: 'Bohème',     emoji: '✨', description: 'Romantique, poétique, libre' },
    { id: 'tropical',   nom: 'Tropical',   emoji: '🌴', description: 'Exotique, vibrant, original' },
  ],

  couleurs: [
    { id: 'blanc-creme', nom: 'Blanc & Crème', hex: '#F5F0E8', emoji: '🤍' },
    { id: 'rose-pastel', nom: 'Rose pastel',   hex: '#F2BFCC', emoji: '🩷' },
    { id: 'rose-vif',    nom: 'Rose vif',      hex: '#E8647A', emoji: '🌸' },
    { id: 'rouge',       nom: 'Rouge passion', hex: '#C0392B', emoji: '❤️' },
    { id: 'peche',       nom: 'Pêche & Corail',hex: '#E8936A', emoji: '🍑' },
    { id: 'jaune',       nom: 'Jaune doré',    hex: '#F0C040', emoji: '💛' },
    { id: 'violet',      nom: 'Violet mauve',  hex: '#9B59B6', emoji: '💜' },
    { id: 'bleu',        nom: 'Bleu',          hex: '#4A90D9', emoji: '💙' },
    { id: 'vert-sauge',  nom: 'Vert sauge',    hex: '#7AA88A', emoji: '💚' },
    { id: 'mixte',       nom: 'Multicolore',   hex: 'linear-gradient(135deg, #F2BFCC, #F0C040, #7AA88A)', emoji: '🌈' },
  ],

  // Tarifs mariage
  tarifsMariage: {
    bouquetMariee: { simple: 120, luxe: 250, prestige: 450 },
    bouquetDemoiselle: { prix: 65 },
    boutonniere: { prix: 18 },
    centreTable: { simple: 80, luxe: 150, prestige: 280 },
    archeCeremonie: { simple: 450, luxe: 800, prestige: 1400 },
    cheminsTable: { prixParMetre: 45 },
    petalles: { prix: 80 },
    couronneMariee: { prix: 85 },
  },

  // Messages du chatbot
  chatResponses: {
    bonjour: "Bonjour et bienvenue à l'Atelier Galaad ! 🌸 Je suis votre conseillère florale. Comment puis-je vous aider aujourd'hui ?",
    mariage: "Magnifique projet ! Pour un mariage, nous proposons une gamme complète : bouquets de mariée, arches florales, centres de table... Quel est votre style de mariage ?",
    prix: "Nos bouquets commencent à 25€ pour un bouquet simple, jusqu'à 450€ pour une composition de prestige. Quel est votre budget approximatif ?",
    livraison: "Nous livrons dans tout Paris et la région parisienne. La livraison est offerte à partir de 80€ d'achat. Souhaitez-vous être livré ?",
    saison: "Les fleurs de saison sont toujours plus belles et plus économiques ! En ce moment, je recommande particulièrement les pivoines, les dahlias et les renoncules.",
    defaut: "Je serais ravie de vous aider à trouver le bouquet parfait ! Parlez-moi de l'occasion, de vos couleurs préférées ou de votre budget.",
  }
};

// Fonction utilitaire : calculer prix bouquet
function calculerPrixBouquet(fleurs, nbTiges, extras = {}) {
  const base = fleurs.reduce((sum, f) => {
    const fleur = CATALOGUE.fleurs.find(fl => fl.id === f.id);
    return sum + (fleur ? fleur.prix * f.nb : 0);
  }, 0);
  const emballage = extras.emballage ? 8 : 0;
  const ruban = extras.ruban ? 5 : 0;
  const livraison = extras.livraison ? 12 : 0;
  return (base + emballage + ruban + livraison).toFixed(2);
}

// Export (disponible globalement)
window.CATALOGUE = CATALOGUE;
window.calculerPrixBouquet = calculerPrixBouquet;
