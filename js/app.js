/* ==========================================================
   Dexcom Kids — application une page (HTML/CSS/JS sans cadriciel)
   Toutes les données de glycémie sont simulées.
   ========================================================== */
(function () {
  'use strict';
  const D = window.DK;
  const app = document.getElementById('app');
  const stage = document.getElementById('stage');

  /* ---------- État (sauvegardé dans le navigateur) ---------- */
  const DEFAUT = {
    onboard: false, compagnon: 'renard', etoiles: 24, etat: 'zone', lieu: 'prairie', cielAuto: true,
    porte: ['chapeau-de-magicien'], objetsPlaces: ['cerf-volant', 'tente'],
    possede: { acc: ['chapeau-de-magicien', 'casquette', 'foulard', 'noeud-papillon', 'chapeau-de-cowboy'], lieux: ['prairie', 'desert'], obj: ['cerf-volant', 'tente', 'ballons'] },
    album: ['pomme', 'carotte', 'jus', 'oeuf', 'pates', 'brocoli', 'barre-granola'],
    defis: { bolus: 2, sac: 3, jardin: 1 }, badges: ['courage', 'chasseur'],
    sons: true, vibrations: true, grandTexte: false,
    inscrit: false, lecture: 'simple', niveauAlertes: 'attentives', defisChoisis: ['bolus', 'sac', 'jardin'],
    positions: {}, accPos: {}, tailles: {},
    profil: { prenom: 'Léo', nom: 'Tremblay', age: '9 ans', diabete: 'Type 1', capteur: 'Dexcom G7' },
    reg: { basse: true, haute: true, vite: false, nuit: true, ecole: true, seuilBas: 3.9, seuilHaut: 10, repeter: '15 min', son: 'Doux', calme: 'vib' }
  };
  const neuf = () => JSON.parse(JSON.stringify(DEFAUT));
  let S;
  try { S = Object.assign(neuf(), JSON.parse(localStorage.getItem('dk') || '{}')); } catch (e) { S = neuf(); }
  if (S.onboard) S.inscrit = true;
  const save = () => { try { localStorage.setItem('dk', JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } };

  // Navigation
  let route = { name: 'splash', arg: null };
  const pile = [];
  let bulleRetournee = false;
  let ui = {}; // état temporaire d'écran (onglets, étapes…)
  let flux = null; // flux caméra

  /* ---------- Icônes ---------- */
  const I = {
    accueil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
    defis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v3M9 20h6M10 16h4v4h-4z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    perso: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M15 4C8.5 4 4 8.6 4 14.4 4 20.6 9 25 14.4 25c2.2 0 3-1.2 2.2-2.7-.9-1.7.2-3.3 2-3.3H21c3 0 5-2 5-5 0-5.6-5-10-11-10z"/><circle cx="10" cy="13" r="1.4" fill="currentColor"/><circle cx="14" cy="9" r="1.4" fill="currentColor"/><circle cx="19.5" cy="10" r="1.4" fill="currentColor"/><circle cx="9.5" cy="18.5" r="1.4" fill="currentColor"/></svg>',
    profil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5"/></svg>',
    retour: '<svg viewBox="0 0 24 24" fill="none" stroke="#25728C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5 8 12l6.5 7"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="#25728C" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="#25728C"><path d="M6.6 3.5c-1 0-2.1.9-2.1 2.4.2 7.3 6.3 13.4 13.6 13.6 1.5 0 2.4-1.1 2.4-2.1v-2.2c0-.6-.4-1-1-1.2l-3-.8c-.5-.1-1 .1-1.2.5l-.9 1.4c-2.2-1-4-2.8-5-5l1.4-.9c.4-.3.6-.8.5-1.2l-.8-3c-.2-.6-.6-1-1.2-1z"/></svg>',
    etoile: '<svg viewBox="0 0 50 48"><path fill="#FE9732" d="M25 3l6 14 15 1-12 10 4 16-13-9-13 9 4-16L4 18l15-1z"/></svg>',
    graph: '<svg viewBox="0 0 18 18" fill="none" stroke="#25728C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14l5-6 3 3 6-7"/></svg>',
    chevron: '<svg viewBox="0 0 10 16" width="10" height="16" fill="none" stroke="#25728C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l6 6-6 6"/></svg>',
    cadenas: '<svg viewBox="0 0 56 64" width="14" height="16" aria-hidden="true"><path d="M14 28V18a14 14 0 0 1 28 0v10" stroke="currentColor" stroke-width="7" fill="none"/><rect x="4" y="26" width="48" height="36" rx="10" fill="currentColor"/></svg>',
    coche: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 4.5"/></svg>'
  };
  const fleche = (dir, couleur = '#fff') => {
    const p = { droite: 'M12 24h22M26 16l8 8-8 8', 'haut-droite': 'M15 33 33 15M19 15h14v14', 'bas-droite': 'M15 15l18 18M33 19v14H19', haut: 'M24 36V12M16 20l8-8 8 8', bas: 'M24 12v24M16 28l8 8 8-8' }[dir] || '';
    return `<svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="${couleur}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg>`;
  };

  /* ---------- Utilitaires ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const comp = () => D.compagnons.find(c => c.id === S.compagnon) || D.compagnons[0];
  const moment = () => { const h = new Date().getHours(); return h >= 6 && h < 17 ? 'jour' : h >= 17 && h < 20 ? 'soir' : 'nuit'; };
  const decorSrc = (lieu = S.lieu) => `assets/decor/${lieu}-${S.cielAuto ? moment() : 'jour'}.svg`;
  const statut = (clair) => `<div class="statut" ${clair ? 'style="color:#fff"' : ''} aria-hidden="true"><span>9:41</span><span class="batterie"></span></div>`;
  const entete = (titre, opts = {}) => `
    <div class="entete">
      ${opts.sansRetour ? '' : `<button class="btn-rond" data-act="retour" aria-label="Retour">${opts.fermer ? I.fermer : I.retour}</button>`}
      <h1 ${opts.t ? `style="font-size:${opts.t}px"` : ''}>${titre}</h1>${opts.droite || ''}
    </div>`;
  const etoilesPill = () => `<span class="etoiles" aria-label="${S.etoiles} étoiles">${I.etoile}<span>${S.etoiles}</span></span>`;
  const nav = (actif) => {
    const items = [['accueil', 'Accueil', I.accueil], ['defis', 'Défis', I.defis], ['camera', 'Caméra', I.camera], ['perso', 'Personnaliser', I.perso], ['profil', 'Profil et réglages', I.profil]];
    return `<nav class="nav" aria-label="Navigation principale">${items.map(([id, label, ic]) =>
      `<button class="${id === 'camera' ? 'cam' : ''}" data-tab="${id}" aria-label="${label}" ${actif === id ? 'aria-current="page"' : ''}>${ic}</button>`).join('')}</nav>`;
  };
  function toast(msg, ms = 2400) {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    app.appendChild(t); setTimeout(() => t.remove(), ms);
  }
  function gagner(n, msg) {
    S.etoiles += n; save();
    const e = document.createElement('div'); e.className = 'etoile-vol'; e.textContent = `+${n} ★`;
    e.style.left = '50%'; e.style.top = '45%'; e.style.color = '#FE9732'; e.style.fontWeight = '700';
    app.appendChild(e); setTimeout(() => e.remove(), 1000);
    if (msg) toast(msg);
  }

  /* Compagnon avec accessoires portés */
  /* Émotions : foxy-faim → mouffy-faim ou zib-faim selon le compagnon */
  const poseDe = (p) => p && p.replace('foxy', { renard: 'foxy', moufette: 'mouffy', alien: 'zib' }[S.compagnon] || 'foxy');
  const accPos = (a) => Object.assign({}, a.pos, (S.accPos || {})[S.compagnon + ':' + a.id] || {});
  function compagnonHTML(opts = {}) {
    const etat = D.etats[S.etat];
    const pose = !opts.neutre && etat.pose ? poseDe(etat.pose) : null;
    const src = opts.pose ? `assets/pose/${poseDe(opts.pose)}.svg` : pose ? `assets/pose/${pose}.svg` : `assets/compagnon/${S.compagnon}.svg`;
    const acc = (pose || opts.pose || opts.sansAcc) ? [] : S.porte.map(id => D.accessoires.find(a => a.id === id)).filter(Boolean);
    const accHTML = (a) => { const q = accPos(a); return opts.edit
      ? `<img class="acc glissable-acc ${ui.accSel === a.id ? 'choisi' : ''}" data-acc="${a.id}" src="assets/objet/${a.id}.svg" alt="${a.nom}" role="button" tabindex="0" draggable="false" aria-label="${a.nom}. Glisse pour le placer sur ${esc(comp().nom)}, ou utilise les flèches du clavier." style="left:${q.x - q.w / 2}%;top:${q.y}%;width:${q.w}%;${a.derriere ? 'z-index:-1' : ''}">`
      : `<img class="acc" alt="" src="assets/objet/${a.id}.svg" style="left:${q.x - q.w / 2}%;top:${q.y}%;width:${q.w}%;${a.derriere ? 'z-index:-1' : ''}">`; };
    return `<div style="position:relative;isolation:isolate">${acc.filter(a => a.derriere).map(accHTML).join('')}<img class="corps" src="${src}" alt="${esc(comp().nom)}${pose ? ' — ' + esc(etat.message) : ''}">${acc.filter(a => !a.derriere).map(accHTML).join('')}</div>`;
  }

  /* Écran d’accueil en miniature : décor, objets déplaçables, compagnon */
  const objW = (id) => Math.round(74 * ((S.tailles || {})[id] || 1));
  function sceneHTML() {
    const objs = S.objetsPlaces.map(id => D.objets.find(o => o.id === id)).filter(Boolean).map(o => {
      const q = S.positions[o.id] || o.place;
      return `<img class="objet-decor glissable" data-obj="${o.id}" src="assets/objet/${o.id}.svg" alt="${o.nom}" role="button" tabindex="0" draggable="false" aria-label="${o.nom}. Glisse pour le déplacer, ou utilise les flèches du clavier." style="left:${q.x}px;top:${q.y}px;width:${objW(o.id)}px" data-choisi="${ui.objSel === o.id}">`;
    }).join('');
    return `<img class="decor" src="${decorSrc()}" alt="">
      <img src="assets/bulle/zone.svg" alt="" style="position:absolute;left:176px;top:124px;width:240px;opacity:.85;pointer-events:none">
      <div class="compagnon" style="pointer-events:none">${compagnonHTML({ neutre: true })}</div>${objs}
      <div class="nav" style="pointer-events:none;opacity:.6" aria-hidden="true"></div>`;
  }

  /* ==========================================================
     ÉCRANS
     ========================================================== */
  const E = {};

  E.splash = () => {
    setTimeout(() => { if (route.name === 'splash') aller(S.onboard ? 'accueil' : S.inscrit ? 'compagnon' : 'connexion', null, true); }, 1600);
    return `<section class="screen ciel" style="align-items:center;justify-content:center;background:linear-gradient(180deg,#8DD6EE,#E2F3FA)">
      <h1 class="centre" style="font-size:56px;line-height:1;color:#25728C;margin:0;font-weight:700">DEXCOM<br><span style="font-weight:400">KIDS</span></h1>
      <p class="petit centre" style="margin-top:24px">Ton corps te parle. Foxy t’aide à l’écouter.</p></section>`;
  };

  /* 2.1 Choisis ton compagnon */
  E.compagnon = () => {
    const i = ui.choix ?? D.compagnons.findIndex(c => c.id === S.compagnon);
    const c = D.compagnons[i];
    return `<section class="screen" aria-labelledby="t-comp">
      <img class="decor" src="${decorSrc('prairie')}" alt="">
      ${statut()}
      <div style="position:relative;padding:20px 24px 0;text-align:center">
        <h1 id="t-comp" class="h1" style="font-size:30px">Choisis ton compagnon</h1>
        <p class="txt" style="margin-top:8px">Il t’accompagnera chaque jour et portera un capteur comme toi.</p>
      </div>
      <div style="position:relative;flex:1;display:flex;align-items:flex-end;justify-content:center">
        <img src="assets/compagnon/${c.id}.svg" alt="${c.nom}, ${c.espece}" style="width:300px;margin-bottom:8px">
      </div>
      <div style="position:relative;text-align:center">
        <span class="pastille" style="font-size:20px;font-weight:600;color:#25728C;padding:10px 40px">${c.nom}</span>
        <p class="petit" style="margin:8px 40px 0;color:#14232B">${c.desc}</p>
        <div role="radiogroup" aria-label="Compagnons" style="display:flex;gap:18px;justify-content:center;margin:16px 0 110px">
          ${D.compagnons.map((k, j) => `<button role="radio" aria-checked="${j === i}" aria-label="${k.nom}" data-act="choixComp" data-arg="${j}"
              style="width:72px;height:72px;border-radius:50%;background:${k.fond};border:4px solid ${j === i ? '#25728C' : '#fff'};overflow:hidden;display:grid;place-items:start center">
              <img src="assets/compagnon/${k.id}.svg" alt="" style="width:120px;max-width:none;margin-top:4px"></button>`).join('')}
        </div>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="confirmerComp">Je le choisis !</button></div>
    </section>`;
  };

  /* 2.2 à 2.5 Tutoriel */
  E.tuto = () => {
    const n = ui.etape || 0; const c = comp();
    const rond = (fond, contenu) => `<div style="width:80px;height:80px;border-radius:50%;background:${fond};display:grid;place-items:center;margin:0 auto 10px">${contenu}</div>`;
    const etapes = [
      { titre: `Salut, moi c’est ${c.nom} !`, txt: 'Je porte un capteur, comme toi. Ensemble, on va apprendre à comprendre ton corps.',
        haut: `<img src="assets/compagnon/${c.id}.svg" alt="" style="width:250px;margin:0 auto">`, image: true },
      { titre: 'Elle montre où va ton sucre', txt: 'Vers le haut, tout droit ou vers le bas. Touche ton chiffre sous ma bulle pour voir ta journée !',
        haut: `<h2 class="h2">Voici ma flèche</h2><div style="display:flex;justify-content:space-around;margin:20px 0 14px">${[['haut-droite', 'Ça monte'], ['droite', 'Stable'], ['bas-droite', 'Ça descend']].map(([d, l]) => `<div>${rond('#25728C', fleche(d))}<b style="font-size:14px;font-weight:500">${l}</b></div>`).join('')}</div><p class="petit">Plus la flèche penche, plus ça bouge vite.</p>` },
      { titre: 'Ce que je ressens, ton corps le ressent', txt: 'Quand j’ai faim ou soif, c’est ton corps qui te parle.',
        haut: `<h2 class="h2">Mes besoins</h2><div style="display:flex;justify-content:space-around;margin:16px 0 10px">${[['bas', 'J’ai faim', 'Bas'], ['zone', 'En forme', 'Dans la zone'], ['haut', 'J’ai soif', 'Haut']].map(([b, l, s2]) => `<div><img src="assets/bulle/${b}.svg" alt="" style="width:84px;margin:0 auto"><b style="font-size:14px;font-weight:500">${l}</b><div class="petit">${s2}</div></div>`).join('')}</div><p class="petit">Si c’est urgent, je te dirai d’aller voir un adulte.</p>` },
      { titre: 'Joue avec moi !', txt: 'Prends tes repas en photo pour découvrir ce qui fait bouger ta flèche.',
        haut: `<div style="display:flex;justify-content:space-around;margin:8px 0 16px"><div>${rond('#32A3C9', `<span style="width:40px;height:40px;color:#fff">${I.camera}</span>`)}<b style="font-size:14px;font-weight:500">Attrape tes aliments</b></div><div>${rond('#FE9732', '<svg viewBox="0 0 50 48" width="40"><path fill="#fff" d="M25 3l6 14 15 1-12 10 4 16-13-9-13 9 4-16L4 18l15-1z"/></svg>')}<b style="font-size:14px;font-weight:500">Relève des défis</b></div></div><p class="petit">Gagne des étoiles pour habiller ${esc(c.nom)} et décorer son monde.</p>` }
    ];
    const e = etapes[n];
    return `<section class="screen" aria-labelledby="t-tuto">
      <img class="decor" src="${decorSrc('prairie')}" alt="">
      ${statut()}
      <div style="position:relative;display:flex;justify-content:flex-end;padding:4px 24px 0"><button class="btn lien petit" data-act="finTuto">Passer</button></div>
      <div style="position:absolute;left:24px;right:24px;top:84px;bottom:210px;display:flex;flex-direction:column;justify-content:center;gap:20px;text-align:center">
        <div>${e.image ? e.haut : `<div class="carte" style="padding:24px 16px;border-radius:28px;border-color:#32A3C9">${e.haut}</div>`}</div>
        <div>
          <div class="carte centre" style="padding:20px;border-radius:28px"><h2 id="t-tuto" class="h2">${e.titre}</h2><p class="txt" style="margin-top:10px">${e.txt}</p></div>
          <div class="points" aria-label="Étape ${n + 1} sur 4">${[0, 1, 2, 3].map(k => `<i class="${k === n ? 'on' : ''}"></i>`).join('')}</div>
        </div>
      </div>
      <div class="actions-bas" style="bottom:138px"><button class="btn ${n === 3 ? 'recompense' : 'principal'}" data-act="tutoSuivant">${n === 3 ? 'C’est parti !' : 'Suivant'}</button></div>
    </section>`;
  };

  /* 2.6 Autoriser la caméra */
  E.permission = () => `<section class="screen" aria-labelledby="t-perm">
      <img class="decor" src="${decorSrc('prairie')}" alt="">${statut()}
      <div style="position:relative;padding:24px;text-align:center">
        <h1 id="t-perm" class="h1">Une dernière chose !</h1>
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:200px;margin:16px auto">
        <div class="carte"><p class="txt">Pour attraper tes aliments, j’ai besoin de la caméra. Tes photos ne sont <b>jamais</b> sauvegardées.</p></div>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="autoriserCam">Autoriser la caméra</button><button class="btn lien" data-act="finOnboard">Plus tard</button></div>
    </section>`;

  /* 3.x Accueil */
  E.accueil = () => {
    const etat = D.etats[S.etat];
    if (S.etat === 'urgence') { setTimeout(() => aller('urgence', null, true), 0); return '<section class="screen rouge"></section>'; }
    const nuit = S.cielAuto && moment() === 'nuit';
    const coll = route.arg === 'collation';
    if (coll) setTimeout(() => { if (route.name === 'accueil' && route.arg === 'collation') { route.arg = null; rendre(); } }, 4500);
    const bulle = coll ? bulleSpeciale('#447C08', IC.cocheB) : etat.special === 'pompe' ? bulleSpeciale('#5E6A72', IC.lien) : etat.special === 'aide' ? bulleSpeciale('#D12F2F', IC.telB) : etat.bulle
      ? `<div class="face icone"><img src="assets/bulle/${etat.bulle}.svg" alt=""></div>
         <div class="face chiffre" style="--c:${etat.couleur}"><svg viewBox="0 0 240 243" style="position:absolute;inset:0" aria-hidden="true"><circle cx="58" cy="214" r="18" fill="#fff"/><circle cx="34" cy="232" r="11" fill="#fff"/><circle cx="58" cy="214" r="13" fill="${etat.couleur}"/><circle cx="34" cy="232" r="7" fill="${etat.couleur}"/></svg>
           <div class="chiffre-rond"><span class="val">${etat.val}</span><span class="unite">mmol/L</span><span class="fleche">${fleche(etat.fleche, S.etat === 'haut' || S.etat === 'tresHaut' ? '#14232B' : '#fff')}</span></div></div>`
      : `<div class="face icone"><svg viewBox="0 0 240 243" aria-hidden="true"><circle cx="120" cy="112" r="89" fill="#fff"/><circle cx="58" cy="214" r="18" fill="#fff"/><circle cx="34" cy="232" r="11" fill="#fff"/><circle cx="120" cy="112" r="82" fill="#32A3C9"/><circle cx="58" cy="214" r="13" fill="#32A3C9"/><circle cx="34" cy="232" r="7" fill="#32A3C9"/><path d="M106 86h28M106 138h28M110 86q0 20 10 26-10 6-10 26M130 86q0 20-10 26 10 6 10 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg></div>`;
    const objets = S.objetsPlaces.map(id => D.objets.find(o => o.id === id)).filter(Boolean)
      .map(o => { const q = S.positions[o.id] || o.place; return `<img class="objet-decor" src="assets/objet/${o.id}.svg" alt="" style="left:${q.x}px;top:${q.y}px;width:${objW(o.id)}px">`; }).join('');
    return `<section class="screen" aria-label="Accueil">
      <img class="decor" src="${decorSrc()}" alt="">
      ${objets}
      ${statut(nuit)}
      <div class="accueil-entete">
        <span class="salut">${nuit ? `Bonne nuit ${P()}` : `Salut ${P()} !`}</span>
        <div style="display:flex;gap:8px">${etoilesPill()}<button class="btn-rond" data-act="appelerMaman" aria-label="Appeler maman">${I.tel}</button></div>
      </div>
      <button class="bulle-etat ${bulleRetournee ? 'retournee' : ''}" data-act="retourner"
        aria-label="${coll ? 'Collation ajoutée' : etat.special ? esc(etat.message) : etat.bulle ? `Glycémie ${etat.val} millimoles par litre, ${etat.tendance}. Touche pour ${bulleRetournee ? 'revoir Foxy' : 'voir le chiffre'}.` : 'Capteur en préparation'}">${bulle}</button>
      ${coll ? `<span class="pastille-etat">Collation ajoutée !</span><span class="pill-orange" style="position:absolute;top:416px;right:24px;padding:8px 18px;font-size:14px;z-index:3">+1 ★</span>` : etat.special === 'pompe' ? `<span class="pastille-etat">Pompe déconnectée</span>` : etat.special === 'aide' ? `<button class="appel-btn" data-act="appelerMaman">Appeler maman</button>` : etat.bulle ? `<button class="btn-journee" data-go="journee" aria-label="Voir ma journée. ${etat.val} millimoles par litre, ${etat.tendance}">${I.graph}<span>${etat.val} · ${etat.tendance}</span>${I.chevron}</button>` : `<span class="btn-journee" style="border:0">Capteur · 18 min</span>`}
      <p class="dialogue" style="${etat.bulle || etat.special || coll ? '' : 'top:300px'}">${esc(coll ? 'Miam, merci ! Mon énergie remonte.' : S.etat === 'zone' && !S.vuJournee ? 'Psst ! Touche ton chiffre pour voir ta journée.' : etat.message)}</p>
      <button class="compagnon" data-act="toucherCompagnon" aria-label="${esc(comp().nom)}${S.etat === 'bas' ? ' : donner un jus' : ''}" style="${etat.pose && S.compagnon === 'renard' ? 'width:230px;top:478px' : ''}">${compagnonHTML()}</button>
      ${nav('accueil')}
    </section>`;
  };

  /* 3.4 Foxy boit son jus */
  E.jus = () => {
    setTimeout(() => { if (route.name === 'jus') { S.etat = 'zone'; save(); aller('accueil', 'collation', true); gagner(1); } }, 3200);
    return `<section class="screen" aria-label="Foxy boit son jus">
      <img class="decor" src="${decorSrc()}" alt="">${statut()}
      <p class="dialogue" style="top:240px;left:110px;width:210px">Glou glou… Merci ! Mon énergie remonte.</p>
      <div class="compagnon" style="left:110px;top:400px;width:210px">${compagnonHTML({ pose: 'foxy-jus' })}</div>
    </section>`;
  };

  /* 7.x Ma journée */
  E.journee = () => {
    S.vuJournee = true; save();
    const onglet = ui.onglet || 'graph';
    const w = 340, h = 220, x0 = 30, y0 = 10, xs = h2 => x0 + (h2 - 7) / 14 * (w - x0 - 10), ys = v => y0 + (14 - v) / 12 * (h - 40);
    const pts = D.journee.map(([t, v]) => `${xs(t).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
    const graph = `<div class="graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Graphique de la journée : la glycémie est restée surtout dans la zone, avec un bas vers 17 h.">
        <rect x="${x0}" y="${ys(10)}" width="${w - x0 - 10}" height="${ys(3.9) - ys(10)}" fill="#EAF4D6"/>
        ${[4, 7, 10, 13].map(v => `<text x="2" y="${ys(v) + 4}" font-size="11" fill="#5E6A72">${v}</text>`).join('')}
        ${[8, 12, 16, 20].map(t => `<text x="${xs(t) - 8}" y="${h - 8}" font-size="11" fill="#5E6A72">${t} h</text>`).join('')}
        <polyline points="${pts}" fill="none" stroke="#25728C" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${xs(17)}" cy="${ys(4.4)}" r="7" fill="#D12F2F" stroke="#fff" stroke-width="2"/>
        ${[[12, 'pomme'], [15, 'barre-granola'], [18, 'pates']].map(([t, a]) => `<image href="assets/aliment/${a}.svg" x="${xs(t) - 13}" y="${h - 58}" width="26" height="26"/>`).join('')}
      </svg>
      <p class="petit" style="margin-top:6px">Zone verte : entre 3,9 et 10 mmol/L. Touche un aliment de la liste pour voir son effet.</p></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">
        ${[['7 h 10', 'dans la zone'], ['5', 'aliments attrapés'], ['45 min', 'd’activité']].map(([a, b]) => `<div class="carte centre" style="padding:12px 6px"><b style="font-size:20px;color:#25728C">${a}</b><div class="petit">${b}</div></div>`).join('')}
      </div>`;
    const liste = D.evenements.map(e => `<div class="carte" style="display:flex;gap:12px;align-items:center;padding:12px 14px;${e.type === 'bas' ? 'background:#D12F2F;color:#fff;border-color:#D12F2F' : ''}">
        <div style="width:44px;height:44px;border-radius:50%;background:${e.type === 'bas' ? 'rgba(255,255,255,.2)' : '#F2FAFD'};display:grid;place-items:center;flex:none">${e.img ? `<img src="assets/aliment/${e.img}.svg" alt="" width="34">` : e.type === 'bas' ? '!' : '⚽'}</div>
        <div style="flex:1"><div class="petit" style="${e.type === 'bas' ? 'color:#fff' : ''}">${e.h}</div><b style="font-weight:600">${e.titre}</b><div class="petit" style="${e.type === 'bas' ? 'color:#fff' : ''}">${e.sous}</div></div>
        <span class="pastille" style="color:#14232B">${e.val}</span></div>`).join('');
    return `<section class="screen ciel" aria-labelledby="t-j">${statut()}${entete('Ma journée')}
      <div class="scroll">
        <p class="txt" style="margin:0 4px 12px">Aujourd’hui · vendredi 23 octobre</p>
        <div class="selecteur" role="tablist" style="margin-bottom:12px;width:max-content">
          <button role="tab" aria-pressed="${onglet === 'graph'}" aria-selected="${onglet === 'graph'}" data-act="onglet" data-arg="graph">Graphique</button>
          <button role="tab" aria-pressed="${onglet === 'liste'}" aria-selected="${onglet === 'liste'}" data-act="onglet" data-arg="liste">Liste</button>
        </div>
        ${onglet === 'graph' ? graph : liste}
      </div>${nav('accueil')}</section>`;
  };

  /* 4.4 Urgence basse */
  E.urgence = () => `<section class="screen rouge" role="alertdialog" aria-labelledby="t-urg" aria-describedby="d-urg">
      ${statut(true)}
      <p class="centre" style="margin:20px 0 0;font-size:14px;font-weight:600;letter-spacing:.08em">URGENCE BASSE</p>
      <div style="position:relative;width:200px;height:200px;margin:16px auto 0;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 0 0 8px rgba(255,255,255,.25)">
        <div class="centre"><b style="font-size:52px;color:#8E1B1B;line-height:1">2,9</b><div class="petit">mmol/L</div><div style="margin:6px auto 0;width:44px;height:44px;border-radius:50%;background:#8E1B1B;display:grid;place-items:center">${fleche('bas')}</div></div>
      </div>
      <img src="assets/pose/${poseDe('foxy-dodo')}.svg" alt="" style="width:150px;margin:20px auto 0">
      <h1 id="t-urg" class="centre" style="font-size:22px;margin:16px 24px 0;font-weight:600">Je n’ai plus d’énergie.</h1>
      <p id="d-urg" class="centre txt" style="margin:4px 24px 0">Va voir un adulte tout de suite.</p>
      <div class="actions-bas" style="bottom:30px">
        <button class="btn urgence" data-act="appelerMaman">Appeler maman</button>
        <button class="btn" style="border:2px solid #fff;color:#fff" data-go="reverif">J’ai pris du sucre</button>
        <p class="centre" style="font-size:13px;margin:0;opacity:.85">Cette alerte ne peut pas être désactivée.</p>
      </div></section>`;

  /* 4.5 On revérifie */
  E.reverif = () => {
    clearInterval(ui.minuteur); ui.reste = ui.reste ?? 15;
    ui.minuteur = setInterval(() => {
      if (route.name !== 'reverif') return clearInterval(ui.minuteur);
      ui.reste -= 1; const el = document.getElementById('min');
      if (el) el.textContent = `${String(Math.max(ui.reste, 0)).padStart(2, '0')}:00`;
      if (ui.reste <= 0) { clearInterval(ui.minuteur); ui.reste = null; aller('remonte', null, true); }
    }, 700);
    return `<section class="screen ciel" aria-labelledby="t-rv">${statut()}
      <div style="padding:24px;text-align:center">
        <h1 id="t-rv" class="h2">Bravo, tu as pris du sucre !</h1><p class="txt">On revérifie dans</p>
        <div style="width:200px;height:200px;margin:12px auto;border-radius:50%;background:#fff;border:14px solid #CDEAF4;display:grid;place-items:center"><b id="min" style="font-size:46px;color:#25728C">${String(ui.reste).padStart(2, '0')}:00</b></div>
        <p class="petit">(démo : le minuteur va très vite)</p>
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:170px;margin:8px auto">
        <div class="carte"><p class="txt">« Reste assis avec un adulte. Je te préviens quand c’est l’heure. »</p></div>
      </div>
      <div class="actions-bas"><button class="btn lien" data-act="appelerMaman">Appeler maman</button></div></section>`;
  };

  /* 4.6 Ça remonte */
  E.remonte = () => {
    S.etat = 'zone'; save();
    return `<section class="screen ciel" aria-labelledby="t-rm">${statut()}
      <div style="padding:24px;text-align:center">
        <h1 id="t-rm" class="h1">Ça remonte !</h1>
        <div style="width:170px;height:170px;margin:16px auto;border-radius:50%;background:#fff;border:9px solid #fff;box-shadow:0 0 0 5px #447C08;display:grid;place-items:center"><div><b style="font-size:46px">4,6</b><div class="petit">mmol/L</div></div></div>
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:180px;margin:0 auto">
        <div class="carte" style="margin-top:12px"><p class="txt">« Merci ! J’ai retrouvé de l’énergie. »</p></div>
        <p class="petit" style="margin-top:12px">Maman a été prévenue que ça remonte.</p>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="accueil">Retour à l’accueil</button></div></section>`;
  };

  /* 6.1 Mes défis */
  E.defis = () => `<section class="screen ciel" aria-labelledby="t-df">${statut()}${entete('Mes défis', { sansRetour: true, droite: etoilesPill() })}
      <div class="scroll">
        <div class="carte" style="background:#25728C;color:#fff;border-color:#25728C;display:flex;align-items:center;gap:8px">
          <div style="flex:1"><div style="font-size:13px;opacity:.85">CETTE SEMAINE</div><b style="font-size:20px;font-weight:600">${Object.values(S.defis).reduce((a, b) => a + b, 0)} défis réussis</b></div>
          <img src="assets/compagnon/${S.compagnon}.svg" alt="" width="70">
        </div>
        ${D.defis.map(d => { const fait = Math.min(S.defis[d.id] || 0, d.total); return `
        <div class="carte" style="margin-top:12px">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div style="flex:1"><div class="petit" style="font-weight:600;letter-spacing:.04em">${d.type}</div><h2 class="h3" style="margin:2px 0">${d.titre}</h2><div class="petit">${fait} / ${d.total} · ${d.sous}</div></div>
            <span class="badge-pts">+${d.recompense} ★</span>
          </div>
          <div class="barre" style="margin:10px 0" role="progressbar" aria-valuemin="0" aria-valuemax="${d.total}" aria-valuenow="${fait}" aria-label="Progrès"><span style="width:${fait / d.total * 100}%"></span></div>
          <div style="display:flex;gap:8px"><button class="btn principal petit" style="flex:1" data-act="faireDefi" data-arg="${d.id}" ${fait >= d.total ? 'disabled' : ''}>${fait >= d.total ? 'Défi réussi !' : d.action}</button><button class="btn secondaire petit" data-go="defi" data-arg="${d.id}" aria-label="Détail du défi ${d.titre}">Détail</button></div>
        </div>`; }).join('')}
        <p class="etiquette">Plus de jeux</p>
        <div class="carte">
          <button class="ligne" style="width:100%;text-align:left" data-go="devine"><div class="grow"><div class="txt">Devine ta flèche</div><div class="petit">Après ton souper · +1 ★ si tu as raison</div></div><span class="chevron">›</span></button>
          <button class="ligne" style="width:100%;text-align:left" data-go="semaine"><div class="grow"><div class="txt">Ma semaine</div><div class="petit">Ton résumé du 19 au 25 octobre</div></div><span class="chevron">›</span></button>
          <button class="ligne" style="width:100%;text-align:left" data-go="choisirDefis"><div class="grow"><div class="txt">Choisir mes défis</div><div class="petit">3 défis pour la semaine</div></div><span class="chevron">›</span></button>
        </div>
      </div>${nav('defis')}</section>`;

  /* 6.2 Détail d’un défi */
  E.defi = () => {
    const d = D.defis.find(x => x.id === route.arg); const fait = Math.min(S.defis[d.id] || 0, d.total);
    return `<section class="screen ciel" aria-labelledby="t-dd">${statut()}${entete('Défi', { droite: etoilesPill() })}
      <div class="scroll">
        <div class="carte" style="display:flex;gap:10px;align-items:center"><div style="flex:1"><h2 id="t-dd" class="h2">${d.titre}</h2><p class="txt" style="margin-top:6px">${d.pourquoi}</p></div><img src="assets/compagnon/${S.compagnon}.svg" alt="" width="90"></div>
        <p class="etiquette">Ma série</p>
        <div class="carte" style="display:flex;justify-content:space-around">${Array.from({ length: d.total }, (_, k) => `<div class="centre"><div style="width:48px;height:48px;border-radius:50%;margin:0 auto 4px;${k < fait ? 'background:#447C08;display:grid;place-items:center' : 'border:3px solid #E3E7EA'}">${k < fait ? I.coche : ''}</div><span class="petit">Jour ${k + 1}</span></div>`).join('')}</div>
        <p class="petit" style="margin:10px 8px">Les défis parlent de tes habitudes, jamais de ta glycémie.</p>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="faireDefi" data-arg="${d.id}" ${fait >= d.total ? 'disabled' : ''}>${fait >= d.total ? 'Défi réussi !' : d.action}</button></div></section>`;
  };

  /* 6.3 / 6.4 Bravo */
  E.bravo = () => {
    const d = D.defis.find(x => x.id === route.arg); const fait = S.defis[d.id] || 0; const fini = fait >= d.total;
    const etoile = I.etoile.replace('fill="#FE9732"', 'fill="#fff"');
    if (!fini) return `<section class="screen ciel" aria-labelledby="t-bv"><img class="decor" src="${decorSrc('prairie')}" alt="">${statut()}
      <div style="position:relative;text-align:center;padding:28px 24px 0">
        <h1 id="t-bv" class="h1" style="font-size:40px;font-weight:700">Bien joué !</h1>
        <p style="font-size:18px;margin:6px 20px 0">${d.note}</p>
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:222px;margin:14px auto 0">
        <span class="pill-orange" style="margin-top:14px">${etoile}+${d.recompense} étoile${d.recompense > 1 ? 's' : ''}</span>
        <div class="carte" style="text-align:left;margin-top:20px;border-radius:20px"><h2 class="h3">${d.id === 'bolus' ? `Série : ${fait} jours sur ${d.total}` : `Progrès : ${fait} sur ${d.total}`}</h2><div class="barre" style="margin-top:12px" role="progressbar" aria-valuemin="0" aria-valuemax="${d.total}" aria-valuenow="${fait}" aria-label="Progrès"><span style="width:${fait / d.total * 100}%"></span></div></div>
        <div class="info centre" style="margin-top:14px">Maman a reçu un petit message.</div>
      </div>
      <div class="actions-bas" style="bottom:128px"><button class="btn principal" data-tab="defis">Continuer</button></div></section>`;
    return `<section class="screen" aria-labelledby="t-bv"><img class="decor" src="${decorSrc()}" alt="">${statut()}
      <div style="position:relative;text-align:center;padding:16px 24px">
        <h1 id="t-bv" class="h1" style="font-size:38px">Bravo ${P()} !</h1>
        <p class="txt" style="margin-top:6px">Défi réussi en entier !</p>
        <div style="width:190px;margin:48px auto 8px">${compagnonHTML({ neutre: true })}</div>
        <span class="pastille" style="background:#FE9732;color:#fff;font-size:17px;font-weight:600">+${d.recompense} étoiles</span>
        ${d.badge ? `<div class="carte" style="margin-top:16px;display:flex;gap:14px;align-items:center;text-align:left"><img src="assets/badge/${d.badge}.svg" alt="" width="60"><div><div class="petit" style="color:#A34E16;font-weight:600">BADGE DÉBLOQUÉ</div><b>Série de 3</b></div></div>` : ''}
      </div>
      <div class="actions-bas"><button class="btn principal" data-tab="defis">Continuer</button><button class="btn secondaire" data-tab="perso">Habiller ${esc(comp().nom)}</button></div></section>`;
  };

  /* 5.1 / 5.2 Caméra */
  E.camera = () => {
    setTimeout(demarrerCamera, 30);
    return `<section class="screen camera" aria-labelledby="t-cam">
      <video id="video" playsinline muted autoplay aria-hidden="true"></video><div class="sim" id="sim" hidden></div>
      ${statut(true)}
      <div style="position:relative;display:flex;align-items:center;gap:12px;padding:8px 24px;z-index:2">
        <button class="btn-rond" data-act="quitterCamera" aria-label="Fermer la caméra">${I.fermer}</button>
        <h1 id="t-cam" style="flex:1;margin:0;font-size:20px;font-weight:600;text-align:center">Attrape ton aliment</h1><span style="width:48px"></span>
      </div>
      <p class="centre" style="position:relative;margin:4px 0 0;z-index:2"><span class="pastille" style="color:#14232B">${S.album.length} aliments attrapés</span></p>
      <p id="repere" class="centre" style="position:absolute;top:186px;left:0;right:0;z-index:2;margin:0"><span class="pastille" style="color:#14232B">Place ta collation dans le cadre</span></p>
      <div class="viseur" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <p id="camErr" class="centre" style="position:absolute;top:560px;left:24px;right:24px;z-index:2;margin:0" hidden></p>
      <div style="position:absolute;left:20px;bottom:150px;display:flex;align-items:flex-end;gap:8px;z-index:2">
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" width="80"><p class="dialogue" style="position:relative;left:0;top:0;width:180px;color:#14232B">Vise ta collation, je t’aide !</p>
      </div>
      <button class="btn-rond" data-go="album" aria-label="Mon album" style="position:absolute;left:40px;bottom:76px;width:60px;height:60px;z-index:2"><img src="assets/aliment/pomme.svg" alt="" width="40"></button>
      <button class="declencheur" data-act="capturer" aria-label="Attraper l’aliment" style="z-index:2"></button>
      <button class="btn lien petit" data-go="sansCamera" style="position:absolute;right:16px;bottom:96px;color:#fff;z-index:2">Sans caméra</button>
      <p class="centre" style="position:absolute;bottom:22px;left:0;right:0;font-size:13px;margin:0;opacity:.85;z-index:2">La photo n’est jamais sauvegardée.</p>
    </section>`;
  };

  /* 5.4 Choisir l’aliment */
  E.choisir = () => {
    const choix = ui.devine || ['barre-granola', 'pomme', 'pates'];
    const sel = ui.sel || choix[0];
    return `<section class="screen ciel" aria-labelledby="t-ch">${statut()}${entete('Qu’as-tu attrapé ?')}
      <div class="scroll">
        <div style="position:relative;height:200px;border-radius:24px;overflow:hidden;background:#14232B">${ui.photo ? `<img src="${ui.photo}" alt="Photo figée" style="width:100%;height:100%;object-fit:cover">` : `<img src="assets/aliment/${choix[0]}.svg" alt="" style="width:130px;margin:35px auto">`}
          <span class="pastille" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:12px;white-space:nowrap">Photo jamais sauvegardée</span></div>
        <p class="h3" style="margin:16px 4px 8px">On dirait…</p>
        <div role="radiogroup" aria-label="Aliments proposés">${choix.map(a => { const al = D.aliments.find(x => x.id === a); return `
          <button class="carte choix ${sel === a ? 'actif' : ''}" role="radio" aria-checked="${sel === a}" data-act="selAliment" data-arg="${a}" style="margin-top:8px;padding:10px 16px">
            <img src="assets/aliment/${a}.svg" alt="" width="40"><span class="txt" style="flex:1">${al.nom}</span>
            <span style="width:24px;height:24px;border-radius:50%;${sel === a ? 'background:#25728C;display:grid;place-items:center' : 'border:2px solid #14232B'}">${sel === a ? I.coche : ''}</span></button>`; }).join('')}</div>
        <button class="btn lien" data-go="sansCamera">Chercher un autre aliment</button>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="confirmerAliment">C’est ça !</button></div></section>`;
  };

  /* 5.7 Choisir sans caméra */
  E.sansCamera = () => {
    const cats = [['Fruits', 'pomme'], ['Légumes', 'carotte'], ['Pain et pâtes', 'pates'], ['Boissons sucrées', 'boisson-sucree'], ['Eau', 'eau'], ['Lait', 'lait'], ['Collations', 'barre-granola'], ['Repas', 'oeuf']];
    return `<section class="screen ciel" aria-labelledby="t-sc">${statut()}${entete('Pas de caméra ?')}
      <div class="scroll">
        <p class="txt" style="margin:0 4px 12px">Pas de problème ! Choisis ton aliment dans la liste.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cats.map(([c, img]) => `<button class="carte centre" data-act="choisirCat" data-arg="${c}" style="padding:14px 8px"><img src="assets/aliment/${img}.svg" alt="" width="60" style="margin:0 auto"><b style="font-size:14px;font-weight:500">${c}</b></button>`).join('')}</div>
      </div>${nav('camera')}</section>`;
  };

  /* 5.5 Carte découverte */
  E.carte = () => {
    const a = D.aliments.find(x => x.id === route.arg); const deja = S.album.includes(a.id);
    return `<section class="screen" aria-labelledby="t-ca"><img class="decor" src="${decorSrc()}" alt="">${statut()}
      <div style="position:relative;padding:12px 24px;text-align:center">
        <h1 id="t-ca" class="h1">${deja ? 'Tu l’as déjà !' : 'Nouvelle carte !'}</h1>
        <div class="carte" style="margin-top:14px;border:4px solid #FE9732;border-radius:28px;padding:20px">
          <span class="pastille" style="background:#14232B;color:#fff;font-size:12px">${a.energie.toUpperCase()}</span>
          <img src="assets/aliment/${a.id}.svg" alt="" width="150" style="margin:12px auto">
          <h2 class="h2" style="color:#14232B">${a.nom}</h2>
          <p class="txt" style="margin-top:10px">${a.fait}</p>
          <p class="petit" style="margin-top:10px">Observe ta flèche dans 2 h : vois-tu la différence ?</p>
        </div>
      </div>
      <div class="actions-bas"><button class="btn principal" data-act="ajouterAlbum" data-arg="${a.id}">${deja ? 'Voir mon album' : 'Ajouter à mon album'}</button><button class="btn lien" data-act="retour">Ce n’est pas ça</button></div></section>`;
  };

  /* 5.8 / 5.9 Mon album */
  E.album = () => {
    const cases = D.aliments.map(a => ({ a, ok: S.album.includes(a.id) }));
    while (cases.length < 12) cases.push({ a: null, ok: false });
    return `<section class="screen ciel" aria-labelledby="t-al">${statut()}${entete('Mon album')}
      <div class="scroll">
        <p class="petit" style="margin:0 8px 12px">${S.album.length} cartes sur 40</p>
        ${S.album.length === 0 ? `<div class="carte centre"><p class="txt">Ton album est vide ! Attrape ton premier aliment avec moi.</p></div>` : ''}
        <div class="grille">${cases.map(({ a, ok }) => ok
          ? `<button class="tuile" data-go="carte" data-arg="${a.id}" aria-label="${a.nom}, ${a.energie}"><img src="assets/aliment/${a.id}.svg" alt=""><span class="nom">${a.nom}</span><span class="etat" style="background:#14232B;color:#fff;border-radius:8px;padding:2px 6px;font-size:11px">${a.energie}</span></button>`
          : `<div class="tuile" style="border:2px dashed #8DD6EE;background:rgba(255,255,255,.6);justify-content:center" aria-label="Carte à découvrir"><span style="font-size:40px;color:#8DD6EE;font-weight:700">?</span></div>`).join('')}</div>
      </div>
      <div class="actions-bas" style="bottom:130px"><button class="btn principal" data-tab="camera">Ouvrir la caméra</button></div>${nav('camera')}</section>`;
  };

  /* 6.9 / 6.10 Personnaliser */
  E.perso = () => {
    const vue = ui.vue || 'foxy';
    const sel = `<div class="selecteur" role="tablist" aria-label="Personnaliser">
        <button role="tab" aria-selected="${vue === 'foxy'}" aria-pressed="${vue === 'foxy'}" data-act="vue" data-arg="foxy">${esc(comp().nom)}</button>
        <button role="tab" aria-selected="${vue === 'decor'}" aria-pressed="${vue === 'decor'}" data-act="vue" data-arg="decor">Mon décor</button></div>`;
    const tuile = (type, item) => {
      const possede = type === 'acc' ? S.possede.acc.includes(item.id) : type === 'lieu' ? S.possede.lieux.includes(item.id) : S.possede.obj.includes(item.id);
      const actif = type === 'acc' ? S.porte.includes(item.id) : type === 'lieu' ? S.lieu === item.id : S.objetsPlaces.includes(item.id);
      const img = type === 'lieu' ? `<img src="assets/decor/${item.id}-jour.svg" alt="" style="width:100%;height:76px;object-fit:cover;object-position:center 70%;border-radius:12px">` : `<img src="assets/objet/${item.id}.svg" alt="">`;
      const etat = actif ? (type === 'acc' ? 'Porté' : type === 'lieu' ? 'Choisi' : 'Placé') : possede ? 'Toucher pour ' + (type === 'acc' ? 'porter' : 'placer') : item.defi ? item.defi : `${I.cadenas} ${item.prix} ★`;
      return `<button class="tuile ${actif ? 'porte' : ''} ${!possede ? 'verrou' : ''}" data-act="item" data-arg="${type}:${item.id}"
        aria-label="${item.nom}. ${actif ? 'Actif' : possede ? 'Débloqué' : item.defi ? 'Se gagne avec le ' + item.defi : item.prix + ' étoiles'}">${img}<span class="nom">${item.nom}</span><span class="etat">${etat}</span></button>`;
    };
    const contenu = vue === 'foxy'
      ? `<div class="apercu" style="background:linear-gradient(#8DD6EE,#E2F3FA);height:320px;user-select:none"><div style="position:absolute;left:50%;bottom:8px;width:200px;z-index:1;transform:translateX(-50%)">${compagnonHTML({ neutre: true, edit: true })}</div>
           <span class="pastille" style="position:absolute;left:10px;top:10px;font-size:13px;padding:6px 12px;pointer-events:none;z-index:0">Glisse ${S.porte.length > 1 ? 'les accessoires' : 'l’accessoire'} où tu veux</span>
           <button class="btn-rond" data-act="agrandirAcc" aria-label="Agrandir" style="position:absolute;right:10px;bottom:10px;width:44px;height:44px"><svg viewBox="0 0 24 24" fill="none" stroke="#25728C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>
           ${S.porte.some(id => (S.accPos || {})[S.compagnon + ':' + id]) ? '<button class="pastille" data-act="replacerAcc" style="position:absolute;left:10px;bottom:10px;font-size:13px;padding:6px 12px;color:#25728C">Remettre en place</button>' : ''}</div>
         <div class="grille">${D.accessoires.map(a => tuile('acc', a)).join('')}</div>`
      : `<div class="decor-tete">
           <div class="scene-mini" aria-label="Aperçu de ton écran d’accueil"><div class="scene" style="left:0;transform:scale(.4206);transform-origin:0 0">${sceneHTML()}</div></div>
           <div class="decor-aide"><h2 class="h3">Mon écran</h2><p class="petit" style="margin:6px 0 14px">Glisse les objets avec ton doigt pour les placer où tu veux. Agrandis l’écran pour changer leur taille.</p>
             <button class="btn secondaire petit" style="width:100%" data-act="agrandir"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>Agrandir</button>
             ${Object.keys(S.positions).length || Object.keys(S.tailles).length ? '<button class="btn lien petit" style="width:100%" data-act="replacer">Remettre en place</button>' : ''}
             <p class="petit" style="margin-top:10px">${S.objetsPlaces.length} objet${S.objetsPlaces.length > 1 ? 's' : ''} sur 4</p></div>
         </div>
         <p class="etiquette" style="margin-top:4px">Paysages · le ciel suit l’heure</p>
         <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${D.lieux.map(l => tuile('lieu', l).replace('class="tuile', 'style="min-height:0;padding:6px" class="tuile')).join('')}</div>
         <p class="etiquette">Objets</p><div class="grille">${D.objets.map(o => tuile('obj', o)).join('')}</div>`;
    return `<section class="screen ciel" aria-label="Personnaliser">${statut()}
      <div class="entete" style="justify-content:space-between">${sel}${etoilesPill()}</div>
      <div class="scroll">${contenu}</div>${nav('perso')}
      ${vue === 'foxy' && ui.grandAcc ? (() => { const sel = D.accessoires.find(a => a.id === ui.accSel && S.porte.includes(a.id)); return `<div class="editeur" role="dialog" aria-label="Placer mes accessoires" style="background:linear-gradient(#8DD6EE,#E2F3FA)">
        <img class="decor" src="${decorSrc()}" alt="" style="opacity:.55">
        <p class="pastille editeur-aide">Glisse les accessoires sur ${esc(comp().nom)} !</p>
        <div style="position:absolute;left:50%;top:150px;width:330px;transform:translateX(-50%)">${compagnonHTML({ neutre: true, edit: true })}</div>
        <div class="actions-bas" style="bottom:36px">
          ${sel ? `<div class="carte" style="display:flex;align-items:center;gap:10px;padding:10px 14px"><img src="assets/objet/${sel.id}.svg" alt="" width="36"><b style="flex:1;font-weight:600">${sel.nom}</b><button class="btn-moins" style="width:48px;height:48px;font-size:26px" data-act="accTaille" data-arg="-1" aria-label="Plus petit">–</button><button class="btn-moins" style="width:48px;height:48px;font-size:26px" data-act="accTaille" data-arg="1" aria-label="Plus grand">+</button></div>` : '<p class="pastille" style="justify-self:center;font-size:13px">Touche un accessoire pour changer sa taille</p>'}
          <button class="btn principal" data-act="fermerGrandAcc">Terminé</button></div></div>`; })() : ''}
      ${vue === 'decor' && ui.grand ? `<div class="editeur" role="dialog" aria-label="Placer mes objets">
        <div class="scene" style="transform:translateX(-50%) scale(${Math.min(1, (stage.offsetHeight || 926) / 926)})">${sceneHTML()}</div>
        <p class="pastille editeur-aide">Glisse les objets où tu veux !</p>
        <div class="actions-bas" style="bottom:36px">${(() => { const o = D.objets.find(x => x.id === ui.objSel && S.objetsPlaces.includes(x.id)); return o
          ? `<div class="carte" style="display:flex;align-items:center;gap:10px;padding:10px 14px"><img src="assets/objet/${o.id}.svg" alt="" width="36"><b style="flex:1;font-weight:600">${o.nom}</b><button class="btn-moins" style="width:48px;height:48px;font-size:26px" data-act="objTaille" data-arg="-1" aria-label="Plus petit">–</button><button class="btn-moins" style="width:48px;height:48px;font-size:26px" data-act="objTaille" data-arg="1" aria-label="Plus grand">+</button></div>`
          : '<p class="pastille" style="justify-self:center;font-size:13px">Touche un objet pour changer sa taille</p>'; })()}
          <button class="btn principal" data-act="fermerGrand">Terminé</button></div></div>` : ''}</section>`;
  };

  /* 9.1 Mon profil et réglages */
  E.profil = () => {
    const bascule = (cle, label, sous) => `<div class="ligne"><div class="grow"><div class="txt">${label}</div>${sous ? `<div class="petit">${sous}</div>` : ''}</div>
      <button class="bascule" role="switch" aria-checked="${!!S[cle]}" aria-label="${label}" data-act="bascule" data-arg="${cle}"></button></div>`;
    const etats = [['zone', 'Dans la zone'], ['bas', 'Bas'], ['haut', 'Haut'], ['tresHaut', 'Très haut'], ['urgence', 'Urgence basse'], ['attente', 'Pas de lecture'], ['pompe', 'Pompe déconnectée'], ['aide', 'Appel suggéré']];
    return `<section class="screen ciel" aria-labelledby="t-pf">${statut()}${entete('Mon profil', { sansRetour: true, droite: etoilesPill() })}
      <div class="scroll">
        <div class="carte" style="display:flex;gap:14px;align-items:center">
          <div style="width:72px;height:72px;border-radius:50%;background:${comp().fond};overflow:hidden;display:grid;place-items:start center;flex:none"><img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:120px;max-width:none;margin-top:4px"></div>
          <div><h2 class="h3">${P()} et ${esc(comp().nom)}</h2><p class="petit">${esc(S.profil.age)} · ensemble depuis 12 jours</p>
          <div style="display:flex;gap:6px;margin-top:8px">${['courage', 'serie-de-3', 'chasseur'].map(b => `<img src="assets/badge/${b}.svg" alt="Badge ${b}" width="34" style="${S.badges.includes(b) ? '' : 'filter:grayscale(1);opacity:.4'}">`).join('')}</div></div>
        </div>
        <p class="etiquette">Mon compagnon</p>
        <div class="carte"><button class="ligne" style="width:100%;text-align:left" data-act="changerComp"><div class="grow"><div class="txt">Changer de compagnon</div><div class="petit">${esc(comp().nom)}, ${comp().espece}</div></div><span class="chevron">›</span></button></div>
        <p class="etiquette">Mon capteur</p>
        <div class="carte"><button class="ligne" style="width:100%;text-align:left" data-go="capteur"><div class="grow"><div class="txt">Mon capteur</div><div class="petit">${esc(S.profil.capteur)} · encore 1 jour</div></div><span class="chevron">›</span></button></div>
        <p class="etiquette">Sons et affichage</p>
        <div class="carte">${bascule('sons', 'Voix et sons de ' + comp().nom)}${bascule('vibrations', 'Vibrations')}${bascule('cielAuto', 'Ciel selon l’heure', 'Jour, soir, nuit')}${bascule('grandTexte', 'Texte plus grand')}</div>
        <p class="etiquette">Démo · simuler la glycémie</p>
        <div class="carte"><p class="petit" style="margin-bottom:10px">Pour présenter le projet : choisis un état et retourne à l’accueil.</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${etats.map(([id, l]) => `<button class="chip ${S.etat === id ? 'actif' : ''}" style="border:2px solid #CDEAF4" data-act="etat" data-arg="${id}" aria-pressed="${S.etat === id}">${l}</button>`).join('')}</div>
          <p class="petit" style="margin:14px 0 8px">Autres écrans à montrer :</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px"><button class="chip" style="border:2px solid #CDEAF4" data-go="defiManque">Défi manqué</button><button class="chip" style="border:2px solid #CDEAF4" data-go="alerteParent">Alerte reçue par le parent</button><button class="chip" style="border:2px solid #CDEAF4" data-go="vueProche">Vue proche aidant</button></div></div>
        <p class="etiquette">Adultes</p>
        <div class="carte">
          <button class="ligne" style="width:100%;text-align:left" data-go="parentCode"><span style="width:20px;color:#5E6A72">${I.cadenas}</span><div class="grow"><div class="txt">Espace parent</div><div class="petit">Alertes, appareils, proches</div></div><span class="chevron">›</span></button>
          <button class="ligne" style="width:100%;text-align:left" data-act="reinit"><div class="grow"><div class="txt">Recommencer la démo</div><div class="petit">Efface les choix sur cet appareil</div></div><span class="chevron">›</span></button>
        </div>
      </div>${nav('profil')}</section>`;
  };

  /* 9.3 Code parent */
  E.parentCode = () => {
    const code = ui.code || '';
    return `<section class="screen ciel" aria-labelledby="t-pc">${statut()}${entete('')}
      <div style="text-align:center;padding:0 24px">
        <h1 id="t-pc" class="h1">Espace parent</h1><p class="txt">Entre le code à 4 chiffres (démo : 1234)</p>
        <div style="display:flex;gap:16px;justify-content:center;margin:20px 0" aria-live="polite" aria-label="${code.length} chiffres entrés">${[0, 1, 2, 3].map(k => `<span style="width:58px;height:64px;border-radius:16px;background:#fff;display:grid;place-items:center;font-size:28px">${k < code.length ? '•' : ''}</span>`).join('')}</div>
        <div style="display:grid;grid-template-columns:repeat(3,80px);gap:14px 24px;justify-content:center">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => k ? `<button data-act="chiffre" data-arg="${k}" aria-label="${k === '⌫' ? 'Effacer' : k}" style="width:80px;height:80px;border-radius:50%;background:#fff;font-size:28px;font-weight:600">${k}</button>` : '<span></span>').join('')}</div>
      </div></section>`;
  };

  /* ==========================================================
     ÉCRANS AJOUTÉS : inscription, capteur, défis, espace parent
     ========================================================== */
  const P = () => esc((S.profil && S.profil.prenom) || 'Léo');
  const champ = (cle, label, val, type = 'text') => `<label class="champ"><span>${label}</span><input data-cle="${cle}" type="${type}" value="${esc(val)}" autocomplete="off"></label>`;
  const choixListe = (cle, label, val, opts) => `<label class="champ"><span>${label}</span><select data-cle="${cle}">${opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
  const radio = (on, cls = '') => `<span class="radio ${cls} ${on ? 'on' : ''}" aria-hidden="true">${on ? I.coche : ''}</span>`;
  const reglePar = `<span class="regle">${I.cadenas} Réglé par le parent</span>`;
  const IC = {
    parent: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="15" cy="12" r="6" fill="#25728C"/><path d="M4 33c1-7 5.5-10 11-10s10 3 11 10z" fill="#25728C"/><circle cx="29" cy="19" r="4" fill="#32A3C9"/><path d="M22 34c.6-4.5 3.4-7 7-7s6.4 2.5 7 7z" fill="#32A3C9"/></svg>',
    alerte: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 3 22 20H2z" fill="#D12F2F" stroke="#D12F2F" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="#fff"/></svg>',
    lien: '<path d="M70 104a22 22 0 0 1 0-31l10-10a22 22 0 0 1 31 0M126 112a22 22 0 0 1 0 31l-10 10a22 22 0 0 1-31 0M84 136l28-28" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M78 80l40 40" stroke="#fff" stroke-width="0"/>',
    telB: '<path d="M78 74c-6 0-12 5-12 13 1 39 33 71 72 72 8 0 13-6 13-12v-12c0-3-2-6-5-6l-16-4c-3-1-6 0-7 3l-5 7c-12-5-21-15-26-26l7-5c2-2 3-5 3-7l-5-16c-1-3-3-5-6-5z" fill="#fff"/>',
    cocheB: '<path d="M74 118l18 18 34-38" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    bluetooth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg>',
    cloche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></svg>',
    histo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-7 4 4 8-9"/></svg>',
    proches: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c2.6 0 4.4 1.4 5 4"/></svg>',
    sortie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4H6v16h8M10 12h11M17 8l4 4-4 4"/></svg>',
    tampon: '<svg viewBox="0 0 36 36" width="36" height="36"><rect x="4" y="9" width="28" height="18" rx="4" fill="#fff"/><path d="M12 18h12M18 12v12" stroke="#32A3C9" stroke-width="3" stroke-linecap="round"/></svg>',
    goutte: '<svg viewBox="0 0 24 38" width="24" height="38"><path d="M12 2C8 10 2 17 2 25a10 10 0 0 0 20 0c0-8-6-15-10-23z" fill="#fff"/></svg>',
    boite: '<svg viewBox="0 0 24 32" width="24" height="32"><rect x="2" y="8" width="20" height="22" rx="5" fill="#fff"/><rect x="7" y="2" width="10" height="8" rx="3" fill="#fff"/></svg>',
    raccrocher: '<svg viewBox="0 0 40 20" width="40" height="20"><path d="M2 12c10-10 26-10 36 0l-4 6-7-3v-5c-4-2-10-2-14 0v5l-7 3z" fill="#fff"/></svg>'
  };
  const applicateur = (w = 78) => `<svg viewBox="0 0 78 106" width="${w}" aria-hidden="true"><rect x="8" y="22" width="62" height="80" rx="18" fill="#fff" stroke="#25728C" stroke-width="3"/><rect x="24" y="4" width="30" height="24" rx="8" fill="#FE9732" stroke="#25728C" stroke-width="3"/><path d="M20 70h38M20 82h38" stroke="#CDEBF5" stroke-width="3" stroke-linecap="round"/></svg>`;
  const bulleSpeciale = (couleur, contenu) => `<div class="face icone"><svg viewBox="0 0 240 243" aria-hidden="true"><circle cx="120" cy="112" r="89" fill="#fff"/><circle cx="58" cy="214" r="18" fill="#fff"/><circle cx="34" cy="232" r="11" fill="#fff"/><circle cx="120" cy="112" r="82" fill="${couleur}"/><circle cx="120" cy="112" r="74" fill="none" stroke="#fff" stroke-width="2"/><circle cx="58" cy="214" r="13" fill="${couleur}"/><circle cx="34" cy="232" r="7" fill="${couleur}"/><g transform="translate(-2,-4)">${contenu}</g></svg></div>`;

  /* 1.2 Connexion */
  E.connexion = () => `<section class="screen ciel" aria-labelledby="t-cx">${statut()}
      <div class="scroll" style="padding-top:20px">
        <img src="assets/compagnon/renard.svg" alt="" style="width:130px;margin:0 auto">
        <h1 id="t-cx" class="h1 centre" style="margin-top:14px">Bienvenue !</h1>
        <p class="txt centre" style="color:var(--texte-2);margin-top:6px">Connecte-toi pour configurer l’app.</p>
        ${champ('courriel', 'Nom d’utilisateur', 'parent.leo@courriel.com', 'email')}
        ${champ('mdp', 'Mot de passe', 'dexcomkids', 'password')}
        <button class="btn lien petit" style="margin:6px 0 0 -4px;padding:0 8px" data-act="msg" data-arg="Démo : un lien serait envoyé par courriel.">Mot de passe oublié ?</button>
        <div style="display:grid;gap:14px;margin-top:40px"><button class="btn principal" data-go="qui">Se connecter</button><button class="btn secondaire" data-go="qui">Créer un compte</button></div>
      </div></section>`;

  /* 1.3 Qui utilise le téléphone */
  E.qui = () => {
    const r = ui.role || 'parent';
    const carte = (id, titre, sous, ic) => `<button class="option ${r === id ? 'on' : ''}" role="radio" aria-checked="${r === id}" data-act="role" data-arg="${id}" style="padding:28px 20px;margin-top:${id === 'enfant' ? 44 : 0}px">
        <span style="width:64px;height:64px;border-radius:50%;background:${id === 'parent' ? '#E2F3FA' : '#FFECDB'};display:grid;place-items:${id === 'parent' ? 'center' : 'start center'};overflow:hidden;flex:none">${ic}</span>
        <span class="grow"><b>${titre}</b><span class="petit">${sous}</span></span></button>`;
    return `<section class="screen ciel" aria-labelledby="t-qui">${statut()}
      <div class="scroll" style="padding-top:46px">
        <h1 id="t-qui" class="h1 centre">Qui utilise<br>le téléphone ?</h1>
        <div role="radiogroup" aria-label="Qui utilise le téléphone" style="margin-top:84px">
          ${carte('parent', 'Je suis le parent', 'Je configure les alertes, les appareils et les proches.', IC.parent)}
          ${carte('enfant', 'Je suis l’enfant', 'Je choisis mon compagnon et je commence à jouer !', `<img src="assets/compagnon/renard.svg" alt="" style="width:109px;max-width:none;margin:4px 0 0 -2px">`)}
        </div>
        <div class="info" style="margin-top:54px">Le parent configure d’abord l’app (diabète, alertes, proches). Ensuite, il donne le téléphone à l’enfant.</div>
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="choixRole">Suite</button></div></section>`;
  };

  /* 1.4 Profil de l’enfant */
  E.profilEnfant = () => { const p = S.profil; return `<section class="screen ciel" aria-labelledby="t-pe">${statut()}${entete('Profil de l’enfant', { t: 30 })}
      <div class="scroll" style="padding-top:4px">
        ${champ('prenom', 'Prénom', p.prenom)}${champ('nom', 'Nom', p.nom)}
        ${choixListe('age', 'Âge', p.age, ['7 ans', '8 ans', '9 ans', '10 ans', '11 ans', '12 ans'])}
        ${choixListe('diabete', 'Type de diabète', p.diabete, ['Type 1', 'Type 2', 'Autre'])}
        ${choixListe('capteur', 'Capteur', p.capteur, ['Dexcom G7', 'Dexcom G6', 'Dexcom ONE+'])}
        <div class="info" style="margin-top:36px">Rempli par le parent. Aucune dose n’est calculée par l’app.</div>
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="suite" data-arg="lecture">Suite</button></div></section>`; };

  /* 1.5 Niveau de lecture */
  E.lecture = () => {
    const v = S.lecture;
    const opt = (id, age, titre, ex) => `<p class="etiquette" style="margin-top:${id === 'simple' ? 22 : 28}px">${age}</p>
        <button class="option haut ${v === id ? 'on' : ''}" role="radio" aria-checked="${v === id}" data-act="lecture" data-arg="${id}"><span class="grow"><b>${titre}</b><span class="exemple">${ex}</span></span>${radio(v === id)}</button>`;
    return `<section class="screen ciel" aria-labelledby="t-lc">${statut()}${entete('Niveau de lecture', { t: 30 })}
      <div class="scroll" style="padding-top:8px">
        <p class="txt" style="color:var(--texte-2)">Choisis selon l’âge de l’enfant et sa facilité à lire. Tu pourras changer plus tard.</p>
        <div role="radiogroup" aria-label="Niveau de lecture">
        ${opt('simple', '7 à 9 ans', 'Icônes et mots simples', '« J’ai faim ! Mange une collation. »')}
        ${opt('chiffres', '10 à 12 ans', 'Icônes, mots et chiffres', '« Bas · 3,6 mmol/L, en baisse. Prends 15 g de sucre. »')}</div>
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="suite" data-arg="alertesInit">Suite</button></div></section>`;
  };

  /* 1.6 Alertes */
  E.alertesInit = () => {
    const v = S.niveauAlertes;
    const opt = (id, t, s) => `<button class="option ${v === id ? 'on' : ''}" role="radio" aria-checked="${v === id}" data-act="niveauAlertes" data-arg="${id}" style="padding:16px 20px"><span class="grow"><b>${t}</b><span class="petit">${s}</span></span>${radio(v === id)}</button>`;
    return `<section class="screen ciel" aria-labelledby="t-al1">${statut()}${entete('Alertes', { t: 30 })}
      <div class="scroll" style="padding-top:8px">
        <p class="txt" style="color:var(--texte-2);margin-bottom:18px">Choisis quand l’app doit prévenir l’enfant et ses proches.</p>
        <div role="radiogroup" aria-label="Niveau d’alertes">
        ${opt('discretes', 'Discrètes', 'Seulement si c’est trop haut ou trop bas.')}
        ${opt('attentives', 'Attentives', 'Dès que ça change un peu.')}
        ${opt('tres', 'Très attentives', 'Dès que ça monte ou descend vite.')}</div>
        <div class="info rouge" style="margin-top:24px">${IC.alerte}<span>L’alerte d’urgence basse est toujours active, peu importe le choix.</span></div>
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="suite" data-arg="proche">Suite</button></div></section>`;
  };

  /* 1.7 Ajouter un proche */
  E.proche = () => `<section class="screen ciel" aria-labelledby="t-pr">${statut()}${entete('Ajouter un proche', { t: 30 })}
      <div class="scroll" style="padding-top:8px;padding-bottom:180px">
        <p class="txt" style="color:var(--texte-2)">Cette personne recevra les alertes de ${P()}.</p>
        ${champ('p-prenom', 'Prénom', 'Sophie')}${champ('p-nom', 'Nom', 'Tremblay')}
        ${champ('p-courriel', 'Courriel', 'sophie.t@courriel.com', 'email')}${champ('p-tel', 'Téléphone', '514 555-0134', 'tel')}
        ${choixListe('p-lien', 'Lien avec l’enfant', 'Maman', ['Maman', 'Papa', 'Grand-parent', 'Enseignant·e', 'Gardien·ne', 'Autre'])}
      </div>
      <div class="actions-bas" style="bottom:56px;gap:4px"><button class="btn principal" data-act="inviter">Envoyer l’invitation</button><button class="btn lien" data-act="apresProche">Plus tard</button></div></section>`;

  /* 1.8 Configuration en cours */
  E.config = () => {
    setTimeout(() => { if (route.name === 'config') aller('donne', null, true); }, 2800);
    return `<section class="screen ciel" aria-labelledby="t-cf" aria-busy="true">${statut()}
      <div style="padding:206px 24px 0;text-align:center">
        <img src="assets/compagnon/renard.svg" alt="" style="width:168px;margin:0 auto">
        <h1 id="t-cf" class="h1" style="margin-top:30px">On prépare<br>ton app…</h1>
        <div class="barre barre-anim" style="width:260px;margin:24px auto 0;background:#fff" role="progressbar" aria-label="Préparation"><span style="background:#25728C"></span></div>
        <p class="petit" style="margin-top:16px">Foxy met son capteur…</p>
      </div></section>`;
  };

  /* 1.9 Donne le téléphone */
  E.donne = () => `<section class="screen ciel" aria-labelledby="t-dn">${statut()}
      <div class="scroll" style="padding-top:56px;text-align:center">
        <h1 id="t-dn" class="h1">Tout est prêt !</h1>
        <p class="txt" style="color:var(--texte-2);margin:12px 20px 0">Le profil de ${P()} est configuré. Donne-lui maintenant le téléphone pour qu’il rencontre son compagnon.</p>
        <div style="width:280px;height:280px;border-radius:50%;background:#fff;margin:38px auto 0;display:grid;place-items:center">
          <svg viewBox="0 0 200 160" width="200" aria-hidden="true"><rect x="70" y="10" width="64" height="120" rx="12" fill="#E2F3FA" stroke="#25728C" stroke-width="3"/><rect x="92" y="18" width="20" height="4" rx="2" fill="#25728C"/><circle cx="102" cy="62" r="16" fill="#FE9732"/><circle cx="96" cy="59" r="2.5" fill="#381706"/><circle cx="108" cy="59" r="2.5" fill="#381706"/><path d="M96 69q6 4 12 0" stroke="#381706" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 128c10-14 26-18 46-12M56 112c6 6 8 14 6 22" stroke="#32A3C9" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M182 134c-12-12-28-14-42-8" stroke="#FE9732" stroke-width="5" fill="none" stroke-linecap="round"/></svg>
        </div>
        <div class="info" style="margin-top:40px;text-align:left">Vous pourrez revenir aux réglages avec votre code parent, dans Profil.</div>
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="finInscription">Je suis ${P()} !</button></div></section>`;

  /* 4.7 Alerte reçue par le parent */
  E.alerteParent = () => `<section class="screen" style="background:#14232B;color:#fff" aria-labelledby="t-ap">${statut(true)}
      <div style="padding:56px 16px 0">
        <p class="centre" style="font-size:40px;font-weight:700;margin:0">22:41</p>
        <p class="centre" style="font-size:18px;margin:4px 0 0">vendredi 23 octobre</p>
        <div class="notif" style="margin-top:66px" role="alert">
          <div style="display:flex;gap:12px;align-items:center"><span class="app-ic" style="background:#8E1B1B">${IC.alerte.replace('fill="#D12F2F" stroke="#D12F2F"', 'fill="#fff" stroke="#fff"').replace(/stroke="#fff" stroke-width="2.2"/, 'stroke="#8E1B1B" stroke-width="2.2"').replace('fill="#fff"/></svg>', 'fill="#8E1B1B"/></svg>')}</span><span class="petit">DEXCOM KIDS · maintenant</span></div>
          <h1 id="t-ap" style="font-size:18px;font-weight:600;color:#8E1B1B;margin:16px 0 4px">Urgence basse : ${P()} à 2,9 mmol/L</h1>
          <p class="txt">La glycémie descend vite. Foxy lui a demandé d’aller voir un adulte.</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
          <button class="btn" style="background:#8E1B1B;color:#fff;min-height:52px" data-act="appeler" data-arg="${P()}">Appeler ${P()}</button>
          <button class="btn" style="background:#fff;color:#25728C;min-height:52px" data-go="vueProche">Voir l’app</button></div>
        <div class="notif" style="margin-top:26px">
          <div style="display:flex;gap:12px;align-items:center"><span class="app-ic" style="background:#FE9732">${I.etoile.replace('fill="#FE9732"', 'fill="#fff"').replace('<svg ', '<svg width="22" ')}</span><span class="petit">DEXCOM KIDS · 18 h 02</span></div>
          <p class="txt" style="margin-top:14px">${P()} a fait son bolus avant le dîner (+2 étoiles).</p>
        </div>
      </div>
      <button class="btn-rond" data-act="retour" aria-label="Retour" style="position:absolute;left:24px;top:52px">${I.retour}</button>
      <p class="centre" style="position:absolute;left:32px;right:32px;bottom:70px;font-size:13px;margin:0">Seules les alertes urgentes sonnent. Les autres arrivent en silence ou dans le résumé.</p></section>`;

  /* 6.5 Défi manqué */
  E.defiManque = () => `<section class="screen ciel" aria-labelledby="t-dm"><img class="decor" src="${decorSrc('prairie')}" alt="">${statut()}
      <div style="position:relative;padding:28px 24px 0;text-align:center">
        <h1 id="t-dm" class="h1" style="font-size:40px;font-weight:700">Pas grave !</h1>
        <p class="txt" style="margin:8px 20px 0">Hier, le défi bolus n’a pas été coché. On réessaie aujourd’hui ?</p>
        <img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:214px;margin:14px auto 0">
        <div class="carte" style="text-align:left;margin-top:22px;border-radius:20px"><h2 class="h3">Ce qui ne change pas</h2><p class="txt" style="color:var(--texte-2);margin-top:4px">Tes ${S.etoiles} étoiles et tes récompenses restent. Ta série recommence aujourd’hui.</p></div>
      </div>
      <div class="actions-bas" style="bottom:114px"><button class="btn principal" data-go="defi" data-arg="bolus">Reprendre le défi</button><button class="btn" style="background:#fff;color:#25728C" data-go="choisirDefis">Changer de défi</button></div></section>`;

  /* 6.6 Devine ta flèche */
  E.devine = () => {
    const v = ui.devine2 || 'doucement';
    const opt = (id, l, dir) => `<button class="option ${v === id ? 'on' : ''}" role="radio" aria-checked="${v === id}" data-act="devineChoix" data-arg="${id}" style="padding:12px 20px;border-radius:20px;margin-top:12px">
        <span style="width:44px;height:44px;border-radius:50%;background:#25728C;display:grid;place-items:center;flex:none">${fleche(dir).replace('width="34" height="34"', 'width="28" height="28"')}</span><span class="grow" style="font-size:18px">${l}</span>${radio(v === id, 'petit-r')}</button>`;
    return `<section class="screen ciel" aria-labelledby="t-dv">${statut()}${entete('Devine ta flèche', { t: 30 })}
      <div class="scroll" style="padding-top:8px">
        <div class="carte" style="display:flex;gap:16px;align-items:center;border-radius:24px;padding:18px">
          <div style="width:110px;height:110px;border-radius:18px;background:#FFF6EE;display:grid;place-items:center;flex:none"><img src="assets/aliment/pates.svg" alt="" width="90"></div>
          <div><h2 class="h3">Souper : pâtes</h2><span class="pastille" style="background:#E2F3FA;color:#25728C;font-size:13px;padding:4px 12px;margin:8px 0">Énergie longue</span><p class="petit">Attrapé à 18 h 00</p></div>
        </div>
        <p style="font-size:18px;margin:24px 0 8px">Selon toi, après ce repas, ta flèche va…</p>
        <div role="radiogroup" aria-label="Ta prédiction">${opt('vite', 'Monter vite', 'haut')}${opt('doucement', 'Monter doucement', 'haut-droite')}${opt('stable', 'Rester stable', 'droite')}</div>
        <button class="btn principal" style="margin-top:32px" data-act="devineValider">Je choisis !</button>
        <p class="petit centre" style="margin:14px 20px 0">On regarde ensemble dans 2 heures. Si tu as bien deviné : +1 étoile.</p>
      </div></section>`;
  };

  /* 6.7 Choisir mes défis */
  E.choisirDefis = () => {
    const sel = S.defisChoisis;
    const groupes = [['Bolus', [['bolus', 'Bolus avant le dîner'], ['bolus-dej', 'Bolus avant le déjeuner']]],
      ['Routine', [['sac', 'Collation dans mon sac'], ['dodo', 'Flèche avant le dodo'], ['capteur', `Changer mon capteur avec ${esc(comp().nom)}`, 'Proposé par maman']]],
      ['Nourriture', [['jardin', 'Attrape 3 aliments Jardin'], ['devine', 'Devine ta flèche 2 fois']]]];
    return `<section class="screen ciel" aria-labelledby="t-cd">${statut()}${entete('Mes défis', { t: 30 })}
      <div class="scroll" style="padding-top:4px">
        <p class="txt" style="color:var(--texte-2)">Choisis 3 défis pour la semaine. Tu pourras en changer lundi prochain.</p>
        ${groupes.map(([g, l]) => `<p class="etiquette" style="margin-top:18px">${g}</p>${l.map(([id, t, tag]) => { const on = sel.includes(id); return `<button class="coche-l ${on ? 'on' : ''}" role="checkbox" aria-checked="${on}" data-act="cocheDefi" data-arg="${id}"><span class="case ${on ? 'on' : ''}">${on ? I.coche : ''}</span><span style="flex:1">${t}</span>${tag ? `<span class="pastille" style="background:#FFECDB;color:#C9561C;font-size:13px;padding:4px 10px;font-weight:400">${tag}</span>` : ''}</button>`; }).join('')}`).join('')}
      </div>
      <div class="actions-bas" style="bottom:56px"><button class="btn principal" data-act="validerDefis" ${sel.length === 3 ? '' : 'disabled style="opacity:.5"'}>C’est parti ! (${sel.length}/3)</button></div></section>`;
  };

  /* 6.8 Résumé de la semaine */
  E.semaine = () => `<section class="screen ciel" aria-labelledby="t-sm">${statut()}${entete('Ma semaine', { t: 30 })}
      <div class="scroll" style="padding-top:0">
        <p class="petit" style="margin:0 0 0 60px">du 19 au 25 octobre</p>
        <div style="display:flex;align-items:center;gap:0;margin-top:14px"><img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:161px;margin-left:-4px"><p class="dialogue" style="position:relative;left:0;top:0;width:200px">Quelle semaine ! Tu as relevé 5 défis sur 7.</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 8px;margin-top:20px">
          ${[['5 / 7', 'défis réussis', '#25728C'], ['14', 'étoiles gagnées', '#F07837'], ['12', 'aliments attrapés', '#447C08'], ['3', 'nouvelles cartes', '#32A3C9']].map(([a, b, c]) => `<div class="stat"><b style="color:${c}">${a}</b><span class="petit">${b}</span></div>`).join('')}
        </div>
        <div class="info chaud" style="margin-top:24px"><div style="color:#C9561C;font-size:14px;font-weight:500;margin-bottom:6px">ASTUCE POUR LA SEMAINE PROCHAINE</div>Essaie d’attraper ta collation avant le soccer de mardi.</div>
        <button class="btn principal" style="margin-top:22px" data-go="choisirDefis">Choisir mes défis</button>
        <p class="petit centre" style="margin:14px 20px 0">Le résumé parle seulement de tes habitudes, jamais de ta glycémie.</p>
      </div></section>`;

  /* 8.1 Mon capteur */
  E.capteur = () => `<section class="screen ciel" aria-labelledby="t-cp">${statut()}${entete('Mon capteur', { t: 30 })}
      <div class="scroll" style="padding-top:4px;text-align:center">
        <div style="width:166px;height:166px;border-radius:50%;background:#CDEAF4;margin:0 auto;display:grid;place-items:center"><svg viewBox="0 0 150 150" width="150" aria-hidden="true"><circle cx="75" cy="75" r="72" fill="#fff"/><circle cx="75" cy="75" r="58" fill="#F3F6F8" stroke="#CFD6DB" stroke-width="2"/><circle cx="75" cy="75" r="22" fill="#B5B5B5"/></svg></div>
        <h1 style="font-size:24px;font-weight:600;margin:12px 0 0">Encore 1 jour</h1>
        <div class="barre" style="width:300px;margin:16px auto 0" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="9" aria-label="Jour 9 sur 10"><span style="width:90%"></span></div>
        <p class="petit" style="margin-top:8px">Jour 9 sur 10</p>
        <div style="display:flex;align-items:center;margin-top:20px;text-align:left"><img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:176px;flex:none"><p class="dialogue" style="position:relative;left:-16px;top:-30px;width:220px">Mon capteur aussi est presque fini. On les change ensemble ?</p></div>
        <div style="display:grid;gap:12px;margin-top:12px"><button class="btn principal" data-go="poser" data-arg="1">Changer avec ${esc(comp().nom)}</button><button class="btn secondaire" data-act="rappel">Me le rappeler demain</button></div>
      </div></section>`;

  /* 8.2 à 8.4 Changer mon capteur */
  E.poser = () => {
    const n = +(route.arg || 1);
    const barre = `<div class="etapes" aria-hidden="true">${[1, 2, 3].map(k => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</div><p class="petit">Étape ${n} sur 3</p>`;
    let corps = '', bouton = 'Suivant';
    if (n === 1) corps = `<h2 class="h2" style="margin-top:14px">Choisis l’endroit</h2>
        <div class="carte" style="position:relative;border-radius:28px;height:350px;margin-top:12px;padding:0">
          <svg viewBox="0 0 213 330" width="213" style="position:absolute;left:80px;top:10px" aria-label="Silhouette : arrière du bras ou bas du ventre"><circle cx="107" cy="49" r="37" fill="#CDEAF4"/><rect x="43" y="89" width="128" height="132" rx="40" fill="#CDEAF4"/><rect x="20" y="101" width="48" height="107" rx="24" fill="#CDEAF4"/><rect x="146" y="101" width="48" height="107" rx="24" fill="#CDEAF4"/><rect x="58" y="210" width="93" height="110" rx="26" fill="#CDEAF4"/><circle cx="44" cy="140" r="9" fill="#FE9732"/><circle cx="128" cy="190" r="9" fill="#FE9732"/></svg>
          <span class="pastille" style="position:absolute;left:0;top:104px;background:#F2FAFD;font-size:13px;font-weight:400">Arrière du bras</span>
          <span class="pastille" style="position:absolute;right:0;top:188px;background:#F2FAFD;font-size:13px;font-weight:400">Bas du ventre</span></div>
        <div class="info" style="font-size:16px;color:#14232B;margin-top:16px">Change de côté à chaque fois. Demande à un adulte de t’aider.</div>`;
    if (n === 2) corps = `<h2 class="h2" style="margin-top:14px">Prépare ta peau et l’applicateur</h2>
        ${[[IC.tampon, 'Nettoie la peau', 'avec un tampon d’alcool'], [IC.goutte, 'Laisse sécher', 'quelques secondes'], [IC.boite, 'Ouvre l’applicateur', 'le capteur est déjà dedans']].map(([ic, t, s], k) => `<div class="carte" style="display:flex;gap:16px;align-items:center;border-radius:20px;margin-top:${k ? 12 : 22}px"><span style="width:56px;height:56px;border-radius:50%;background:#32A3C9;display:grid;place-items:center;flex:none">${ic}</span><div><h3 class="h3">${t}</h3><p class="petit">${s}</p></div></div>`).join('')}
        <div class="centre" style="margin-top:4px">${applicateur()}<p class="petit">L’applicateur</p></div>`;
    if (n === 3) { bouton = 'C’est posé !'; corps = `<h2 class="h1" style="margin-top:14px">1, 2, 3… clic !</h2>
        <p class="txt" style="margin-top:8px">Pose l’applicateur sur ta peau et appuie sur le bouton. ${esc(comp().nom)} le fait en même temps que toi !</p>
        <div class="carte" style="display:flex;align-items:flex-end;justify-content:space-between;border-radius:28px;margin-top:22px;height:266px;padding:20px 0 0 40px;overflow:hidden">${applicateur(109)}<img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:200px;margin-bottom:-24px"></div>
        <p class="petit centre" style="margin-top:56px">Ça pique un tout petit peu, puis c’est fini.</p>`; }
    return `<section class="screen ciel" aria-labelledby="t-po">${statut()}${entete('Changer mon capteur', { t: 24 })}
      <div class="scroll" style="padding-top:8px" id="t-po">${barre}${corps}</div>
      <div class="actions-bas" style="bottom:178px"><button class="btn principal" data-act="poserSuivant" data-arg="${n}">${bouton}</button></div></section>`;
  };

  /* 8.5 Le capteur se réveille */
  E.reveil = () => {
    clearInterval(ui.chrono2); ui.min = ui.min ?? 22;
    ui.chrono2 = setInterval(() => {
      if (route.name !== 'reveil') return clearInterval(ui.chrono2);
      ui.min -= 1; const el = document.getElementById('minR'); if (el) el.textContent = `${Math.max(ui.min, 0)} min`;
      const arc = document.getElementById('arcR'); if (arc) arc.setAttribute('stroke-dasharray', `${(22 - ui.min) / 22 * 503} 503`);
      if (ui.min <= 0) { clearInterval(ui.chrono2); ui = {}; actions.capteurPret(); }
    }, 220);
    const dodo = true;
    return `<section class="screen ciel" aria-labelledby="t-rvl"><img class="decor" src="${decorSrc('prairie')}" alt="">${statut()}
      <div style="position:relative;padding:20px 24px 0;text-align:center">
        <h1 id="t-rvl" class="h2">Ton capteur se réveille</h1>
        <div style="position:relative;width:200px;height:200px;margin:16px auto 0"><svg viewBox="0 0 200 200" width="200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#fff"/><circle cx="100" cy="100" r="80" fill="none" stroke="#CDEBF5" stroke-width="10"/><circle id="arcR" cx="100" cy="100" r="80" fill="none" stroke="#32A3C9" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 503" transform="rotate(-90 100 100)"/></svg>
          <div style="position:absolute;inset:0;display:grid;place-content:center"><b id="minR" style="font-size:24px;font-weight:600;color:#25728C">${ui.min} min</b><span class="petit">environ</span></div></div>
        <div style="position:relative;width:160px;margin:18px auto 0"><img src="assets/${dodo ? 'pose/' + poseDe('foxy-dodo') : 'compagnon/' + S.compagnon}.svg" alt="" style="width:160px"><span style="position:absolute;right:-90px;top:10px;font-size:24px;font-weight:600;color:#25728C">Z z z</span></div>
        <div class="carte" style="border-radius:20px;margin-top:20px"><p class="txt">« Je fais une petite sieste. Je te réveille quand c’est prêt ! »</p></div>
      </div>
      <div class="actions-bas" style="bottom:70px"><button class="btn secondaire" data-tab="perso">Décorer ma chambre en attendant</button></div></section>`;
  };

  /* 8.6 Capteur prêt */
  E.pret = () => `<section class="screen ciel" aria-labelledby="t-pt"><img class="decor" src="${decorSrc('prairie')}" alt="">${statut()}
      <div style="position:relative;padding:20px 24px 0;text-align:center">
        <h1 id="t-pt" class="h1">Mon capteur est prêt !</h1>
        <div style="width:229px;margin:44px auto 0">${compagnonHTML({ neutre: true })}</div>
        <div class="carte" style="display:flex;gap:22px;align-items:center;text-align:left;border-radius:24px;margin-top:20px"><img src="assets/badge/courage.svg" alt="" width="69"><div><div style="font-size:14px;font-weight:500;color:#C9561C">BADGE DÉBLOQUÉ</div><b class="h3" style="display:block">Courage</b><p class="petit">Tu as changé ton capteur avec ${esc(comp().nom)}.</p></div></div>
        <span class="pill-orange" style="margin-top:22px">${I.etoile.replace('fill="#FE9732"', 'fill="#fff"')}+3 étoiles</span>
      </div>
      <div class="actions-bas" style="bottom:120px"><button class="btn principal" data-act="accueil">Voir ma flèche</button></div></section>`;

  /* 9.4 Espace parent */
  E.parent = () => {
    const l = (ic, t, s, attr) => `<button class="menu-l" ${attr}><span class="ico">${ic}</span><span style="flex:1"><b>${t}</b>${s ? `<span class="petit">${s}</span>` : ''}</span><span class="chevron" style="font-size:24px;color:#5E6A72">›</span></button>`;
    return `<section class="screen ciel" aria-labelledby="t-pa">${statut()}${entete('Espace parent', { t: 30 })}
      <div class="scroll" style="padding-top:0">
        <span class="pastille" style="background:#E2F3FA;color:#25728C;font-size:13px;font-weight:400;margin:0 0 20px 60px">Mode parent activé</span>
        ${l(IC.bluetooth, 'Connecter un appareil', 'Pompe, montre', 'data-go="appareils"')}
        ${l(IC.cloche, `Alertes de ${P()}`, 'Seuils, heures calmes', 'data-go="alertesLeo"')}
        ${l(IC.histo, 'Résumé et historique', 'Journée, semaine', 'data-go="vueProche"')}
        ${l(IC.proches, 'Mes proches', '3 personnes', 'data-go="proches"')}
        ${l(IC.sortie, 'Quitter le mode parent', '', 'data-act="accueil"')}
      </div></section>`;
  };

  /* 9.5 Connecter un appareil */
  E.appareils = () => {
    const v = ui.app ?? 0;
    const noms = [`Pompe de ${P()}`, 'AirPods de Hugo', 'Montre de Hugo', 'BOSE Comfort', 'Pompe de Saskia', 'Wonderboom 2'];
    return `<section class="screen ciel" aria-labelledby="t-ca2">${statut()}${entete('Connecter un appareil', { t: 30 })}
      <div class="scroll" style="padding-top:8px">
        <p class="etiquette" style="margin-top:8px">Appareils trouvés</p>
        <div class="carte" role="radiogroup" aria-label="Appareils trouvés" style="border-radius:24px;padding:4px 20px">${noms.map((n, k) => `<button class="ligne" role="radio" aria-checked="${v === k}" data-act="appareil" data-arg="${k}" style="width:100%;text-align:left;padding:22px 0;font-size:18px;color:${v === k ? '#25728C' : '#14232B'}"><span style="width:24px;height:24px;border-radius:50%;border:2px solid ${v === k ? '#25728C' : '#14232B'};display:grid;place-items:center;flex:none">${v === k ? '<i style="width:12px;height:12px;border-radius:50%;background:#25728C"></i>' : ''}</span>${n}</button>`).join('')}</div>
        <button class="btn lien" style="margin-top:6px" data-act="msg" data-arg="Recherche en cours… (démo)">Rechercher encore…</button>
      </div>
      <div class="actions-bas" style="bottom:128px"><button class="btn principal" data-act="connecterApp">Connecter</button></div></section>`;
  };

  /* 9.6 / 9.7 Connexion à la pompe */
  E.connexionPompe = () => {
    setTimeout(() => { if (route.name === 'connexionPompe') { if (S.etat === 'pompe') { S.etat = 'zone'; save(); } aller('pompeOk', null, true); } }, 2200);
    return `<section class="screen ciel" aria-labelledby="t-cnp" aria-busy="true">${statut()}
      <div style="padding:256px 24px 0;text-align:center"><h1 id="t-cnp" class="h1">Connexion à<br>la pompe…</h1><div class="tourne" aria-hidden="true"></div><p class="txt" style="color:var(--texte-2);margin-top:26px">Garde le téléphone près de la pompe.</p></div></section>`;
  };
  E.pompeOk = () => `<section class="screen ciel" aria-labelledby="t-pok">${statut()}
      <div style="padding:276px 24px 0;text-align:center"><h1 id="t-pok" class="h1">Pompe connectée !</h1>
        <svg viewBox="0 0 120 120" width="120" style="margin:42px auto 0;display:block" aria-hidden="true"><circle cx="60" cy="60" r="58" fill="#447C08"/><path d="M36 62l16 16 32-34" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p class="txt" style="color:var(--texte-2);margin-top:26px">Pompe de ${P()} · connectée</p></div>
      <div class="actions-bas" style="bottom:128px"><button class="btn principal" data-act="versParent">Terminer</button></div></section>`;

  /* 9.8 Vue proche aidant */
  E.vueProche = () => {
    const e = D.etats[S.etat]; const lib = { zone: 'Dans la zone', bas: 'Bas', haut: 'Haut', tresHaut: 'Très haut', urgence: 'Urgence basse', attente: 'Pas de lecture', pompe: 'Pompe déconnectée', aide: 'Bas' }[S.etat];
    const c = e.couleur === '#E0A100' ? '#A37500' : e.couleur;
    return `<section class="screen ciel" aria-labelledby="t-vp">${statut()}
      <div class="entete"><button class="btn-rond" data-act="retour" aria-label="Retour">${I.retour}</button><h1 id="t-vp" style="font-size:30px">${P()}</h1><span class="pastille" style="background:#E2F3FA;color:#25728C">Vue parent</span></div>
      <div class="scroll" style="padding-top:8px">
        <div class="carte" style="display:flex;align-items:center;gap:16px;border-radius:24px;padding:20px">
          <div><b style="font-size:46px;font-weight:700;color:${c};line-height:1">${e.val}</b><div class="petit">mmol/L</div></div>
          ${e.fleche ? `<span style="width:48px;height:48px;border-radius:50%;background:${e.couleur};display:grid;place-items:center;flex:none">${fleche(e.fleche).replace('width="34" height="34"', 'width="30" height="30"')}</span>` : ''}
          <div><b style="font-size:20px;font-weight:600;color:${c}">${lib}</b><p class="petit">${S.etat === 'zone' ? 'Stable depuis 1 h' : 'Tendance : ' + e.tendance}</p></div></div>
        <button class="btn" style="background:#F2FAFD;color:#25728C;margin-top:16px;border-radius:20px;min-height:56px" data-go="journee">Résumé : journée stable</button>
        <p class="etiquette">Défis</p>
        <div class="carte" style="display:flex;align-items:center;border-radius:20px"><div style="flex:1"><h3 class="h3">Bolus avant le dîner</h3><p class="petit">Fait à 17 h 52 · série de 3 jours</p></div><span style="width:32px;height:32px;border-radius:50%;background:#447C08;display:grid;place-items:center">${I.coche}</span></div>
        <p class="etiquette">Aliments attrapés (sans photo)</p>
        ${[['barre-granola', 'Barre granola', 'Énergie rapide', '15 h 10'], ['pomme', 'Pomme', 'Énergie longue', '12 h 05'], ['carotte', 'Carottes', 'Jardin', '12 h 05']].map(([a, n, en, h]) => `<div class="carte" style="display:flex;gap:12px;align-items:center;border-radius:18px;padding:10px 16px;margin-top:8px"><img src="assets/aliment/${a}.svg" alt="" width="40"><div style="flex:1"><div style="font-size:18px">${n}</div><div class="petit">${en}</div></div><span class="petit">${h}</span></div>`).join('')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px"><button class="btn secondaire" data-go="journee">Historique</button><button class="btn principal" data-act="appeler" data-arg="${P()}">Appeler ${P()}</button></div>
      </div></section>`;
  };

  /* 9.9 Alertes de Léo */
  E.alertesLeo = () => {
    const R = S.reg;
    const ligne = (t, s, cle, go) => `<div class="ligne-r"><button class="grow" ${go ? `data-go="${go}"` : 'data-act="msg" data-arg="Réglage disponible dans la version complète."'}><div class="t">${t}</div><div class="petit">${s}</div></button>${cle === null ? `<span style="color:#5E6A72" aria-label="Toujours active">${I.cadenas}</span><span style="width:16px"></span>` : cle ? `<button class="bascule" role="switch" aria-checked="${!!R[cle]}" aria-label="${t}" data-act="reg" data-arg="${cle}"></button>` : ''}<span style="font-size:24px;color:#5E6A72;width:14px" aria-hidden="true">${cle === null ? '' : '›'}</span></div>`;
    return `<section class="screen ciel" aria-labelledby="t-aL">${statut()}${entete(`Alertes de ${P()}`, { t: 24 })}
      <div class="scroll" style="padding-top:0">${reglePar}
        <p class="etiquette" style="margin-top:20px">Alertes</p>
        ${ligne('Urgence basse', 'Sous 3,1 mmol/L · toujours active', null)}
        ${ligne('Basse', `Sous ${String(R.seuilBas.toFixed(1)).replace('.', ',')} mmol/L`, 'basse', 'alerteSeuil" data-arg="basse')}
        ${ligne('Haute', `Au-dessus de ${String(R.seuilHaut.toFixed(1)).replace('.', ',')} mmol/L`, 'haute', 'alerteSeuil" data-arg="haute')}
        ${ligne('Monte ou descend vite', 'Prévenir avant que ça arrive', 'vite')}
        <p class="etiquette">Quand et comment</p>
        ${ligne('Heures calmes', 'Nuit 21 h à 7 h · École 8 h 15 à 15 h 30', '', 'heuresCalmes')}
        ${ligne('Sons et vibrations', `Son ${R.son.toLowerCase()} pour ${P()}, fort pour vous`, '')}
        ${ligne('Qui reçoit les alertes', '3 proches', '', 'proches')}
        <p class="petit" style="margin:16px 8px 0">Les alertes urgentes sonnent toujours, même pendant les heures calmes.</p>
      </div></section>`;
  };

  /* 9.10 Alerte basse (et haute) */
  E.alerteSeuil = () => {
    const R = S.reg; const bas = route.arg !== 'haute';
    const cle = bas ? 'seuilBas' : 'seuilHaut', min = bas ? 3.1 : 8, max = bas ? 5.5 : 15, c = bas ? '#D12F2F' : '#E0A100';
    const v = R[cle]; const f = x => String(x.toFixed(1)).replace('.', ',');
    const chips = (k, l) => `<div class="chips" role="radiogroup">${l.map(o => `<button class="chip ${R[k] === o ? 'actif' : ''}" role="radio" aria-checked="${R[k] === o}" data-act="regVal" data-arg="${k}:${o}">${o}</button>`).join('')}</div>`;
    return `<section class="screen ciel" aria-labelledby="t-as">${statut()}${entete(bas ? 'Alerte basse' : 'Alerte haute', { t: 24 })}
      <div class="scroll" style="padding-top:0">${reglePar}
        <div class="carte" style="display:flex;align-items:center;border-radius:20px;margin-top:16px"><span style="flex:1;font-size:18px">Activée</span><button class="bascule" role="switch" aria-checked="${!!R[bas ? 'basse' : 'haute']}" aria-label="Alerte activée" data-act="reg" data-arg="${bas ? 'basse' : 'haute'}"></button></div>
        <p class="txt" style="margin:20px 0 8px">Prévenir quand la glycémie ${bas ? 'descend sous' : 'monte au-dessus de'}</p>
        <div class="carte" style="border-radius:24px;padding:16px 20px">
          <div style="display:flex;align-items:center;justify-content:space-between"><button class="btn-moins" data-act="seuil" data-arg="${cle}:-1" aria-label="Diminuer">–</button><div class="centre"><b id="valSeuil" style="font-size:46px;font-weight:700;color:${c};line-height:1.1">${f(v)}</b><div class="petit">mmol/L</div></div><button class="btn-moins" data-act="seuil" data-arg="${cle}:1" aria-label="Augmenter">+</button></div>
          <input class="seuil" type="range" min="${min}" max="${max}" step="0.1" value="${v}" data-range="${cle}" style="--c:${c}" aria-label="Seuil en mmol/L">
          <div style="display:flex;justify-content:space-between" class="petit"><span>${f(min)}</span><span>${f(max)}</span></div></div>
        <p class="etiquette">Répéter si personne ne réagit</p>${chips('repeter', ['15 min', '30 min', 'Jamais'])}
        <p class="etiquette">Son pour ${P()}</p>${chips('son', ['Doux', 'Normal', 'Fort'])}
        <div class="info" style="display:flex;gap:12px;align-items:center;margin-top:24px"><img src="assets/bulle/${bas ? 'bas' : 'haut'}.svg" alt="" width="64"><div><div style="font-size:14px;font-weight:500;margin-bottom:4px">CE QUE ${P().toUpperCase()} VERRA</div><span class="txt" style="color:#14232B">${bas ? '« J’ai un petit creux… on prend une collation ? »' : '« J’ai soif… on boit un verre d’eau ? »'}</span></div></div>
        <button class="btn principal" style="margin-top:24px" data-act="enregistrer">Enregistrer</button>
      </div></section>`;
  };

  /* 9.11 Heures calmes */
  E.heuresCalmes = () => {
    const R = S.reg;
    const per = (cle, t, h, j) => `<div class="carte" style="display:flex;align-items:center;border-radius:20px;margin-top:12px"><div style="flex:1"><h3 class="h3">${t}</h3><div class="txt" style="color:#25728C">${h}</div><div class="petit">${j}</div></div><button class="bascule" role="switch" aria-checked="${!!R[cle]}" aria-label="${t}" data-act="reg" data-arg="${cle}"></button></div>`;
    const opt = (id, t) => `<button class="option ${R.calme === id ? 'on' : ''}" role="radio" aria-checked="${R.calme === id}" data-act="regVal" data-arg="calme:${id}" style="border-radius:18px;padding:14px 20px;margin-top:8px;${R.calme === id ? '' : 'border-color:#fff'}"><span style="width:22px;height:22px;border-radius:50%;flex:none;${R.calme === id ? 'background:#25728C;display:grid;place-items:center' : 'border:2px solid #14232B'}">${R.calme === id ? '<i style="width:10px;height:10px;border-radius:50%;background:#fff"></i>' : ''}</span><span class="txt">${t}</span></button>`;
    return `<section class="screen ciel" aria-labelledby="t-hc">${statut()}${entete('Heures calmes', { t: 24 })}
      <div class="scroll" style="padding-top:0">${reglePar}
        <p class="txt" style="color:var(--texte-2);margin-top:14px">Pendant ces heures, les alertes non urgentes ne sonnent pas, pour laisser ${P()} dormir ou se concentrer.</p>
        ${per('nuit', 'Nuit', '21 h à 7 h', 'Tous les jours')}${per('ecole', 'École', '8 h 15 à 15 h 30', 'Lundi au vendredi')}
        <button class="btn" style="background:#fff;border:2px solid #8DD6EE;color:#25728C;border-radius:20px;min-height:56px;margin-top:12px" data-act="msg" data-arg="Ajout de période : version complète.">+ Ajouter une période</button>
        <p class="etiquette">Pendant les heures calmes</p>
        <div role="radiogroup">${opt('vib', 'Vibration seulement')}${opt('resume', 'Tout garder pour le résumé')}</div>
        <div class="info rouge" style="font-size:14px;font-weight:500;margin-top:20px">Urgence basse et haute : sonnent toujours</div>
        <button class="btn principal" style="margin-top:24px" data-act="enregistrer">Enregistrer</button>
      </div></section>`;
  };

  /* 9.12 Qui reçoit les alertes */
  E.proches = () => {
    const gens = [['M', 'Maman', 'Parent', '#FFECDB', '#C9561C', [1, 1, 1]], ['P', 'Papa', 'Parent', '#E2F3FA', '#25728C', [1, 1, 0]], ['T', 'Mme Tremblay', 'École · 8 h 15 à 15 h 30', '#EEF5DC', '#447C08', [1, 0, 0]]];
    const types = ['Urgentes', 'Basse et haute', 'Résumé du soir'];
    return `<section class="screen ciel" aria-labelledby="t-qr">${statut()}${entete('Qui reçoit les alertes', { t: 24 })}
      <div class="scroll" style="padding-top:0">${reglePar}
        ${gens.map(([l, n, r, bg, c, on], gi) => `<div class="carte" style="border-radius:24px;margin-top:${gi ? 12 : 18}px">
          <div style="display:flex;gap:12px;align-items:center"><span style="width:44px;height:44px;border-radius:50%;background:${bg};color:${c};display:grid;place-items:center;font-size:20px;font-weight:600">${l}</span><div><h3 class="h3">${n}</h3><p class="petit">${r}</p></div></div>
          <div class="chips" style="margin-top:14px">${types.map((t, k) => `<button class="chip ${on[k] ? 'actif' : 'gris'}" style="font-size:13px;font-weight:400;min-height:32px;padding:6px 14px" aria-pressed="${!!on[k]}" ${k === 0 ? 'disabled aria-label="Urgentes : toujours actif"' : 'data-act="chipVisuel"'}>${t}</button>`).join('')}</div></div>`).join('')}
        <button class="btn" style="background:#fff;border:2px solid #8DD6EE;color:#25728C;border-radius:20px;min-height:56px;margin-top:18px" data-go="proche">+ Ajouter un proche</button>
        <p class="petit centre" style="margin-top:18px">${P()} peut voir qui reçoit ses alertes, dans son profil.</p>
      </div></section>`;
  };

  /* ==========================================================
     ROUTEUR ET ACTIONS
     ========================================================== */
  function aller(nom, arg = null, remplacer = false) {
    if (route.name === 'camera' && nom !== 'camera') arreterCamera();
    if (!remplacer && route.name !== 'splash') pile.push(route);
    route = { name: nom, arg };
    if (nom !== 'accueil') bulleRetournee = false;
    rendre();
  }
  function rendre() {
    document.body.classList.toggle('grand-texte', !!S.grandTexte);
    app.innerHTML = (E[route.name] || E.accueil)();
    const h = app.querySelector('h1'); if (h && route.name !== 'accueil') { h.setAttribute('tabindex', '-1'); }
  }
  function retour() { const p = pile.pop(); if (p) { if (route.name === 'camera') arreterCamera(); route = p; rendre(); } else aller('accueil', null, true); }

  async function demarrerCamera() {
    const v = document.getElementById('video'); if (!v) return;
    try {
      flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      v.srcObject = flux;
    } catch (e) {
      document.getElementById('sim').hidden = false;
      const err = document.getElementById('camErr'); err.hidden = false;
      err.innerHTML = '<span class="pastille" style="color:#14232B">Caméra non disponible : la démo simule l’image.</span>';
    }
    setTimeout(() => { const r = document.getElementById('repere'); if (r && route.name === 'camera') r.innerHTML = '<span class="pastille" style="background:#447C08;color:#fff">Aliment repéré !</span>'; }, 2200);
  }
  function arreterCamera() { if (flux) { flux.getTracks().forEach(t => t.stop()); flux = null; } }

  const actions = {
    retour,
    accueil: () => { pile.length = 0; aller('accueil', null, true); },
    choixComp: (i) => { ui.choix = +i; rendre(); },
    confirmerComp: () => { S.compagnon = D.compagnons[ui.choix ?? D.compagnons.findIndex(c => c.id === S.compagnon)].id; save(); ui = {}; if (S.onboard) { aller('profil', null, true); toast(`${comp().nom} est maintenant ton compagnon !`); } else aller('tuto', null, true); },
    changerComp: () => { ui.choix = D.compagnons.findIndex(c => c.id === S.compagnon); aller('compagnon'); },
    tutoSuivant: () => { ui.etape = (ui.etape || 0) + 1; if (ui.etape > 3) { ui = {}; aller('permission', null, true); } else rendre(); },
    finTuto: () => { ui = {}; aller('permission', null, true); },
    autoriserCam: async () => { try { const f = await navigator.mediaDevices.getUserMedia({ video: true }); f.getTracks().forEach(t => t.stop()); } catch (e) { /* refusé : on continue */ } actions.finOnboard(); },
    finOnboard: () => { S.onboard = true; save(); pile.length = 0; aller('accueil', null, true); },
    retourner: () => { bulleRetournee = !bulleRetournee; const b = app.querySelector('.bulle-etat'); if (b) b.classList.toggle('retournee', bulleRetournee); },
    toucherCompagnon: () => { if (S.etat === 'bas') aller('jus'); else if (S.etat === 'haut' || S.etat === 'tresHaut') { S.etat = 'zone'; save(); rendre(); toast('Ahhh, de l’eau fraîche ! Merci.'); } else toast(`${comp().nom} est content de te voir !`); },
    appelerMaman: (nom) => {
      nom = typeof nom === 'string' && nom ? nom : 'maman';
      const v = document.createElement('div'); v.className = 'voile'; v.style.background = 'rgba(20,35,43,.55)';
      v.innerHTML = `<div class="modale" role="dialog" aria-label="Appel à ${nom}" style="width:332px;min-height:540px;border-radius:32px;border:2px solid #CDEAF4;padding:34px 24px 24px;text-align:center">
        <h2 class="h2">Appel à ${nom}</h2>
        <div style="width:160px;height:160px;border-radius:50%;background:#FFECDB;margin:42px auto 0;display:grid;place-items:center;font-size:40px;font-weight:700;color:#C9561C">${nom.charAt(0).toUpperCase()}</div>
        <p id="chrono" style="font-size:24px;font-weight:600;margin:30px 0 0">00:00</p>
        <p class="petit" id="etatAppel" style="margin-top:8px">Ça sonne… (simulation)</p>
        <button data-act="raccrocher" aria-label="Raccrocher" style="width:76px;height:76px;border-radius:50%;background:#D12F2F;margin:44px auto 0;display:grid;place-items:center">${IC.raccrocher}</button>
        <p class="petit" style="margin-top:10px">Raccrocher</p></div>`;
      app.appendChild(v);
      let t = 0; clearInterval(ui.appel);
      ui.appel = setInterval(() => { const c = document.getElementById('chrono'); if (!c) return clearInterval(ui.appel); t++; c.textContent = `00:${String(t).padStart(2, '0')}`; if (t === 3) document.getElementById('etatAppel').textContent = `En ligne avec ${nom}`; }, 1000);
    },
    raccrocher: () => { clearInterval(ui.appel); const v = app.querySelector('.voile'); if (v) v.remove(); if (route.name === 'urgence') aller('reverif', null, true); },
    onglet: (o) => { ui.onglet = o; rendre(); },
    faireDefi: (id) => { const d = D.defis.find(x => x.id === id); if (id === 'jardin') return aller('camera'); S.defis[id] = Math.min((S.defis[id] || 0) + 1, d.total); if (S.defis[id] >= d.total && d.badge && !S.badges.includes(d.badge)) S.badges.push(d.badge); gagner(d.recompense); aller('bravo', id, true); },
    quitterCamera: () => { arreterCamera(); retour(); },
    capturer: () => {
      const v = document.getElementById('video'); let photo = null;
      try { if (v && v.videoWidth) { const c = document.createElement('canvas'); c.width = 320; c.height = 240; c.getContext('2d').drawImage(v, 0, 0, 320, 240); photo = c.toDataURL('image/jpeg', .7); } } catch (e) { photo = null; }
      const f = document.createElement('div'); f.className = 'flash'; app.querySelector('.screen').appendChild(f);
      const t = document.createElement('div'); t.className = 'voile'; t.style.background = 'transparent';
      t.innerHTML = '<span class="pastille" style="background:#FE9732;color:#fff;font-size:28px;padding:16px 40px">Attrapé !</span>'; app.appendChild(t);
      const pool = D.aliments.map(a => a.id).sort(() => Math.random() - .5).slice(0, 3);
      ui = { photo, devine: pool, sel: pool[0] };
      setTimeout(() => { arreterCamera(); aller('choisir', null, true); }, 900);
    },
    selAliment: (a) => { ui.sel = a; rendre(); },
    confirmerAliment: () => { const a = ui.sel; ui.photo = null; aller('carte', a, true); },
    choisirCat: (c) => { const a = D.aliments.filter(x => x.cat === c); const pool = a.concat(D.aliments.filter(x => x.cat !== c)).slice(0, 3).map(x => x.id); ui = { devine: pool, sel: pool[0], photo: null }; aller('choisir'); },
    ajouterAlbum: (id) => {
      if (!S.album.includes(id)) { S.album.push(id); const al = D.aliments.find(a => a.id === id); if (al.energie === 'Jardin') S.defis.jardin = Math.min((S.defis.jardin || 0) + 1, 3); save(); gagner(1, 'Carte ajoutée à ton album !'); }
      pile.length = 0; pile.push({ name: 'camera', arg: null }); aller('album', null, true);
    },
    vue: (v) => { ui.vue = v; rendre(); },
    item: (arg) => {
      const [type, id] = arg.split(':');
      const liste = type === 'acc' ? D.accessoires : type === 'lieu' ? D.lieux : D.objets;
      const item = liste.find(x => x.id === id); const cle = type === 'acc' ? 'acc' : type === 'lieu' ? 'lieux' : 'obj';
      if (!S.possede[cle].includes(id)) {
        if (item.defi) return toast(`Se gagne en réussissant le ${item.defi}.`);
        if (S.etoiles < item.prix) return toast(`Il te manque ${item.prix - S.etoiles} étoiles. Relève des défis !`);
        S.etoiles -= item.prix; S.possede[cle].push(id); toast(`${item.nom} débloqué !`);
      }
      if (type === 'acc') {
        const zoneDe = x => (D.accessoires.find(a => a.id === x) || {}).zone;
        if (S.porte.includes(id)) S.porte = S.porte.filter(x => x !== id);
        else S.porte = S.porte.filter(x => zoneDe(x) !== item.zone).concat(id);
      } else if (type === 'lieu') S.lieu = id;
      else S.objetsPlaces = S.objetsPlaces.includes(id) ? S.objetsPlaces.filter(x => x !== id) : S.objetsPlaces.slice(-3).concat(id);
      save(); rendre();
    },
    bascule: (cle) => { S[cle] = !S[cle]; save(); rendre(); },
    basculeVisuelle: (_, el) => el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'),
    etat: (id) => { S.etat = id; save(); if (id === 'urgence') aller('urgence'); else { rendre(); toast('État changé. Retourne à l’accueil pour voir ' + comp().nom + '.'); } },
    chiffre: (k) => { ui.code = ui.code || ''; if (k === '⌫') ui.code = ui.code.slice(0, -1); else if (ui.code.length < 4) ui.code += k; if (ui.code.length === 4) { if (ui.code === '1234') { ui = {}; aller('parent', null, true); return; } ui.code = ''; toast('Code incorrect. Essaie 1234 pour la démo.'); } rendre(); },
    msg: (m) => toast(m),
    role: (r) => { ui.role = r; rendre(); },
    choixRole: () => { if ((ui.role || 'parent') === 'parent') aller('profilEnfant'); else if (S.inscrit) aller('compagnon'); else toast('Demande d’abord à ton parent de configurer l’app.'); },
    suite: (vers) => {
      app.querySelectorAll('[data-cle]').forEach(el => { if (!el.dataset.cle.startsWith('p-') && el.dataset.cle in S.profil) S.profil[el.dataset.cle] = el.value.trim() || S.profil[el.dataset.cle]; });
      save(); aller(vers);
    },
    lecture: (v) => { S.lecture = v; save(); rendre(); },
    niveauAlertes: (v) => { S.niveauAlertes = v; save(); rendre(); },
    inviter: () => { const n = (app.querySelector('[data-cle="p-prenom"]') || {}).value || 'Ton proche'; toast(`Invitation envoyée à ${n} !`); actions.apresProche(); },
    apresProche: () => { if (S.inscrit) retour(); else aller('config', null, true); },
    finInscription: () => { S.inscrit = true; save(); pile.length = 0; ui = {}; aller('compagnon', null, true); },
    appeler: (nom) => actions.appelerMaman(nom),
    devineChoix: (v) => { ui.devine2 = v; rendre(); },
    devineValider: () => { toast('C’est noté ! On regarde ta flèche dans 2 heures.'); retour(); },
    cocheDefi: (id) => { const l = S.defisChoisis; if (l.includes(id)) S.defisChoisis = l.filter(x => x !== id); else if (l.length < 3) l.push(id); else return toast('Tu as déjà 3 défis. Enlève-en un d’abord.'); save(); rendre(); },
    validerDefis: () => { toast('Tes 3 défis sont prêts pour la semaine !'); pile.length = 0; aller('defis', null, true); },
    rappel: () => { toast('D’accord, je te le rappelle demain !'); retour(); },
    poserSuivant: (n) => { n = +n; if (n < 3) aller('poser', n + 1); else { pile.length = 0; ui = {}; aller('reveil', null, true); } },
    capteurPret: () => { if (!S.badges.includes('courage')) S.badges.push('courage'); gagner(3); if (S.etat === 'attente') S.etat = 'zone'; save(); aller('pret', null, true); },
    appareil: (k) => { ui.app = +k; rendre(); },
    connecterApp: () => { if ((ui.app ?? 0) !== 0) return toast('Pour la démo, choisis la pompe de ' + ((S.profil && S.profil.prenom) || 'Léo') + '.'); aller('connexionPompe'); },
    versParent: () => { pile.length = 0; pile.push({ name: 'profil', arg: null }); ui = {}; aller('parent', null, true); },
    reg: (cle) => { S.reg[cle] = !S.reg[cle]; save(); rendre(); },
    regVal: (arg) => { const [k, v] = arg.split(':'); S.reg[k] = v; save(); rendre(); },
    seuil: (arg) => { const [k, d] = arg.split(':'); const b = k === 'seuilBas' ? [3.1, 5.5] : [8, 15]; S.reg[k] = Math.round(Math.min(b[1], Math.max(b[0], S.reg[k] + d * 0.1)) * 10) / 10; save(); rendre(); },
    enregistrer: () => { save(); toast('Réglages enregistrés.'); retour(); },
    chipVisuel: (_, el) => { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); el.classList.toggle('actif', on); el.classList.toggle('gris', !on); },
    agrandirAcc: () => { ui.grandAcc = true; rendre(); },
    fermerGrandAcc: () => { ui.grandAcc = false; ui.accSel = null; rendre(); toast(`${comp().nom} est prêt !`); },
    replacerAcc: () => { S.porte.forEach(id => { delete S.accPos[S.compagnon + ':' + id]; }); save(); rendre(); },
    accTaille: (d) => { const a = D.accessoires.find(x => x.id === ui.accSel); if (!a) return; const q = accPos(a); const k = S.compagnon + ':' + a.id; S.accPos[k] = { x: q.x, y: q.y, w: Math.round(Math.max(12, Math.min(110, q.w * (d > 0 ? 1.12 : 1 / 1.12)))) }; save(); rendre(); },
    objTaille: (d) => { const id = ui.objSel; if (!id) return; S.tailles[id] = Math.round(Math.max(0.5, Math.min(2.5, ((S.tailles || {})[id] || 1) * (d > 0 ? 1.15 : 1 / 1.15))) * 100) / 100; save(); rendre(); },
    agrandir: () => { ui.grand = true; rendre(); },
    fermerGrand: () => { ui.grand = false; ui.objSel = null; rendre(); toast('Ton décor est enregistré !'); },
    replacer: () => { S.positions = {}; S.tailles = {}; save(); rendre(); },
    reinit: () => { if (confirmerReinit()) { try { localStorage.removeItem('dk'); } catch (e) { /* rien */ } S = neuf(); ui = {}; pile.length = 0; aller('splash', null, true); } }
  };
  function confirmerReinit() { return window.confirm ? window.confirm('Recommencer la démo depuis le début ?') : true; }

  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-go],[data-tab]'); if (!t || t.disabled) return;
    if (t.dataset.tab) { ui = {}; pile.length = 0; const tab = t.dataset.tab; if (tab === 'accueil') aller('accueil', null, true); else { pile.push({ name: 'accueil', arg: null }); route = { name: 'accueil' }; aller(tab, null, true); } return; }
    if (t.dataset.go) { ui = route.name === t.dataset.go ? ui : {}; aller(t.dataset.go, t.dataset.arg || null); return; }
    const f = actions[t.dataset.act]; if (f) f(t.dataset.arg, t);
  });
  /* Glisser-déposer des objets du décor */
  let glisse = null;
  /* Glisser-déposer des accessoires sur le compagnon */
  let glisseAcc = null;
  const placerAcc = (id, q) => app.querySelectorAll(`[data-acc="${id}"]`).forEach(el => { el.style.left = (q.x - q.w / 2) + '%'; el.style.top = q.y + '%'; el.style.width = q.w + '%'; });
  app.addEventListener('pointerdown', (e) => {
    const o = e.target.closest('[data-acc]'); if (!o) return;
    e.preventDefault(); const a = D.accessoires.find(x => x.id === o.dataset.acc); const r = o.parentElement.getBoundingClientRect();
    glisseAcc = { o, a, r, sx: e.clientX, sy: e.clientY, q: accPos(a) };
    try { o.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    o.classList.add('tenu');
  });
  app.addEventListener('pointermove', (e) => {
    if (!glisseAcc) return; const g = glisseAcc;
    g.n = { x: Math.round(Math.max(0, Math.min(100, g.q.x + (e.clientX - g.sx) / g.r.width * 100)) * 10) / 10, y: Math.round(Math.max(-45, Math.min(95, g.q.y + (e.clientY - g.sy) / g.r.height * 100)) * 10) / 10, w: g.q.w };
    placerAcc(g.a.id, g.n);
  });
  const lacherAcc = () => {
    if (!glisseAcc) return; const g = glisseAcc; glisseAcc = null; g.o.classList.remove('tenu');
    if (g.n) { S.accPos[S.compagnon + ':' + g.a.id] = g.n; save(); }
    if (app.querySelector('.editeur') && ui.accSel !== g.a.id) { ui.accSel = g.a.id; rendre(); }
  };
  app.addEventListener('pointerup', lacherAcc); app.addEventListener('pointercancel', lacherAcc);
  app.addEventListener('keydown', (e) => {
    const o = e.target.closest && e.target.closest('[data-acc]'); if (!o) return;
    const d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key]; if (!d) return;
    e.preventDefault(); const a = D.accessoires.find(x => x.id === o.dataset.acc); const q = accPos(a);
    const n = { x: Math.max(0, Math.min(100, q.x + d[0])), y: Math.max(-45, Math.min(95, q.y + d[1])), w: q.w };
    S.accPos[S.compagnon + ':' + a.id] = n; save(); placerAcc(a.id, n);
  });

  app.addEventListener('pointerdown', (e) => {
    const o = e.target.closest('.scene [data-obj], .scene-mini [data-obj]'); if (!o) return;
    e.preventDefault();
    const k = o.parentElement.getBoundingClientRect().width / 428;
    glisse = { o, k, id: o.dataset.obj, sx: e.clientX, sy: e.clientY, x: parseFloat(o.style.left), y: parseFloat(o.style.top) };
    try { o.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    o.classList.add('tenu');
  });
  const borne = (x, y) => [Math.round(Math.max(-10, Math.min(428 - 64, x))), Math.round(Math.max(110, Math.min(820, y)))];
  app.addEventListener('pointermove', (e) => {
    if (!glisse) return; const g = glisse;
    [g.nx, g.ny] = borne(g.x + (e.clientX - g.sx) / g.k, g.y + (e.clientY - g.sy) / g.k);
    g.o.style.left = g.nx + 'px'; g.o.style.top = g.ny + 'px';
  });
  const lacher = () => {
    if (!glisse) return; const g = glisse; glisse = null; g.o.classList.remove('tenu');
    if (g.nx != null) { S.positions[g.id] = { x: g.nx, y: g.ny }; save(); app.querySelectorAll(`[data-obj="${g.id}"]`).forEach(el => { el.style.left = g.nx + 'px'; el.style.top = g.ny + 'px'; }); }
    if (app.querySelector('.editeur') && ui.objSel !== g.id) { ui.objSel = g.id; rendre(); }
  };
  app.addEventListener('pointerup', lacher); app.addEventListener('pointercancel', lacher);
  app.addEventListener('keydown', (e) => {
    const o = e.target.closest && e.target.closest('[data-obj]'); if (!o) return;
    const d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key]; if (!d) return;
    e.preventDefault(); const [x, y] = borne(parseFloat(o.style.left) + d[0], parseFloat(o.style.top) + d[1]);
    S.positions[o.dataset.obj] = { x, y }; save(); app.querySelectorAll(`[data-obj="${o.dataset.obj}"]`).forEach(el => { el.style.left = x + 'px'; el.style.top = y + 'px'; });
  });

  app.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.range; if (!k) return;
    S.reg[k] = Math.round(parseFloat(e.target.value) * 10) / 10; save();
    const el = document.getElementById('valSeuil'); if (el) el.textContent = String(S.reg[k].toFixed(1)).replace('.', ',');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && route.name !== 'accueil' && route.name !== 'splash') retour(); });

  /* Mise à l’échelle de la scène pour tous les écrans */
  function echelle() {
    const vw = window.innerWidth, vh = window.innerHeight; const mobile = vw <= 500;
    const s = mobile ? vw / 428 : Math.min(1, (vh - 40) / 926, (vw - 20) / 428);
    const h = mobile ? Math.max(760, vh / s) : 926;
    stage.style.setProperty('--stage-h', h + 'px');
    stage.style.transform = `translateX(-50%) scale(${s})`;
    stage.style.top = mobile ? '0px' : Math.max(0, (vh - 30 - 926 * s) / 2) + 'px';
    document.querySelector('.desktop-note').style.top = (mobile ? vh + 10 : Math.max(0, (vh - 30 - 926 * s) / 2) + 926 * s + 8) + 'px';
  }
  window.addEventListener('resize', echelle); echelle();
  rendre();
})();
