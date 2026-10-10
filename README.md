# Lignée — site internet

Site statique de Lignée, maison funéraire au juste prix : cercueils et urnes à prix affichés (argument d'entrée), assurance obsèques, souvenirs confectionnés, puis succession et logement.

Un fichier HTML autonome par page (12 pages), tous au même niveau (styles et scripts inclus dans chaque page) :

| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `formules.html` | Nos formules (Essentiel, Complet, Sérénité) |
| `methode.html` | Comment ça marche |
| `souvenirs.html` | Confection souvenir (sur devis, formulaire de devis) |
| `cercueils.html` | Cercueils et urnes : gamme, prix TTC, comparaison avec le marché |
| `anticiper.html` | Assurance obsèques, coffret « Mes volontés », étude gratuite |
| `notaires.html` | Notaires et professionnels (formulaire pro) |
| `guide.html` | Guide gratuit : que faire après un décès |
| `a-propos.html` | À propos |
| `contact.html` | Contact et demande de visite gratuite |
| `mentions-legales.html` | Mentions légales |
| `confidentialite.html` | Politique de confidentialité |

Hébergement : GitHub Pages (aucune étape de build).

## Mettre le site en ligne

1. Sur GitHub : Settings → Pages.
2. Source : « Deploy from a branch », choisir la branche du site et le dossier `/ (root)`, puis Save.
3. Le site est en ligne en une ou deux minutes à l'adresse indiquée par GitHub.
4. Nom de domaine : dans Settings → Pages → Custom domain, saisir le domaine (ex. `lignee.fr`), puis créer chez le registraire les enregistrements DNS indiqués par GitHub. Cocher ensuite « Enforce HTTPS ».

Le fichier `.nojekyll` indique à GitHub Pages de servir les fichiers tels quels.

## À compléter avant la mise en ligne

Rechercher et remplacer dans les 9 fichiers :

- `03 XX XX XX XX` et `tel:03XXXXXXXX` : numéro de téléphone dédié.
- `33XXXXXXXXX` (lien `wa.me`) : numéro WhatsApp, au format international sans `+`.
- `A_RENSEIGNER` : clé d'accès Web3Forms (https://web3forms.com), pour que les formulaires envoient les demandes par e-mail. Tant qu'elle n'est pas renseignée, les formulaires affichent un message invitant à appeler.
- `à compléter` (mentions légales, confidentialité) : capital, siège, SIREN/RCS, TVA, directeur de publication, une fois la SAS créée.
- `contact@lignee.fr` et `https://lignee.fr` (balises canoniques, `sitemap.xml`, `robots.txt`) si le domaine final est différent.

À faire relire par un juriste : mentions légales, confidentialité, guide « que faire après un décès ». Les CGV restent à rédiger avant le premier dossier.

## Prix et engagements à valider avant la mise en ligne

Les prix de la gamme (cercueils 340 à 1 190 €, urnes 49 à 149 €), la livraison incluse et les descriptions des modèles sont des propositions à valider avec les coûts fournisseurs. Rechercher `340&nbsp;€`, `690&nbsp;€`, etc. dans `index.html` et `cercueils.html`.

## Catalogue imprimé

`catalogue/Lignee-catalogue-2026.pdf` : 8 pages A4 pour la boutique (couverture, pourquoi Lignée a été créée, comment choisir, modèles en stock, modèles sur commande, finitions, urnes et garanties, contact avec QR code et cachet du conseiller).

- Format fini A4 (210 × 297 mm), fonds perdus de 3 mm inclus (fichier en 216 × 303 mm), sans traits de coupe. Polices intégrées (TrueType). Couleurs en RVB : l'imprimeur les convertit en CMJN.
- Conseil d'impression : 8 pages, piqûre à cheval (2 agrafes), papier couché demi-mat 170 g.
- Régénérer après modification de `catalogue/catalogue.html` : `python3 catalogue/generer.py` (Playwright et Chromium).
- Avant impression, remplacer dans `catalogue/catalogue.html` : le téléphone `03 XX XX XX XX`, le numéro d'habilitation `XX-XX-XXX`, et vérifier que `lignee.fr` est en ligne (le QR code pointe vers `https://lignee.fr/cercueils.html`). Faire valider prix et engagements comme pour le site.
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
