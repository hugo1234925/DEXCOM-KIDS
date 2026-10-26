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
    sons: true, vibrations: true, grandTexte: false
  };
  let S;
  try { S = Object.assign({}, DEFAUT, JSON.parse(localStorage.getItem('dk') || '{}')); } catch (e) { S = Object.assign({}, DEFAUT); }
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
      <h1>${titre}</h1>${opts.droite || ''}
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
  function compagnonHTML(opts = {}) {
    const etat = D.etats[S.etat];
    const pose = !opts.neutre && etat.pose && S.compagnon === 'renard' ? etat.pose : null;
    const src = opts.pose ? `assets/pose/${opts.pose}.svg` : pose ? `assets/pose/${pose}.svg` : `assets/compagnon/${S.compagnon}.svg`;
    const acc = (pose || opts.pose || opts.sansAcc) ? [] : S.porte.map(id => D.accessoires.find(a => a.id === id)).filter(Boolean);
    const accHTML = (a) => `<img class="acc" alt="" src="assets/objet/${a.id}.svg" style="left:${a.pos.x - a.pos.w / 2}%;top:${a.pos.y}%;width:${a.pos.w}%;${a.derriere ? 'z-index:-1' : ''}">`;
    return `<div style="position:relative;isolation:isolate">${acc.filter(a => a.derriere).map(accHTML).join('')}<img class="corps" src="${src}" alt="${esc(comp().nom)}${pose ? ' — ' + esc(etat.message) : ''}">${acc.filter(a => !a.derriere).map(accHTML).join('')}</div>`;
  }

  /* ==========================================================
     ÉCRANS
     ========================================================== */
  const E = {};

  E.splash = () => {
    setTimeout(() => { if (route.name === 'splash') aller(S.onboard ? 'accueil' : 'compagnon', null, true); }, 1600);
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
    const bulle = etat.bulle
      ? `<div class="face icone"><img src="assets/bulle/${etat.bulle}.svg" alt=""></div>
         <div class="face chiffre" style="--c:${etat.couleur}"><svg viewBox="0 0 240 243" style="position:absolute;inset:0" aria-hidden="true"><circle cx="58" cy="214" r="18" fill="#fff"/><circle cx="34" cy="232" r="11" fill="#fff"/><circle cx="58" cy="214" r="13" fill="${etat.couleur}"/><circle cx="34" cy="232" r="7" fill="${etat.couleur}"/></svg>
           <div class="chiffre-rond"><span class="val">${etat.val}</span><span class="unite">mmol/L</span><span class="fleche">${fleche(etat.fleche, S.etat === 'haut' || S.etat === 'tresHaut' ? '#14232B' : '#fff')}</span></div></div>`
      : `<div class="face icone"><svg viewBox="0 0 240 243" aria-hidden="true"><circle cx="120" cy="112" r="89" fill="#fff"/><circle cx="58" cy="214" r="18" fill="#fff"/><circle cx="34" cy="232" r="11" fill="#fff"/><circle cx="120" cy="112" r="82" fill="#32A3C9"/><circle cx="58" cy="214" r="13" fill="#32A3C9"/><circle cx="34" cy="232" r="7" fill="#32A3C9"/><path d="M106 86h28M106 138h28M110 86q0 20 10 26-10 6-10 26M130 86q0 20-10 26 10 6 10 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg></div>`;
    const objets = S.objetsPlaces.map(id => D.objets.find(o => o.id === id)).filter(Boolean)
      .map(o => `<img class="objet-decor" src="assets/objet/${o.id}.svg" alt="" style="left:${o.place.x}px;top:${o.place.y}px">`).join('');
    return `<section class="screen" aria-label="Accueil">
      <img class="decor" src="${decorSrc()}" alt="">
      ${objets}
      ${statut(nuit)}
      <div class="accueil-entete">
        <span class="salut">${nuit ? 'Bonne nuit Léo' : 'Salut Léo !'}</span>
        <div style="display:flex;gap:8px">${etoilesPill()}<button class="btn-rond" data-act="appelerMaman" aria-label="Appeler maman">${I.tel}</button></div>
      </div>
      <button class="bulle-etat ${bulleRetournee ? 'retournee' : ''}" data-act="retourner"
        aria-label="${etat.bulle ? `Glycémie ${etat.val} millimoles par litre, ${etat.tendance}. Touche pour ${bulleRetournee ? 'revoir Foxy' : 'voir le chiffre'}.` : 'Capteur en préparation'}">${bulle}</button>
      ${etat.bulle ? `<button class="btn-journee" data-go="journee" aria-label="Voir ma journée. ${etat.val} millimoles par litre, ${etat.tendance}">${I.graph}<span>${etat.val} · ${etat.tendance}</span>${I.chevron}</button>` : `<span class="btn-journee" style="border:0">Capteur · 18 min</span>`}
      <p class="dialogue" style="${etat.bulle ? '' : 'top:300px'}">${esc(S.etat === 'zone' && !S.vuJournee ? 'Psst ! Touche ton chiffre pour voir ta journée.' : etat.message)}</p>
      <button class="compagnon" data-act="toucherCompagnon" aria-label="${esc(comp().nom)}${S.etat === 'bas' ? ' : donner un jus' : ''}" style="${etat.pose && S.compagnon === 'renard' ? 'width:230px;top:478px' : ''}">${compagnonHTML()}</button>
      ${nav('accueil')}
    </section>`;
  };

  /* 3.4 Foxy boit son jus */
  E.jus = () => {
    setTimeout(() => { if (route.name === 'jus') { S.etat = 'zone'; save(); aller('accueil', null, true); gagner(1, 'Collation ajoutée ! Ton énergie remonte.'); } }, 3200);
    return `<section class="screen" aria-label="Foxy boit son jus">
      <img class="decor" src="${decorSrc()}" alt="">${statut()}
      <p class="dialogue" style="top:240px;left:110px;width:210px">Glou glou… Merci ! Mon énergie remonte.</p>
      <div class="compagnon" style="left:110px;top:400px;width:210px">${compagnonHTML({ pose: S.compagnon === 'renard' ? 'foxy-jus' : null })}</div>
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
      <img src="assets/pose/foxy-dodo.svg" alt="" style="width:150px;margin:20px auto 0">
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
    const d = D.defis.find(x => x.id === route.arg); const fini = (S.defis[d.id] || 0) >= d.total;
    return `<section class="screen" aria-labelledby="t-bv"><img class="decor" src="${decorSrc()}" alt="">${statut()}
      <div style="position:relative;text-align:center;padding:16px 24px">
        <h1 id="t-bv" class="h1" style="font-size:38px">${fini ? 'Bravo Léo !' : 'Bien joué !'}</h1>
        <p class="txt" style="margin-top:6px">${fini ? 'Défi réussi en entier !' : d.titre + ' : c’est noté.'}</p>
        <div style="width:190px;margin:8px auto">${compagnonHTML({ neutre: true })}</div>
        <span class="pastille" style="background:#FE9732;color:#fff;font-size:17px;font-weight:600">+${d.recompense} étoiles</span>
        ${fini && d.badge ? `<div class="carte" style="margin-top:16px;display:flex;gap:14px;align-items:center;text-align:left"><img src="assets/badge/${d.badge}.svg" alt="" width="60"><div><div class="petit" style="color:#A34E16;font-weight:600">BADGE DÉBLOQUÉ</div><b>Série de 3</b></div></div>` : ''}
      </div>
      <div class="actions-bas"><button class="btn principal" data-tab="defis">Continuer</button>${fini ? '<button class="btn secondaire" data-tab="perso">Habiller Foxy</button>' : ''}</div></section>`;
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
    const cats = [['Fruits', 'pomme'], ['Légumes', 'carotte'], ['Pain et pâtes', 'pates'], ['Boissons', 'lait'], ['Collations', 'barre-granola'], ['Repas', 'oeuf']];
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
      ? `<div class="apercu" style="background:linear-gradient(#8DD6EE,#E2F3FA)"><div style="position:absolute;left:50%;bottom:6px;width:190px;transform:translateX(-50%)">${compagnonHTML({ neutre: true })}</div></div>
         <div class="grille">${D.accessoires.map(a => tuile('acc', a)).join('')}</div>`
      : `<div class="apercu"><img class="decor" src="${decorSrc()}" alt="">${S.objetsPlaces.map(id => D.objets.find(o => o.id === id)).filter(Boolean).map(o => `<img src="assets/objet/${o.id}.svg" alt="" style="position:absolute;width:56px;left:${(o.place.x / 428 * 100).toFixed(0)}%;top:${((o.place.y - 300) / 500 * 100).toFixed(0)}%">`).join('')}<div style="position:absolute;left:30px;bottom:6px;width:130px">${compagnonHTML({ neutre: true })}</div></div>
         <p class="etiquette" style="margin-top:4px">Paysages · le ciel suit l’heure</p>
         <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${D.lieux.map(l => tuile('lieu', l).replace('class="tuile', 'style="min-height:0;padding:6px" class="tuile')).join('')}</div>
         <p class="etiquette">Objets</p><div class="grille">${D.objets.map(o => tuile('obj', o)).join('')}</div>`;
    return `<section class="screen ciel" aria-label="Personnaliser">${statut()}
      <div class="entete" style="justify-content:space-between">${sel}${etoilesPill()}</div>
      <div class="scroll">${contenu}</div>${nav('perso')}</section>`;
  };

  /* 9.1 Mon profil et réglages */
  E.profil = () => {
    const bascule = (cle, label, sous) => `<div class="ligne"><div class="grow"><div class="txt">${label}</div>${sous ? `<div class="petit">${sous}</div>` : ''}</div>
      <button class="bascule" role="switch" aria-checked="${!!S[cle]}" aria-label="${label}" data-act="bascule" data-arg="${cle}"></button></div>`;
    const etats = [['zone', 'Dans la zone'], ['bas', 'Bas'], ['haut', 'Haut'], ['tresHaut', 'Très haut'], ['urgence', 'Urgence basse'], ['attente', 'Pas de lecture']];
    return `<section class="screen ciel" aria-labelledby="t-pf">${statut()}${entete('Mon profil', { sansRetour: true, droite: etoilesPill() })}
      <div class="scroll">
        <div class="carte" style="display:flex;gap:14px;align-items:center">
          <div style="width:72px;height:72px;border-radius:50%;background:${comp().fond};overflow:hidden;display:grid;place-items:start center;flex:none"><img src="assets/compagnon/${S.compagnon}.svg" alt="" style="width:120px;max-width:none;margin-top:4px"></div>
          <div><h2 class="h3">Léo et ${esc(comp().nom)}</h2><p class="petit">9 ans · ensemble depuis 12 jours</p>
          <div style="display:flex;gap:6px;margin-top:8px">${['courage', 'serie-de-3', 'chasseur'].map(b => `<img src="assets/badge/${b}.svg" alt="Badge ${b}" width="34" style="${S.badges.includes(b) ? '' : 'filter:grayscale(1);opacity:.4'}">`).join('')}</div></div>
        </div>
        <p class="etiquette">Mon compagnon</p>
        <div class="carte"><button class="ligne" style="width:100%;text-align:left" data-act="changerComp"><div class="grow"><div class="txt">Changer de compagnon</div><div class="petit">${esc(comp().nom)}, ${comp().espece}</div></div><span class="chevron">›</span></button></div>
        <p class="etiquette">Sons et affichage</p>
        <div class="carte">${bascule('sons', 'Voix et sons de ' + comp().nom)}${bascule('vibrations', 'Vibrations')}${bascule('cielAuto', 'Ciel selon l’heure', 'Jour, soir, nuit')}${bascule('grandTexte', 'Texte plus grand')}</div>
        <p class="etiquette">Démo · simuler la glycémie</p>
        <div class="carte"><p class="petit" style="margin-bottom:10px">Pour présenter le projet : choisis un état et retourne à l’accueil.</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${etats.map(([id, l]) => `<button class="chip ${S.etat === id ? 'actif' : ''}" style="border:2px solid #CDEAF4" data-act="etat" data-arg="${id}" aria-pressed="${S.etat === id}">${l}</button>`).join('')}</div></div>
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

  /* 9.4 / 9.9 Espace parent (version courte) */
  E.parent = () => `<section class="screen ciel" aria-labelledby="t-pa">${statut()}${entete('Espace parent')}
      <div class="scroll">
        <p class="etiquette">Alertes de Léo</p>
        <div class="carte">
          ${[['Urgence basse', 'Sous 3,1 mmol/L · toujours active', null], ['Basse', 'Sous 3,9 mmol/L', true], ['Haute', 'Au-dessus de 10,0 mmol/L', true], ['Monte ou descend vite', 'Prévenir avant que ça arrive', false]].map(([t, s, on]) => `<div class="ligne"><div class="grow"><div class="txt">${t}</div><div class="petit">${s}</div></div>${on === null ? `<span style="color:#5E6A72">${I.cadenas}</span>` : `<button class="bascule" role="switch" aria-checked="${on}" aria-label="${t}" data-act="basculeVisuelle"></button>`}</div>`).join('')}
        </div>
        <p class="etiquette">Quand et comment</p>
        <div class="carte"><div class="ligne"><div class="grow"><div class="txt">Heures calmes</div><div class="petit">Nuit 21 h à 7 h · École 8 h 15 à 15 h 30</div></div></div><div class="ligne"><div class="grow"><div class="txt">Qui reçoit les alertes</div><div class="petit">Maman, Papa, Mme Tremblay (école)</div></div></div></div>
        <p class="petit" style="margin:12px 8px">Les alertes urgentes sonnent toujours, même pendant les heures calmes. Aucune dose n’est calculée par l’app.</p>
        <button class="btn secondaire" data-act="accueil" style="margin-top:8px">Quitter le mode parent</button>
      </div></section>`;

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
    appelerMaman: () => {
      const v = document.createElement('div'); v.className = 'voile';
      v.innerHTML = `<div class="modale" role="dialog" aria-label="Appel à maman"><h2 class="h2">Appel à maman</h2><div style="width:120px;height:120px;border-radius:50%;background:#FFE7CC;margin:18px auto;display:grid;place-items:center;font-size:48px;font-weight:600;color:#A34E16">M</div><p class="txt">Ça sonne… <span class="petit">(simulation)</span></p><button class="btn" style="background:#D12F2F;color:#fff;margin-top:18px" data-act="raccrocher">Raccrocher</button></div>`;
      app.appendChild(v);
    },
    raccrocher: () => { const v = app.querySelector('.voile'); if (v) v.remove(); if (route.name === 'urgence') aller('reverif', null, true); },
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
      else S.objetsPlaces = S.objetsPlaces.includes(id) ? S.objetsPlaces.filter(x => x !== id) : S.objetsPlaces.slice(-1).concat(id);
      save(); rendre();
    },
    bascule: (cle) => { S[cle] = !S[cle]; save(); rendre(); },
    basculeVisuelle: (_, el) => el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'),
    etat: (id) => { S.etat = id; save(); if (id === 'urgence') aller('urgence'); else { rendre(); toast('État changé. Retourne à l’accueil pour voir ' + comp().nom + '.'); } },
    chiffre: (k) => { ui.code = ui.code || ''; if (k === '⌫') ui.code = ui.code.slice(0, -1); else if (ui.code.length < 4) ui.code += k; if (ui.code.length === 4) { if (ui.code === '1234') { ui = {}; aller('parent', null, true); return; } ui.code = ''; toast('Code incorrect. Essaie 1234 pour la démo.'); } rendre(); },
    reinit: () => { if (confirmerReinit()) { try { localStorage.removeItem('dk'); } catch (e) { /* rien */ } S = Object.assign({}, DEFAUT); ui = {}; pile.length = 0; aller('splash', null, true); } }
  };
  function confirmerReinit() { return window.confirm ? window.confirm('Recommencer la démo depuis le début ?') : true; }

  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-go],[data-tab]'); if (!t || t.disabled) return;
    if (t.dataset.tab) { ui = {}; pile.length = 0; const tab = t.dataset.tab; if (tab === 'accueil') aller('accueil', null, true); else { pile.push({ name: 'accueil', arg: null }); route = { name: 'accueil' }; aller(tab, null, true); } return; }
    if (t.dataset.go) { ui = route.name === t.dataset.go ? ui : {}; aller(t.dataset.go, t.dataset.arg || null); return; }
    const f = actions[t.dataset.act]; if (f) f(t.dataset.arg, t);
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
