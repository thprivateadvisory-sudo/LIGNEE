# Vidéo TikTok : présentation de Lignée

`lignee-presentation-tiktok.mp4`, 36 s, 1080 × 1920, 30 i/s, piste son muette (à compléter dans TikTok).

## Déroulé

| Temps | Image | Texte |
|---|---|---|
| 0 à 4 s | Rideaux au soleil | Que faire des vêtements d'un proche disparu ? |
| 4 à 8 s | Mains et vieilles photos | On n'ose pas les donner. On n'ose pas les jeter. |
| 8 à 12 s | Brume | Alors ils restent au fond d'une armoire. Pendant des années. |
| 12 à 16 s | Aiguille, gros plan | Chez Lignée, on en fait des souvenirs. |
| 16 à 21 s | Machine à coudre | Un doudou dans sa chemise. Un coussin dans son pull. Cousu à la main en France par une couturière partenaire. |
| 21 à 26 s | Boîte de photos | Des photos pendant la confection. Les tissus restants rendus. Une carte signée de la couturière. |
| 26 à 31 s | Aube sur les champs | Pourquoi Lignée ? Parce qu'après un décès, tout va trop vite. On accompagne les familles avant, pendant et après. Préparer · Traverser · Se souvenir |
| 31 à 36 s | Logo | Le funéraire, enfin humain. maison-lignee.fr, @maison.lignee. Envoyez cette vidéo à quelqu'un qui n'ose pas ouvrir l'armoire. |

Images : vidéos Pexels déjà utilisées sur le site (licence Pexels, `videos/sources.txt`). Aucune image générée par IA.

## Publication

**Légende** (à coller) :

> Ses vêtements sont toujours dans l'armoire ? On les transforme en doudou ou en coussin, cousus à la main en France. Vous gardez un peu de lui, tout près de vous. 🤍
> Doudou à partir de 99 €, lien en bio.
>
> #deuil #souvenir #doudousouvenir #hommage #perteduneproche #vetementsdundefunt #faitmainenfrance #grandparents #funeraire #maisonlignee

**Son** : dans TikTok, choisir un piano doux ou une musique instrumentale calme de la bibliothèque commerciale (compte pro), volume autour de 30 %. Un son de la bibliothèque TikTok aide la diffusion.

**Réglages** : couverture sur la première image (l'accroche), commentaires ouverts, Duo et Collage autorisés pour faciliter le partage. Épingler la vidéo en haut du profil.

**Réponse type aux commentaires** : « Merci de nous avoir confié ce souvenir 🤍 Si vous voulez en parler, écrivez-nous sur maison-lignee.fr, on vous répond sous 24 h. »

## Modifier et régénérer

Textes et minutage : `scenes.json`. Styles : `textes.js`. Puis :

```
NODE_PATH=$(npm root -g) python3 reseaux/tiktok/presentation/construire.py
```

Prérequis : ffmpeg, Python (Pillow), Node avec Playwright et Chromium. Environ 2 min.

# Vidéo 2 : la marque Lignée

`lignee-marque-tiktok.mp4`, 36 s. Elle parle de Lignée et ne montre aucun produit. Textes : `scenes-marque.json`.

| Temps | Texte |
|---|---|
| 0 à 4 s | En France, une famille a 6 jours pour organiser des obsèques. |
| 4 à 8 s | Six jours pour tout décider. En plein chagrin. |
| 8 à 11 s | Et personne ne nous a appris à le faire. |
| 11 à 15 s | Lignée est née de ce constat. Une maison qui accompagne les familles avant, pendant et après un décès. |
| 15 à 27 s | 01 Préparer : écrire ses volontés pour épargner ses proches. 02 Traverser : un guide clair pour chaque démarche. 03 Se souvenir : des objets faits main pour garder un lien. |
| 27 à 31 s | Notre ambition : rendre le funéraire plus humain. Plus simple · Plus clair · Plus doux |
| 31 à 36 s | Logo, maison-lignee.fr, @maison.lignee. Partagez-la. Un jour, quelqu'un en aura besoin. |

Le délai de six jours vient du Code général des collectivités territoriales (art. R2213-33 et R2213-35 : inhumation ou crémation six jours au plus après le décès, dimanches et jours fériés non compris).

```
NODE_PATH=$(npm root -g) python3 reseaux/tiktok/presentation/construire.py reseaux/tiktok/presentation/scenes-marque.json reseaux/tiktok/presentation/lignee-marque-tiktok.mp4
```
