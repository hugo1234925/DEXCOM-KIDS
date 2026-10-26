# Dexcom Kids

Prototype codé (HTML, CSS, JavaScript) d’une application qui aide les enfants de 7 à 12 ans vivant avec le diabète de type 1 à comprendre leur corps avec un compagnon : Foxy, Mouffy ou Zib.

**Voir le site : https://hugo1234925.github.io/DEXCOM-KIDS/** (hébergé gratuitement avec GitHub Pages)

Projet étudiant en design d’interface. **Les valeurs de glycémie sont simulées** : l’app ne se connecte à aucun capteur et ne calcule aucune dose.

## Parcours inclus
- Inscription (parent) : connexion, qui utilise le téléphone, profil de l’enfant, niveau de lecture, alertes, ajout d’un proche
- Premier lancement (enfant) : choix du compagnon, tutoriel (4 étapes), autorisation de la caméra
- Accueil : bulle d’état (touche pour voir le chiffre), bouton « Ma journée », compagnon qui exprime les besoins du corps (faim, soif, fatigue), ciel qui suit l’heure (jour, soir, nuit)
- Ma journée : graphique et liste des événements
- Urgence basse : appel simulé, « On revérifie », « Ça remonte »
- Défis : progrès, étoiles, badges (liés aux habitudes, jamais à la glycémie), défi manqué, devine ta flèche, choix des défis, résumé de la semaine
- Capteur : changer son capteur avec son compagnon (3 étapes), réveil du capteur, badge Courage
- Caméra : vraie caméra du navigateur, rien n’est sauvegardé ; reconnaissance simulée, cartes de collection et album
- Personnaliser : accessoires du compagnon, paysages, et objets du décor à placer par glisser-déposer
- Profil et réglages : bascules, mode démo pour simuler la glycémie, espace parent (code 1234) avec appareils, alertes, heures calmes, proches et vue proche aidant

## Mettre à jour le site
Chaque `git push` sur la branche `main` republie le site sur GitHub Pages en une ou deux minutes.

## Lancer en local
Ouvrir `index.html` avec un petit serveur (la caméra demande `localhost` ou HTTPS) :

```bash
python3 -m http.server 8000
```

## Structure
- `index.html` : point d’entrée
- `css/styles.css` : jetons de la charte (couleurs, rayons, typo Lexend) et composants
- `js/data.js` : contenus (compagnons, états, accessoires, aliments, défis)
- `js/app.js` : écrans et navigation
- `assets/` : illustrations SVG exportées de Figma

## Accessibilité
Navigation au clavier, libellés `aria-label` sur les boutons-icônes, zones tactiles de 48 px minimum, contraste vérifié et respect de `prefers-reduced-motion`.
