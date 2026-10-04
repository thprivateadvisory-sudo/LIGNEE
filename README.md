# Lignée — site internet

Site statique de Lignée (accompagnement du logement après un décès), construit d'après le business plan et le kit de construction.

Un fichier HTML autonome par page (12 pages), tous au même niveau (styles et scripts inclus dans chaque page) :

| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `formules.html` | Nos formules (Essentiel, Complet, Sérénité) |
| `methode.html` | Comment ça marche |
| `souvenirs.html` | Confection souvenir (sur devis, formulaire de devis) |
| `boutique.html` | Boutique (ouverture prochaine, liste d'attente) |
| `anticiper.html` | Coffret « Mes volontés », assurance obsèques, cercueils et urnes (bientôt, liste d'attente) |
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

Cercueils, urnes et assurance obsèques sont présentés comme « bientôt », sans prix ni vente : ils ne pourront être proposés qu'après l'habilitation funéraire préfectorale et l'inscription ORIAS.

## Vidéos

Les vidéos du dossier `videos/` viennent de Pexels (licence Pexels : utilisation libre, y compris commerciale, sans attribution obligatoire). Elles sont téléchargées et compressées par l'Action GitHub `.github/workflows/videos.yml` à partir de la liste `videos/sources.txt` (une ligne `final <id Pexels> <nom>` par vidéo). Pour en ajouter une, ajoutez une ligne et poussez : l'Action ajoute `videos/<nom>.mp4` et son image d'affiche `videos/<nom>.jpg`.
