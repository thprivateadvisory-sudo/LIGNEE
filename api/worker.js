/* Lignée · serveur de paiement (Cloudflare Worker).
   Rôle unique : préparer un paiement Stripe pour un souvenir et en donner l'état.
   Le paiement lui-même (carte, Apple Pay, Google Pay) s'affiche dans commande.html.

   Secret attendu : STRIPE_SECRET_KEY (jamais dans le code, voir .github/workflows/api.yml).
   Les prix sont fixés ICI, côté serveur : le navigateur ne peut pas les modifier. */

const SITE = 'https://maison-lignee.fr';
const ORIGINES = [SITE, 'https://www.maison-lignee.fr'];
const VERSION_STRIPE = '2026-10-28.endive'; // même série que js.stripe.com/endive/stripe.js

// Prix TTC en centimes, identiques aux pages doudou.html et coussin.html :
// 1er objet au prix plein, les suivants de la même commande au prix réduit,
// +10 € par pièce en grande taille, +5 € pour le retour à domicile (point relais inclus).
const PRODUITS = {
  doudou:  { nom: 'Doudou souvenir', premier: 9900, suivant: 7900, tailles: { petit: 'petit, environ 25 cm', grand: 'grand, environ 35 cm' } },
  coussin: { nom: 'Coussin souvenir', premier: 6900, suivant: 5500, tailles: { petit: '40 × 40 cm', grand: '50 × 50 cm' } }
};
const SUPPLEMENT_GRAND = 1000;
const RETOUR_DOMICILE = 500;
const QUANTITE_MAX = 20;

export function montant(p, taille, q, livraison) {
  const g = taille === 'grand' ? SUPPLEMENT_GRAND : 0;
  return (p.premier + g) + (q - 1) * (p.suivant + g) + (livraison === 'domicile' ? RETOUR_DOMICILE : 0);
}

function entetes(origine) {
  const ok = ORIGINES.includes(origine) || /^http:\/\/localhost(:\d+)?$/.test(origine || '');
  return {
    'Access-Control-Allow-Origin': ok ? origine : SITE,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8'
  };
}
function reponse(corps, statut, origine) {
  return new Response(JSON.stringify(corps), { status: statut, headers: entetes(origine) });
}
// Encodage des paramètres Stripe (objets et tableaux imbriqués).
export function encoder(obj, prefixe, sortie = []) {
  for (const cle of Object.keys(obj)) {
    const v = obj[cle];
    if (v === undefined || v === null || v === '') continue;
    const nom = prefixe ? `${prefixe}[${cle}]` : cle;
    if (typeof v === 'object') encoder(v, nom, sortie);
    else sortie.push(encodeURIComponent(nom) + '=' + encodeURIComponent(String(v)));
  }
  return sortie;
}
async function stripe(env, methode, chemin, params) {
  const r = await fetch('https://api.stripe.com/v1/' + chemin, {
    method: methode,
    headers: {
      'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
      'Stripe-Version': VERSION_STRIPE,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params ? encoder(params).join('&') : undefined
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Erreur Stripe');
  return j;
}
const court = (s, n) => String(s || '').trim().slice(0, n);

export function parametresSession(d) {
  const p = PRODUITS[d.p];
  if (!p) throw new Error('Objet inconnu');
  const q = Math.floor(Number(d.q));
  if (!(q >= 1 && q <= QUANTITE_MAX)) throw new Error('Quantité invalide');
  // E-mail facultatif : Apple Pay / Google Pay le fournissent, la carte le transmet au paiement.
  const email = court(d.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail invalide');
  const taille = d.taille === 'grand' ? 'grand' : 'petit';
  const livraison = d.livraison === 'domicile' ? 'domicile' : 'relais';
  const g = taille === 'grand' ? SUPPLEMENT_GRAND : 0;
  const nom = `${p.nom} (${p.tailles[taille]})`;
  const ligne = (name, amount, quantity) => ({ price_data: { currency: 'eur', unit_amount: amount, product_data: { name } }, quantity });
  const lignes = [ligne(nom, p.premier + g, 1)];
  if (q > 1) lignes.push(ligne(`${nom}, pièce${q > 2 ? 's' : ''} suivante${q > 2 ? 's' : ''}`, p.suivant + g, q - 1));
  if (livraison === 'domicile') lignes.push(ligne('Retour à domicile', RETOUR_DOMICILE, 1));
  const numero = court(d.numero, 40);
  const meta = {
    numero, objet: d.p, quantite: String(q), taille, livraison,
    nom: court(d.nom, 120), telephone: court(d.tel, 40), rappel: d.rappel ? 'oui' : '',
    message: court(d.message, 450)
  };
  return {
    mode: 'payment',
    ui_mode: 'elements',
    locale: 'fr',
    line_items: lignes,
    customer_email: email || undefined,
    client_reference_id: numero,
    return_url: SITE + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
    metadata: meta,
    payment_intent_data: { description: `${p.nom} × ${q} · ${numero}`, statement_descriptor_suffix: 'LIGNEE', metadata: meta },
    invoice_creation: { enabled: true, invoice_data: { description: 'Lignée · Souvenirs faits main', footer: 'Lignée · maison-lignee.fr · contact@maison-lignee.fr', metadata: { numero } } }
  };
}

export default {
  async fetch(req, env) {
    const origine = req.headers.get('Origin') || '';
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: entetes(origine) });
    try {
      if (url.pathname === '/session' && req.method === 'POST') {
        if (origine && !ORIGINES.includes(origine) && !/^http:\/\/localhost(:\d+)?$/.test(origine)) return reponse({ erreur: 'Origine refusée' }, 403, origine);
        const d = await req.json();
        const s = await stripe(env, 'POST', 'checkout/sessions', parametresSession(d));
        return reponse({ clientSecret: s.client_secret }, 200, origine);
      }
      if (url.pathname === '/session' && req.method === 'GET') {
        const id = url.searchParams.get('id') || '';
        if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return reponse({ erreur: 'Identifiant invalide' }, 400, origine);
        const s = await stripe(env, 'GET', 'checkout/sessions/' + id);
        return reponse({
          statut: s.status, paiement: s.payment_status, total: s.amount_total,
          email: s.customer_details && s.customer_details.email,
          nom: s.customer_details && s.customer_details.name,
          numero: s.client_reference_id,
          objet: s.metadata && s.metadata.objet, quantite: s.metadata && s.metadata.quantite,
          taille: s.metadata && s.metadata.taille, livraison: s.metadata && s.metadata.livraison
        }, 200, origine);
      }
      return reponse({ erreur: 'Introuvable' }, 404, origine);
    } catch (e) {
      return reponse({ erreur: e.message }, 400, origine);
    }
  }
};
