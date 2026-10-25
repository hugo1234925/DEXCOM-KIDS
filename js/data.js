/* Données de l'app (tout est simulé : aucune vraie glycémie). */
window.DK = {
  compagnons: [
    { id: 'renard', nom: 'Foxy', espece: 'Renard', desc: 'Curieux et rassurant. Le compagnon par défaut.', fond: '#FFE7CC' },
    { id: 'moufette', nom: 'Mouffy', espece: 'Moufette', desc: 'Douce et rigolote, avec sa grosse queue rayée.', fond: '#E3E7EA' },
    { id: 'alien', nom: 'Zib', espece: 'Extraterrestre', desc: 'Venu de l’espace, avec ses petites cornes et sa queue de dragon.', fond: '#EAF4D6' }
  ],

  // États de glycémie (mmol/L). Les seuils viennent du cahier des charges.
  etats: {
    zone:     { val: '6,2',  tendance: 'stable',   fleche: 'droite',    couleur: '#447C08', bulle: 'zone',          pose: null,        message: 'On est dans la zone, on joue ?' },
    bas:      { val: '3,6',  tendance: 'descend',  fleche: 'bas-droite',couleur: '#D12F2F', bulle: 'bas',           pose: 'foxy-faim', message: 'Mon énergie baisse… on prend un jus ?' },
    haut:     { val: '11,8', tendance: 'monte',    fleche: 'haut-droite',couleur: '#E0A100', bulle: 'haut',          pose: 'foxy-soif', message: 'J’ai soif… on boit un verre d’eau ?' },
    tresHaut: { val: '15,2', tendance: 'très haut',fleche: 'haut',      couleur: '#E0A100', bulle: 'tres-haut',     pose: 'foxy-soif', message: 'Je suis très fatigué. Montre ça à un adulte.' },
    urgence:  { val: '2,9',  tendance: 'descend vite', fleche: 'bas',   couleur: '#8E1B1B', bulle: 'urgence-basse', pose: null,        message: '' },
    attente:  { val: '—',    tendance: 'capteur en préparation', fleche: null, couleur: '#32A3C9', bulle: null, pose: 'foxy-dodo', message: 'Pas de lecture pour l’instant. Si ça dure, vérifie ton capteur avec un adulte.' }
  },

  // Accessoires portés par le compagnon. pos = placement sur le compagnon (% de la largeur / hauteur)
  accessoires: [
    { id: 'chapeau-de-magicien', nom: 'Chapeau', zone: 'tete', prix: 0, defi: null, pos: { x: 48, y: -19, w: 44 } },
    { id: 'casquette', nom: 'Casquette', zone: 'tete', prix: 0, defi: 'Défi Collation', pos: { x: 48, y: -10, w: 48 } },
    { id: 'badge-6-7', nom: 'Badge 6-7', zone: 'corps', prix: 30, defi: null, pos: { x: 54, y: 56, w: 22 } },
    { id: 'foulard', nom: 'Foulard', zone: 'corps', prix: 0, defi: 'Défi Jardin', pos: { x: 50, y: 41, w: 42 } },
    { id: 'lunettes-de-soleil', nom: 'Lunettes', zone: 'yeux', prix: 15, defi: null, pos: { x: 49, y: 15, w: 50 } },
    { id: 'toilette', nom: 'Toilette', zone: 'tete', prix: 25, defi: null, pos: { x: 48, y: -16, w: 40 } },
    { id: 'noeud-papillon', nom: 'Nœud papillon', zone: 'corps', prix: 0, defi: 'Défi Bolus', pos: { x: 51, y: 43, w: 30 } },
    { id: 'bonnet', nom: 'Bonnet', zone: 'tete', prix: 10, defi: null, pos: { x: 48, y: -9, w: 46 } },
    { id: 'chapeau-de-cowboy', nom: 'Cowboy', zone: 'tete', prix: 0, defi: 'Défi Devine', pos: { x: 48, y: -12, w: 58 } },
    { id: 'couronne', nom: 'Couronne', zone: 'tete', prix: 40, defi: null, pos: { x: 48, y: -10, w: 40 } },
    { id: 'cape', nom: 'Cape', zone: 'dos', prix: 25, defi: null, pos: { x: 52, y: 40, w: 62 }, derriere: true },
    { id: 'casque-dastronaute', nom: 'Astronaute', zone: 'tete', prix: 50, defi: null, pos: { x: 48, y: -6, w: 82 } }
  ],

  lieux: [
    { id: 'prairie', nom: 'Prairie', prix: 0 },
    { id: 'desert', nom: 'Désert', prix: 0 },
    { id: 'neige', nom: 'Neige', prix: 25 },
    { id: 'espace', nom: 'Espace', prix: 40 }
  ],

  objets: [
    { id: 'cerf-volant', nom: 'Cerf-volant', prix: 0, place: { x: 320, y: 470 } },
    { id: 'tente', nom: 'Tente', prix: 0, place: { x: 318, y: 660 } },
    { id: 'ballons', nom: 'Ballons', prix: 0, defi: 'Défi Collation', place: { x: 336, y: 440 } },
    { id: 'arc-en-ciel', nom: 'Arc-en-ciel', prix: 20, place: { x: 300, y: 520 } },
    { id: 'cactus', nom: 'Cactus', prix: 15, lieu: 'Désert', place: { x: 330, y: 650 } },
    { id: 'bonhomme-de-neige', nom: 'Bonhomme', prix: 25, lieu: 'Neige', place: { x: 330, y: 650 } },
    { id: 'fusee', nom: 'Fusée', prix: 40, lieu: 'Espace', place: { x: 336, y: 460 } }
  ],

  aliments: [
    { id: 'pomme', nom: 'Pomme', energie: 'Énergie longue', cat: 'Fruits', fait: 'Fait monter ta flèche doucement, grâce aux fibres.' },
    { id: 'carotte', nom: 'Carotte', energie: 'Jardin', cat: 'Légumes', fait: 'Presque pas de sucre : ta flèche reste tranquille.' },
    { id: 'pates', nom: 'Pâtes', energie: 'Énergie longue', cat: 'Pain et pâtes', fait: 'Fait monter ta flèche doucement pendant 2 ou 3 heures.' },
    { id: 'jus', nom: 'Jus', energie: 'Éclair', cat: 'Boissons', fait: 'Fait monter ta flèche très vite. Parfait quand tu es bas !' },
    { id: 'oeuf', nom: 'Œuf', energie: 'Bâtisseur', cat: 'Repas', fait: 'Des protéines : ta flèche bouge très peu.' },
    { id: 'brocoli', nom: 'Brocoli', energie: 'Jardin', cat: 'Légumes', fait: 'Plein de fibres, ta flèche reste calme.' },
    { id: 'barre-granola', nom: 'Barre granola', energie: 'Énergie rapide', cat: 'Collations', fait: 'Fait monter ta flèche assez vite, puis ça se calme.' },
    { id: 'lait', nom: 'Lait', energie: 'Énergie longue', cat: 'Boissons', fait: 'Monte doucement, et ça aide tes os.' },
    { id: 'eau', nom: 'Eau', energie: 'Jardin', cat: 'Boissons', fait: 'Zéro sucre. Parfait quand tu as soif !' }
  ],

  defis: [
    { id: 'bolus', type: 'BOLUS', titre: 'Bolus avant le dîner', sous: 'Série : 2 jours sur 3', total: 3, fait: 2, recompense: 2, action: 'J’ai fait mon bolus', badge: 'serie-de-3',
      pourquoi: 'L’insuline a besoin d’un peu de temps pour agir. La prendre avant le repas aide ta flèche à rester calme.' },
    { id: 'sac', type: 'ROUTINE', titre: 'Collation dans mon sac', sous: 'Avant de partir à l’école', total: 5, fait: 3, recompense: 1, action: 'J’ai ma collation',
      pourquoi: 'Si ton énergie baisse, ta collation est déjà là. Tu n’as pas besoin de chercher.' },
    { id: 'jardin', type: 'NOURRITURE', titre: 'Attrape 3 aliments Jardin', sous: 'Avec la caméra', total: 3, fait: 1, recompense: 3, action: 'Ouvrir la caméra',
      pourquoi: 'Les légumes gardent ta flèche tranquille. Attrape-les pour remplir ton album !' }
  ],

  // Courbe simulée de la journée (heure, valeur)
  journee: [[7,6.1],[8,7.4],[9,8.9],[10,7.6],[11,6.4],[12,5.9],[13,8.8],[14,7.9],[15,6.6],[16,5.2],[17,4.4],[18,6.0],[19,8.2],[20,7.1],[21,6.4]],
  evenements: [
    { h: '17 h 10', titre: 'Alerte basse', sous: 'Jus pris · parent prévenu', val: '3,6', type: 'bas' },
    { h: '18 h 00', titre: 'Souper : pâtes', sous: 'Énergie longue · bolus fait', val: '6,0', type: 'repas', img: 'pates' },
    { h: '15 h 10', titre: 'Barre granola', sous: 'Énergie rapide', val: '6,6', type: 'repas', img: 'barre-granola' },
    { h: '14 h 30', titre: 'Soccer · 30 min', sous: 'Activité', val: '7,9', type: 'activite' },
    { h: '12 h 05', titre: 'Pomme', sous: 'Énergie longue', val: '5,9', type: 'repas', img: 'pomme' }
  ]
};
