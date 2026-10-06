// Fiche produit des cercueils : vue 3D ou photo réelle, personnalisation, caractéristiques et conformité.
const TEINTES = [ // hex : teinte mesurée sur les photos ; base : couleur donnée au moteur 3D pour la restituer
  { id: 'clair', nom: 'Chêne clair', hex: '#D4AF7D', base: '#D8B37F' },
  { id: 'naturel', nom: 'Naturel', hex: '#C17C41', base: '#DA8C44' },
  { id: 'miel', nom: 'Miel', hex: '#AC7C46', base: '#C18B49' },
  { id: 'acajou', nom: 'Acajou', hex: '#80472A', base: '#8D4315' },
  { id: 'noyer', nom: 'Noyer', hex: '#4F2E1C', base: '#572A0E' },
];
const POIGNEES = [
  { id: 'barre', nom: 'Barre', metal: 'bronze-vieilli', detail: 'Bronze vieilli', img: 'poignee-barre' },
  { id: 'demi-lune', nom: 'Demi-lune', metal: 'laiton-vieilli', detail: 'Laiton vieilli', img: 'poignee-demi-lune' },
  { id: 'etrier', nom: 'Étrier', metal: 'laiton', detail: 'Laiton', img: 'poignee-etrier' },
  { id: 'rosaces', nom: 'À rosaces', metal: 'laiton-vieilli', detail: 'Laiton vieilli', img: 'poignee-rosaces' },
];
const EMBLEMES = [
  { id: 'sans', nom: 'Sans emblème' },
  { id: 'crucifix', nom: 'Crucifix', img: 'emblem-crucifix' },
  { id: 'croix', nom: 'Croix latine', img: 'emblem-croix' },
  { id: 'huguenote', nom: 'Croix huguenote', img: 'emblem-huguenote' },
  { id: 'etoile', nom: 'Étoile de David', img: 'emblem-etoile' },
  { id: 'rose', nom: 'Rose', img: 'emblem-rose' },
];
const CAPITONS = [
  { id: 'blanc', nom: 'Blanc', hex: '#F3F1EC' },
  { id: 'ivoire', nom: 'Ivoire', hex: '#EEE3CC' },
  { id: 'champagne', nom: 'Champagne', hex: '#E2CDA8' },
];

const CONFORMITE = [
  "Bois d'une épaisseur minimale de 22&nbsp;mm après finition, comme l'exige l'article R2213-25 du Code général des collectivités territoriales.",
  'Garniture intérieure étanche, en matériau biodégradable.',
  'Contrôlé un par un avant expédition&nbsp;: bois, finitions, intérieur, accessoires posés.',
  'Attestation de conformité du fabricant remise sur simple demande.',
];

const MODELES = {
  sobre: {
    nom: 'Sobre', prix: '340', stock: true, usage: 'Inhumation ou crémation', cremation: true,
    accroche: 'La simplicité, sans rien céder sur la qualité.',
    teinte: 'naturel', poignee: 'demi-lune', embleme: 'sans',
    carac: [['Forme', 'Parisienne, lignes droites'], ['Couvercle', 'À pans, cache-vis dorés'], ['Finition', 'Vernis naturel satiné'], ['Poignées', '4, au choix'], ['Capiton', 'Coton, avec oreiller'], ['Taille', 'Adulte standard. Autres tailles sur demande']],
  },
  tradition: {
    nom: 'Tradition', prix: '690', stock: true, usage: 'Inhumation ou crémation', cremation: true,
    accroche: 'Le classique des familles françaises, aux flancs galbés.',
    teinte: 'miel', poignee: 'barre', embleme: 'croix',
    carac: [['Forme', 'Parisienne, flancs galbés'], ['Couvercle', 'Mouluré, cache-vis dorés'], ['Finition', 'Satinée'], ['Poignées', '6, au choix'], ['Capiton', 'Satiné, avec oreiller'], ['Taille', 'Adulte standard. Autres tailles sur demande']],
  },
  floral: {
    nom: 'Floral', prix: '890', stock: false, usage: 'Inhumation ou crémation', cremation: true,
    accroche: 'Une gravure florale en bas-relief sur chaque flanc.',
    teinte: 'clair', poignee: 'etrier', embleme: 'sans',
    carac: [['Forme', 'Parisienne, gravure florale en bas-relief'], ['Couvercle', 'Bord arrondi'], ['Finition', 'Vernis brillant'], ['Poignées', '4, au choix'], ['Capiton', 'Satiné, avec oreiller'], ['Taille', 'Adulte standard. Autres tailles sur demande']],
  },
  heritage: {
    nom: 'Héritage', prix: '1 190', stock: false, usage: 'Inhumation', cremation: false,
    accroche: 'Notre modèle signature, verni comme un meuble de famille.',
    teinte: 'acajou', poignee: 'demi-lune', embleme: 'sans',
    carac: [['Forme', 'Parisienne, socle à gradins, bandeau mouluré'], ['Couvercle', 'En pointe de diamant'], ['Finition', 'Vernis brillant'], ['Poignées', '6, au choix'], ['Capiton', 'Brodé, avec oreiller'], ['Taille', 'Adulte standard. Autres tailles sur demande']],
  },
};

