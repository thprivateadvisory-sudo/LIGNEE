# Lignée — site internet

Site statique de Lignée, maison funéraire au juste prix : cercueils et urnes à prix affichés (argument d'entrée), assurance obsèques, souvenirs confectionnés, puis succession et logement.

Un fichier HTML autonome par page (12 pages), tous au même niveau (styles et scripts inclus dans chaque page) :

| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `formules.html` | Nos formules (Essentiel, Complet, Sérénité) |
| `methode.html` | Comment ça marche |
| `souvenirs.html` | Confection souvenir : fiche détaillée au clic sur chaque objet, devis pour le reste |
| `commande.html` | Page de paiement des souvenirs à prix fixe (`commande.html?p=doudou`) |
| `merci.html` | Confirmation de commande (retour de Stripe : `merci.html?paye=1`) |
| `cercueils.html` | Cercueils et urnes : gamme, prix TTC, comparaison avec le marché |
| `anticiper.html` | Assurance obsèques, coffret « Mes volontés », étude gratuite |
| `notaires.html` | Notaires et professionnels (formulaire pro) |
| `guide.html` | Guide gratuit : que faire après un décès |
| `a-propos.html` | À propos |
| `contact.html` | Contact et demande de visite gratuite |
| `mentions-legales.html` | Mentions légales |
| `cgv.html` | Conditions générales de vente |
| `confidentialite.html` | Politique de confidentialité |

Hébergement : GitHub Pages (aucune étape de build).

## Mettre le site en ligne

1. Sur GitHub : Settings → Pages.
2. Source : « Deploy from a branch », choisir la branche du site et le dossier `/ (root)`, puis Save.
3. Le site est en ligne en une ou deux minutes à l'adresse indiquée par GitHub.
4. Nom de domaine : dans Settings → Pages → Custom domain, saisir le domaine (ex. `lignee.fr`), puis créer chez le registraire les enregistrements DNS indiqués par GitHub. Cocher ensuite « Enforce HTTPS ».

Polices : Cormorant Garamond et Inter sont hébergées avec le site dans `polices/` (licence SIL OFL), sans appel à Google Fonts. Les adresses canoniques et `sitemap.xml` utilisent les URL sans `.html` (ex. `https://lignee.fr/contact`), que GitHub Pages sert directement.

Le fichier `.nojekyll` indique à GitHub Pages de servir les fichiers tels quels.

## À compléter avant la mise en ligne

Rechercher et remplacer dans les 9 fichiers :

- Téléphone et WhatsApp : volontairement absents au lancement (pas encore de centre d'appels). Le contact passe par « Être rappelé » (formulaire de `contact.html#formulaire`) et par e-mail. À l'arrivée d'un numéro en 09 ou 03, le rajouter dans l'en-tête, le pied de page, la barre mobile, `contact.html`, le catalogue imprimé et les messages d'erreur des formulaires.
- Formulaires : clé Web3Forms installée (variable `CLE` dans chaque page). Les demandes arrivent sur l'adresse du compte Web3Forms.
- Mentions légales : seul le nom (LIGNÉE) et l'e-mail sont affichés. Les autres lignes (forme, capital, siège, SIREN/RCS, TVA, directeur de publication, habilitation, ORIAS) sont en commentaire HTML dans `mentions-legales.html` : les compléter puis les décommenter. Idem pour le médiateur (section « Médiation »). Le siège peut aussi être ajouté dans `confidentialite.html`.
- `contact@lignee.fr` et `https://lignee.fr` (balises canoniques, `sitemap.xml`, `robots.txt`) si le domaine final est différent.

À faire relire par un juriste : mentions légales, confidentialité, guide « que faire après un décès ». Les CGV (`cgv.html`, liées dans le pied de page) sont une première version à faire valider par le juriste, notamment les conditions des trois garanties et le droit de rétractation.

## Prix et engagements à valider avant la mise en ligne

Les prix de la gamme (cercueils 340 à 1 190 €, urnes 49 à 149 €), la livraison incluse et les descriptions des modèles sont des propositions à valider avec les coûts fournisseurs. Rechercher `340&nbsp;€`, `690&nbsp;€`, etc. dans `index.html` et `cercueils.html`.

## Catalogue imprimé

`catalogue/Lignee-catalogue-2026.pdf` : 8 pages A4 pour la boutique (couverture, pourquoi Lignée a été créée, comment choisir, modèles en stock, modèles sur commande, finitions, urnes et garanties, contact avec QR code et cachet du conseiller).

- Format fini A4 (210 × 297 mm), fonds perdus de 3 mm inclus (fichier en 216 × 303 mm), sans traits de coupe. Polices intégrées (TrueType). Couleurs en RVB : l'imprimeur les convertit en CMJN.
- Conseil d'impression : 8 pages, piqûre à cheval (2 agrafes), papier couché demi-mat 170 g.
- Régénérer après modification de `catalogue/catalogue.html` : `python3 catalogue/generer.py` (Playwright et Chromium).
- Avant impression, remplacer dans `catalogue/catalogue.html` : le numéro d'habilitation `XX-XX-XXX`, et vérifier que `lignee.fr` est en ligne (le QR code pointe vers `https://lignee.fr/cercueils.html`). Faire valider prix et engagements comme pour le site.
- Les photos viennent du PDF fournisseur (environ 180 ppi réels une fois imprimées) : avec les photos haute définition du fabricant, l'impression sera plus nette.

## Fiche produit et vue 3D

Un clic sur un cercueil (page `cercueils.html`, ou lien `cercueils.html#modele-heritage` depuis n'importe quelle page) ouvre sa fiche : vue 3D à faire tourner, photo réelle, choix de la teinte, des poignées, de l'emblème, du capiton et de la gravure de la plaque, caractéristiques, conformité, livraison. « Demander ce cercueil » ouvre `contact.html` avec la demande pré-remplie.

Fichiers dans `js/` : `fiche.js` (fiche, données des modèles), `cercueil3d.js` (modèles 3D construits en code d'après les photos), `three.module.min.js`, `OrbitControls.js`, `RoomEnvironment.js` (Three.js r160, licence MIT, hébergé avec le site). La 3D ne se charge qu'à l'ouverture d'une fiche ; sans WebGL, la fiche reste utilisable avec la photo.

À confirmer auprès du fournisseur : les cinq teintes (chêne clair, naturel, miel, acajou, noyer) et les trois capitons (blanc, ivoire, champagne) proposés pour chaque modèle, et la remise d'une attestation de conformité du fabricant (promise dans l'onglet Conformité).

## Souvenirs : forfaits à prix fixe

Page `souvenirs.html`, « Fait dans nos ateliers » (à n'afficher que pour ce qui est réellement confectionné par Lignée). Prix proposés, à valider avec les coûts réels :

| Forfait | Prix TTC |
|---|---|
| Coussin | 59 € |
| Doudou | 89 € |
| Cadre | 69 € |
| Boîte en bois | 149 € |
| Bijou empreinte digitale ou écriture | 129 € |
| Bijou mèche de cheveux | 149 € |

Offre affichée : à partir de trois objets, le quatrième est offert. Section « Votre idée, nous la fabriquons » : tout autre objet sur devis gratuit sous 48 heures. Aucun bijou contenant des cendres (interdit par la loi).

## Gamme photographiée (catalogue fournisseur)

Photos tirées du catalogue fournisseur, modèles de style européen uniquement, dans `images/catalogue/` :

| Modèle Lignée | Réf. fournisseur | Disponibilité | Prix proposé |
|---|---|---|---|
| Sobre | IT249 | En stock | 340 € |
| Tradition | IT266 | En stock | 690 € |
| Floral | IT277 | Sur commande | 890 € |
| Héritage | E666 | Sur commande | 1 190 € |

Finitions au choix (section « Personnaliser » de `cercueils.html`) : poignées H001, H005, H012, H032 ; emblèmes D051 (crucifix), D055 (croix latine), D010 (croix huguenote), D009 (étoile de David), D014 (rose) ; plaque DP011.

Engagements affichés à tenir réellement (sections « Notre contrôle qualité » et « Vérifiez ») : contrôle en quatre points de chaque cercueil (bois, finitions, intérieur, commande), devis signé avant toute commande, paiement après signature, adhésion à un médiateur de la consommation, numéro d'habilitation dans les mentions légales.

À confirmer auprès du fournisseur avant la mise en ligne : essence du bois (le site affirme « bois massif uniquement »), épaisseur réglementaire, compatibilité crémation des modèles Sobre, Tradition et Floral, délais réels des modèles sur commande.

Les trois garanties affichées (prix le plus bas garanti avec remboursement de la différence, bois massif contrôlé un par un avec remplacement en cas de défaut, livraison avant les obsèques ou remboursement) sont des engagements contractuels : à reprendre dans les CGV et à tenir dans la réalité, sinon ils deviennent une pratique commerciale trompeuse.

La vente de cercueils et d'urnes exige l'habilitation funéraire préfectorale, l'assurance obsèques l'inscription ORIAS : leurs numéros sont à renseigner dans `mentions-legales.html` avant toute vente.

## Vidéos

Les vidéos du dossier `videos/` viennent de Pexels (licence Pexels : utilisation libre, y compris commerciale, sans attribution obligatoire). Elles sont téléchargées et compressées par l'Action GitHub `.github/workflows/videos.yml` à partir de la liste `videos/sources.txt` (une ligne `final <id Pexels> <nom>` par vidéo). Pour en ajouter une, ajoutez une ligne et poussez : l'Action ajoute `videos/<nom>.mp4` et son image d'affiche `videos/<nom>.jpg`.

## Objection « pompe funèbre » (test persona, novembre 2026)

Sur 20 familles simulées, 20 refusent pour la même raison : leur pompe funèbre. Réponses ajoutées au site, à tenir dans la réalité :

- Lignée appelle elle-même la pompe funèbre et obtient son **accord écrit avant tout paiement** (copie au client). Sans accord, rien n'est dû (CGV art. 2 et 4).
- Garantie « Livré à temps » : créneau écrit, et en cas d'imprévu **un cercueil en stock de valeur égale ou supérieure livré sans supplément** (CGV art. 6). Obsèques dans les 7 jours : modèles en stock uniquement (CGV art. 5). Cela suppose un stock réel et un transporteur express.
- Calculateur d'économie (`cercueils.html#economie`) : prix du cercueil sur le devis de la pompe funèbre, comparé au modèle Lignée.
- Nouvelle page `pompes-funebres.html` : programme partenaire (charte de réception sans frais de manutention, familles adressées, tarifs pros sur demande). À créer réellement : la charte d'une page et la liste des partenaires.
- À faire valider par le juriste : la phrase de la FAQ sur le libre choix du prestataire et la ligne cercueil séparée sur le devis.

## Lancement (novembre 2026) : en attendant l'habilitation et l'ORIAS

- Le site ne mentionne plus l'habilitation préfectorale (encart remplacé par « Aucune pression »). **Aucune vente de cercueil ou d'urne avant l'habilitation** : on recueille des demandes et on rappelle, sans signer de devis.
- Assurance obsèques : Lignée n'est pas intermédiaire. Elle transmet la demande à un partenaire immatriculé à l'ORIAS (consentement dans le formulaire, mention dans `confidentialite.html`). Au rappel, ne pas présenter ni conseiller de contrat : passer la main au partenaire. Piste : se faire inscrire comme mandataire d'intermédiaire par ce partenaire.
- Quand les numéros arrivent : les renseigner dans `mentions-legales.html` et remettre l'encart « Habilitation préfectorale » (historique git).

## Souvenirs : commande et paiement en ligne

Parcours : clic sur un objet (`souvenirs.html`, ou lien direct `souvenirs.html#doudou`) → fiche avec tout expliqué (ce que l'on reçoit, ce qu'il faut confier, délai, étapes, garanties, questions) → « Commander » → `commande.html?p=doudou` (quantité, coordonnées, CGV) → paiement Stripe → `merci.html?paye=1`. Clés : `coussin`, `doudou`, `cadre`, `boite`, `empreinte`, `ecriture`, `meche`. Les objets sur devis (numérisation, livre, film, arbre) ont aussi une fiche, qui renvoie au formulaire de devis pré-rempli.

Textes, prix et liens de paiement : un seul fichier, `js/souvenirs.js`.

**Brancher le paiement (à faire une fois)** : dans Stripe, créer un lien de paiement (Payment Link) par objet, au même prix TTC, avec « ajuster la quantité » autorisé (1 à 10) et la redirection après paiement vers `https://lignee.fr/merci?paye=1`. Coller chaque lien dans `STRIPE` en haut de `js/souvenirs.js`. Le site transmet l'e-mail du client et un numéro de commande (`client_reference_id`, ex. `LS-261119-AB12`) qu'on retrouve dans Stripe et dans l'e-mail de commande Web3Forms (adresse, variante du bijou, prénom du proche, message).

Tant qu'un lien est vide, la commande arrive quand même par e-mail et le client lit qu'il reçoit son lien de paiement sécurisé dans l'heure (jours ouvrés) : il faut alors lui envoyer un lien Stripe à la main.

Quatrième objet offert : le lien Stripe encaisse le prix plein, la page affiche le total remisé. **Rembourser le quatrième objet dans Stripe sous 48 h** (CGV art. 9).

Engagements affichés, à tenir réellement (et à valider) : étiquette d'envoi prépayée sous 24 h ouvrées, photo de l'objet avant expédition, livraison offerte en France métropolitaine, remboursement intégral si les affaires ne permettent pas la confection, annulation remboursée tant que la confection n'a pas commencé, restitution des affaires. Dimensions et délais des fiches (doudou 30 cm, coussin 40 × 40 cm, cadre 13 × 18, boîte 25 × 18 × 10 cm, 3 à 4 semaines) et détails (étiquette avec prénom, boutons en façade, écrin, épreuve avant gravure) : à confirmer avec l'atelier, sinon les corriger dans `js/souvenirs.js`. CGV art. 2, 4 et 9 et `confidentialite.html` (Stripe) mis à jour : à faire relire par le juriste.
