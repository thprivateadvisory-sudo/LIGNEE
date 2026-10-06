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

## Gamme photographiée (catalogue fournisseur)

Photos tirées du catalogue fournisseur, modèles de style européen uniquement, dans `images/catalogue/` :

| Modèle Lignée | Réf. fournisseur | Disponibilité | Prix proposé |
|---|---|---|---|
| Sobre | IT249 | En stock | 340 € |
| Tradition | IT266 | En stock | 690 € |
| Floral | IT277 | Sur commande | 890 € |
| Héritage | E666 | Sur commande | 1 190 € |

Finitions au choix (section « Personnaliser » de `cercueils.html`) : poignées H001, H005, H012, H032 ; emblèmes D051 (crucifix), D055 (croix latine), D010 (croix huguenote), D009 (étoile de David), D014 (rose) ; plaque DP011.

À confirmer auprès du fournisseur avant la mise en ligne : essence du bois (le site affirme « bois massif uniquement »), épaisseur réglementaire, compatibilité crémation des modèles Sobre, Tradition et Floral, délais réels des modèles sur commande.

Les trois garanties affichées (prix le plus bas garanti avec remboursement de la différence, bois massif contrôlé un par un avec remplacement en cas de défaut, livraison avant les obsèques ou remboursement) sont des engagements contractuels : à reprendre dans les CGV et à tenir dans la réalité, sinon ils deviennent une pratique commerciale trompeuse.

La vente de cercueils et d'urnes exige l'habilitation funéraire préfectorale, l'assurance obsèques l'inscription ORIAS : leurs numéros sont à renseigner dans `mentions-legales.html` avant toute vente.

## Vidéos

Les vidéos du dossier `videos/` viennent de Pexels (licence Pexels : utilisation libre, y compris commerciale, sans attribution obligatoire). Elles sont téléchargées et compressées par l'Action GitHub `.github/workflows/videos.yml` à partir de la liste `videos/sources.txt` (une ligne `final <id Pexels> <nom>` par vidéo). Pour en ajouter une, ajoutez une ligne et poussez : l'Action ajoute `videos/<nom>.mp4` et son image d'affiche `videos/<nom>.jpg`.