const d = document, dlg = d.getElementById('fiche');
if (dlg) init();

function init() {
  const $ = s => dlg.querySelector(s);
  let vue3d = null, chargement = null, cle = null, etat = {};

  // Choix (générés une fois)
  const radios = (nom, liste, rendu) => liste.map(o => `<label class="opt-${nom}"><input type="radio" name="${nom}" value="${o.id}">${rendu(o)}</label>`).join('');
  $('[data-choix="teinte"]').innerHTML = radios('teinte', TEINTES, o => `<span class="pastille" style="--c:${o.hex}"></span><span class="lib">${o.nom}</span>`);
  $('[data-choix="poignee"]').innerHTML = radios('poignee', POIGNEES, o => `<span class="vig"><img src="images/catalogue/${o.img}.webp" alt="" loading="lazy"></span><span class="lib">${o.nom}<small>${o.detail}</small></span>`);
  $('[data-choix="embleme"]').innerHTML = radios('embleme', EMBLEMES, o => `<span class="vig">${o.img ? `<img src="images/catalogue/${o.img}.webp" alt="" loading="lazy">` : '<em>Aucun</em>'}</span><span class="lib">${o.nom}</span>`);
  $('[data-choix="capiton"]').innerHTML = radios('capiton', CAPITONS, o => `<span class="pastille" style="--c:${o.hex}"></span><span class="lib">${o.nom}</span>`);

  function config() {
    const m = MODELES[cle], p = POIGNEES.find(x => x.id === etat.poignee);
    return {
      modele: cle,
      teinte: TEINTES.find(x => x.id === etat.teinte).base, capiton: CAPITONS.find(x => x.id === etat.capiton).hex,
      poignee: etat.poignee, metal: p.metal, embleme: etat.embleme, l1: etat.l1, l2: etat.l2,
    };
  }

  function resume() {
    const m = MODELES[cle], n = (l, id) => l.find(x => x.id === id).nom;
    const txt = `Modèle ${m.nom} (${m.prix} €) · teinte ${n(TEINTES, etat.teinte)} · poignées ${n(POIGNEES, etat.poignee)} · emblème ${n(EMBLEMES, etat.embleme)} · capiton ${n(CAPITONS, etat.capiton)}` + (etat.l1 ? ` · gravure : ${etat.l1}${etat.l2 ? ', ' + etat.l2 : ''}` : '');
    $('[data-resume]').textContent = txt;
    $('[data-commander]').href = 'contact.html?sujet=cercueil&choix=' + encodeURIComponent(txt) + '#formulaire';
  }

  function maj3d() { if (vue3d) vue3d.afficher(config()); }

  function remplir() {
    const m = MODELES[cle];
    $('[data-nom]').textContent = m.nom;
    $('[data-accroche]').textContent = m.accroche;
    $('[data-usage]').textContent = m.usage;
    $('[data-prix]').innerHTML = `${m.prix}&nbsp;€`;
    const dsp = $('[data-dispo]'); dsp.textContent = m.stock ? 'En stock' : 'Sur commande'; dsp.classList.toggle('cmd', !m.stock);
    $('[data-carac]').innerHTML = m.carac.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    $('[data-conformite]').innerHTML = CONFORMITE.concat(m.cremation ? ["Apte à la crémation&nbsp;: préparé selon les exigences du crématorium."] : ["Destiné à l'inhumation."]).map(t => `<li>${t}</li>`).join('');
    $('[data-livraison]').innerHTML = m.stock
      ? "En stock&nbsp;: livré avant les obsèques, à la pompe funèbre de votre choix, partout en France métropolitaine. Sinon, intégralement remboursé."
      : "Sur commande&nbsp;: délai garanti par écrit sur le devis, avant toute signature. Idéal pour préparer ses obsèques à l'avance, dans le cadre d'un contrat obsèques.";
    const ph = $('.vue-photo img'); ph.src = `images/catalogue/cercueil-${cle}.webp`; ph.alt = `Photo du modèle ${m.nom}`;
    for (const k of ['teinte', 'poignee', 'embleme', 'capiton']) dlg.querySelector(`input[name="${k}"][value="${etat[k]}"]`).checked = true;
    $('[data-l1]').value = etat.l1; $('[data-l2]').value = etat.l2;
    dlg.querySelectorAll('[data-modele-nav]').forEach(b => b.setAttribute('aria-current', b.dataset.modeleNav === cle ? 'true' : 'false'));
    resume(); maj3d();
  }

  function charger3d() {
    if (chargement) return chargement;
    const zone = $('.vue-3d');
    if (!window.WebGLRenderingContext) { zone.classList.add('sans-3d'); return (chargement = Promise.resolve()); }
    chargement = import('./cercueil3d.js').then(mod => {
      vue3d = mod.creerVue($('.vue-3d canvas'));
      zone.classList.add('pret');
      if (dlg.open) { vue3d.demarrer(); maj3d(); }
    }).catch(() => zone.classList.add('sans-3d'));
    return chargement;
  }

  function ouvrir(k) {
    if (!MODELES[k]) return;
    const m = MODELES[k];
    cle = k; etat = { teinte: m.teinte, poignee: m.poignee, embleme: m.embleme, capiton: 'blanc', l1: '', l2: '' };
    if (!dlg.open) { dlg.showModal(); d.documentElement.classList.add('fiche-ouverte'); }
    montrer('3d'); remplir();
    charger3d().then(() => { if (vue3d) { vue3d.demarrer(); vue3d.couvercle(false); } });
    if (location.hash !== '#modele-' + k) history.replaceState(null, '', '#modele-' + k);
  }

  function montrer(q) {
    dlg.querySelectorAll('[data-onglet]').forEach(b => b.setAttribute('aria-selected', b.dataset.onglet === q ? 'true' : 'false'));
    $('.vue-3d').hidden = q !== '3d'; $('.vue-photo').hidden = q !== 'photo';
    if (vue3d) q === '3d' ? vue3d.demarrer() : vue3d.arreter();
  }

  dlg.addEventListener('close', () => {
    if (vue3d) vue3d.arreter();
    d.documentElement.classList.remove('fiche-ouverte');
    if (location.hash.startsWith('#modele-')) history.replaceState(null, '', location.pathname + location.search);
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('[data-fermer]').addEventListener('click', () => dlg.close());
  dlg.querySelectorAll('[data-onglet]').forEach(b => b.addEventListener('click', () => montrer(b.dataset.onglet)));
  dlg.querySelectorAll('[data-modele-nav]').forEach(b => b.addEventListener('click', () => ouvrir(b.dataset.modeleNav)));
  dlg.querySelectorAll('[data-vue]').forEach(b => b.addEventListener('click', () => vue3d && vue3d.vue(b.dataset.vue)));
  dlg.querySelectorAll('[data-tourner]').forEach(b => b.addEventListener('click', () => vue3d && vue3d.tourner(+b.dataset.tourner)));
  dlg.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => vue3d && vue3d.zoomer(+b.dataset.zoom)));
  const btnCouv = $('[data-couvercle]');
  btnCouv.addEventListener('click', () => {
    const o = btnCouv.getAttribute('aria-pressed') !== 'true';
    btnCouv.setAttribute('aria-pressed', o); btnCouv.textContent = o ? 'Refermer' : 'Ouvrir le couvercle';
    vue3d && vue3d.couvercle(o);
  });
  dlg.addEventListener('change', e => {
    const n = e.target.name;
    if (['teinte', 'poignee', 'embleme', 'capiton'].includes(n)) {
      etat[n] = e.target.value; resume(); maj3d();
      if (n === 'capiton' && vue3d && btnCouv.getAttribute('aria-pressed') !== 'true') btnCouv.click();
    }
  });
  let tempo;
  dlg.addEventListener('input', e => {
    if (!e.target.matches('[data-l1],[data-l2]')) return;
    etat.l1 = $('[data-l1]').value.trim(); etat.l2 = $('[data-l2]').value.trim(); resume();
    clearTimeout(tempo); tempo = setTimeout(() => { if (vue3d) { vue3d.graver(etat.l1, etat.l2); vue3d.vue('dessus'); } }, 250);
  });

  d.addEventListener('click', e => {
    const a = e.target.closest('[data-modele]');
    if (!a) return;
    e.preventDefault(); ouvrir(a.dataset.modele);
  });
  const h = location.hash.match(/^#modele-(\w+)/);
  if (h) ouvrir(h[1]);
  addEventListener('hashchange', () => { const m = location.hash.match(/^#modele-(\w+)/); if (m && m[1] !== cle) ouvrir(m[1]); });
  // Précharge la 3D quand la gamme approche de l'écran.
  const g = d.getElementById('prix');
  if (g && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); import('./cercueil3d.js').catch(() => {}); } }, { rootMargin: '400px' });
    io.observe(g);
  }
}
