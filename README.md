# Lignée — site internet

Site statique de Lignée (accompagnement du logement après un décès), construit d'après le business plan et le kit de construction.

Un fichier HTML autonome par page, tous au même niveau (styles et scripts inclus dans chaque page) :

| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `formules.html` | Nos formules (Essentiel, Complet, Sérénité) |
| `methode.html` | Comment ça marche |
| `notaires.html` | Notaires et professionnels (formulaire pro) |
| `guide.html` | Guide gratuit : que faire après un décès |
| `a-propos.html` | À propos |
| `contact.html` | Contact et demande de visite gratuite |
| `mentions-legales.html` | Mentions légales |
| `confidentialite.html` | Politique de confidentialité |

Déploiement : GitHub + Vercel (aucune étape de build, `vercel.json` active les URL sans `.html`).

## À compléter avant la mise en ligne

Rechercher et remplacer dans les 9 fichiers :

- `03 XX XX XX XX` et `tel:03XXXXXXXX` : numéro de téléphone dédié.
- `33XXXXXXXXX` (lien `wa.me`) : numéro WhatsApp, au format international sans `+`.
- `A_RENSEIGNER` : clé d'accès Web3Forms (https://web3forms.com), pour que les formulaires envoient les demandes par e-mail. Tant qu'elle n'est pas renseignée, les formulaires affichent un message invitant à appeler.
- `à compléter` (mentions légales, confidentialité) : capital, siège, SIREN/RCS, TVA, directeur de publication, une fois la SAS créée.
- `contact@lignee.fr` et `https://lignee.fr` (balises canoniques, `sitemap.xml`, `robots.txt`) si le domaine final est différent.

À faire relire par un juriste : mentions légales, confidentialité, guide « que faire après un décès ». Les CGV restent à rédiger avant le premier dossier.
