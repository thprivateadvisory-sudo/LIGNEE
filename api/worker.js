/* Lignée · serveur de paiement (Cloudflare Worker).
   Rôle unique : préparer un paiement Stripe pour un souvenir et en donner l'état.
   Le paiement lui-même (carte, Apple Pay, Google Pay) s'affiche dans commande.html.

   Secret attendu : STRIPE_SECRET_KEY (jamais dans le code, voir .github/workflows/api.yml).
   Les prix sont fixés ICI, côté serveur : le navigateur ne peut pas les modifier. */

const SITE = 'https://maison-lignee.fr';
const ORIGINES = [SITE, 'https://www.maison-lignee.fr'];
const VERSION_STRIPE = '2026-10-28.endive'; // même série que js.stripe.com/endive/stripe.js

// Prix TTC en centimes. À garder identiques à js/souvenirs.js.
const PRODUITS = {
  coussin:   { nom: 'Coussin souvenir Lignée', prix: 5900 },
  doudou:    { nom: 'Doudou souvenir Lignée', prix: 8900 },
  cadre:     { nom: 'Cadre souvenir Lignée', prix: 6900 },
  boite:     { nom: 'Boîte en bois souvenir Lignée', prix: 14900 },
  empreinte: { nom: 'Bijou empreinte digitale Lignée', prix: 12900 },
  ecriture:  { nom: 'Bijou écriture manuscrite Lignée', prix: 12900 },
  meche:     { nom: 'Bijou mèche de cheveux Lignée', prix: 14900 }
};
const VARIANTES = ['', 'Pendentif', 'Bague', 'Bracelet'];

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
  if (!(q >= 1 && q <= 10)) throw new Error('Quantité invalide');
  const email = court(d.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail invalide');
  const variante = VARIANTES.includes(d.variante) ? d.variante : '';
  const offerts = Math.floor(q / 4);
  const nom = p.nom + (variante ? ' (' + variante.toLowerCase() + ')' : '');
  const ligne = offerts
    ? { price_data: { currency: 'eur', unit_amount: p.prix * (q - offerts), product_data: { name: `${nom} × ${q}, dont ${offerts} offert${offerts > 1 ? 's' : ''}` } }, quantity: 1 }
    : { price_data: { currency: 'eur', unit_amount: p.prix, product_data: { name: nom } }, quantity: q };
  const numero = court(d.numero, 40);
  const meta = {
    numero, objet: d.p, quantite: String(q), variante,
    nom: court(d.nom, 120), telephone: court(d.tel, 40),
    adresse: court([d.adresse, d.cp, d.ville].filter(Boolean).join(', '), 450),
    proche: court(d.proche, 120), message: court(d.message, 450)
  };
  return {
    mode: 'payment',
    ui_mode: 'elements',
    locale: 'fr',
    line_items: [ligne],
    customer_email: email,
    client_reference_id: numero,
    return_url: SITE + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
    metadata: meta,
    payment_intent_data: { description: nom + ' · ' + numero, statement_descriptor_suffix: 'LIGNEE', metadata: meta },
    invoice_creation: { enabled: true, invoice_data: { description: 'Lignée · Souvenirs faits main', footer: 'Lignée · maison-lignee.fr · contact@lignee.fr', metadata: { numero } } }
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
          email: s.customer_details && s.customer_details.email, numero: s.client_reference_id
        }, 200, origine);
      }
      return reponse({ erreur: 'Introuvable' }, 404, origine);
    } catch (e) {
      return reponse({ erreur: e.message }, 400, origine);
    }
  }
};
