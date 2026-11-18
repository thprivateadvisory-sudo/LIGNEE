"""TikTok « Ne résiliez pas tout de suite son téléphone » (format de la vidéo vêtements).

Usage : python3 videos/montage_voix.py [sortie.mp4]
Plans Pexels du dossier videos/, texte façon TikTok (cartouches blancs), carton final Lignée.
"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
W, H, FPS = 1080, 1920, 30
POLICE = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
POLICE_FINE = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"

# (clip, début dans le clip, durée, lignes, taille, position verticale du bloc)
SCENES = [
    ("aube-champs", 1.0, 3.2, ["Enregistrez cette vidéo.", "Pour vous, ou pour quelqu'un", "qui en aura besoin."], 50, 0.40),
    ("brume-campagne", 0.5, 3.8, ["Si vous venez de perdre quelqu'un,", "ne résiliez pas tout de suite", "son téléphone."], 56, 0.24),
    ("photos-mains", 0.5, 3.6, ["Sa messagerie peut s'effacer", "avec la ligne.", "Et sa voix avec elle."], 56, 0.24),
    ("photos-boite", 1.0, 4.0, ["Enregistrez ses messages vocaux.", "Gardez ses SMS,", "ses mots écrits à la main."], 56, 0.24),
    ("rideaux-soleil", 2.0, 3.8, ["Un jour, vous aurez besoin", "de l'entendre dire", "votre prénom."], 56, 0.24),
]
FIN = 2.8
CREME = (243, 238, 230)
MARINE = (27, 42, 74)


def cartouche(lignes, taille, y_rel, chemin):
    """Texte noir sur cartouches blancs arrondis, une par ligne, centrés (style TikTok)."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(POLICE, taille)
    pad_x, pad_y, inter = int(taille * 0.42), int(taille * 0.22), int(taille * 0.10)
    asc, desc = f.getmetrics()
    h_ligne = asc + desc + 2 * pad_y
    y = int(H * y_rel)
    for l in lignes:
        lw = d.textlength(l, font=f)
        x0 = (W - lw) / 2 - pad_x
        d.rounded_rectangle([x0, y, x0 + lw + 2 * pad_x, y + h_ligne], radius=int(taille * 0.28), fill=(255, 255, 255, 245))
        d.text(((W - lw) / 2, y + pad_y), l, font=f, fill=(12, 12, 12))
        y += h_ligne - int(taille * 0.12) + inter
    img.save(chemin)


def carton_final(chemin):
    img = Image.new("RGB", (W, H), CREME)
    logo = Image.open(os.path.join(RACINE, "images", "logo-lignee.png")).convert("RGBA")
    lw = 620
    logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    y = 640
    img.paste(logo, ((W - lw) // 2, y), logo)
    d = ImageDraw.Draw(img)
    for texte, taille, dy, coul in [
        ("Obsèques · Démarches · Souvenirs", 44, y + logo.height + 90, MARINE),
        ("maison-lignee.fr", 52, y + logo.height + 170, (176, 141, 79)),
    ]:
        f = ImageFont.truetype(POLICE_FINE, taille)
        d.text(((W - d.textlength(texte, font=f)) / 2, dy), texte, font=f, fill=coul)
    img.save(chemin)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def main():
    sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "tiktok-voix.mp4")
    tmp = tempfile.mkdtemp()
    morceaux = []
    for i, (clip, debut, duree, lignes, taille, y) in enumerate(SCENES):
        png = os.path.join(tmp, f"t{i}.png")
        cartouche(lignes, taille, y, png)
        out = os.path.join(tmp, f"s{i}.mp4")
        fo = duree - 0.25
        vf = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS},"
              f"eq=brightness=-0.03:saturation=0.9[b];[b][1:v]overlay=0:0,"
              f"fade=t=in:st=0:d=0.25,fade=t=out:st={fo}:d=0.25,format=yuv420p[v]")
        run(["ffmpeg", "-y", "-ss", str(debut), "-t", str(duree), "-i", os.path.join(ICI, clip + ".mp4"),
             "-loop", "1", "-t", str(duree), "-i", png, "-filter_complex", vf, "-map", "[v]", "-an",
             "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS), out])
        morceaux.append(out)
    fin_png = os.path.join(tmp, "fin.png")
    carton_final(fin_png)
    fin = os.path.join(tmp, "fin.mp4")
    run(["ffmpeg", "-y", "-loop", "1", "-t", str(FIN), "-i", fin_png, "-vf",
         f"fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p", "-c:v", "libx264", "-crf", "18", fin])
    morceaux.append(fin)
    liste = os.path.join(tmp, "liste.txt")
    with open(liste, "w") as f:
        f.writelines(f"file '{m}'\n" for m in morceaux)
    # piste silencieuse : le son tendance s'ajoute dans TikTok
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", liste, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
         "-shortest", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-movflags", "+faststart", sortie])
    print(sortie)


if __name__ == "__main__":
    main()
