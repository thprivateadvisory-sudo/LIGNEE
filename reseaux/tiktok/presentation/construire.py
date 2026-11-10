#!/usr/bin/env python3
"""Monte la vidéo TikTok de présentation de Lignée (1080 x 1920, 30 i/s).

Sources : les vidéos Pexels du site (dossier videos/), les polices et le logo du site.
Étapes : textes en PNG (Playwright), un segment par scène (ffmpeg), puis fondus enchaînés.
Usage : python3 reseaux/tiktok/presentation/construire.py
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw

ICI = Path(__file__).resolve().parent
RACINE = ICI.parents[2]
BUILD = ICI / "build"
BUILD.mkdir(exist_ok=True)
CFG = json.loads((ICI / "scenes.json").read_text())
FPS, FONDU = CFG["fps"], CFG["fondu"]
W, H = 1080, 1920
CX, CY, CW, CH = 60, 220, 960, 1200  # carte vidéo au format 4:5


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-3000:])


def masques():
    m = Image.new("L", (CW, CH), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, CW - 1, CH - 1), radius=34, fill=255)
    m.save(BUILD / "masque.png")
    # voile sombre progressif en bas de la carte, pour la lisibilité des textes
    v = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    px = v.load()
    for y in range(CH):
        a = max(0.0, (y - CH * 0.35) / (CH * 0.65))
        for x in range(CW):
            px[x, y] = (14, 20, 32, int(185 * a ** 1.3))
    v.putalpha(Image.composite(v.getchannel("A"), Image.new("L", (CW, CH), 0), m))
    v.save(BUILD / "voile.png")


def segment(i, s):
    d = s["duree"]
    out = BUILD / f"seg{i}.mp4"
    textes = [BUILD / f"t{i}_{j}.png" for j in range(len(s["textes"]))]
    if s["clip"] == "fin":
        cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0xF5F1E8:s={W}x{H}:r={FPS}:d={d}"]
        base = "[0:v]null[b0]"
        n0 = 1
    else:
        src = RACINE / "videos" / f"{s['clip']}.mp4"
        cmd = ["ffmpeg", "-y", "-ss", str(s["debut"]), "-t", str(d), "-i", str(src),
               "-loop", "1", "-i", str(BUILD / "masque.png"),
               "-loop", "1", "-i", str(BUILD / "voile.png")]
        z = f"(1+0.05*t/{d})"
        base = (
            f"[0:v]fps={FPS},setpts=PTS-STARTPTS,split[a][c];"
            f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=40:2,eq=brightness=-0.10:saturation=0.8[fond];"
            f"[c]scale={CW * 2}:{CH * 2}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={CW * 2}:{CH * 2},"
            f"zoompan=z='1+0.06*on/{d * FPS}':d=1:s={CW}x{CH}:fps={FPS}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',unsharp=5:5:0.6,eq=saturation=0.92:gamma_r=1.03:gamma_b=0.97,format=rgba[cc];"
            f"[1:v]format=gray,scale={CW}:{CH}[m];[cc][m]alphamerge[ca];"
            f"[ca][2:v]overlay=shortest=1[cv];"
            f"[fond][cv]overlay={CX}:{CY}:shortest=1[b0]"
        )
        n0 = 3
    for p in textes:
        cmd += ["-loop", "1", "-t", str(d), "-i", str(p)]
    f = [base]
    cur = "b0"
    for j, t in enumerate(s["textes"]):
        k = n0 + j
        fin = min(t["a"], d) - 0.45
        f.append(
            f"[{k}:v]format=rgba,fade=in:st={t['de']}:d=0.5:alpha=1,"
            f"fade=out:st={fin}:d=0.45:alpha=1[x{j}]" if t["a"] < d else
            f"[{k}:v]format=rgba,fade=in:st={t['de']}:d=0.5:alpha=1[x{j}]"
        )
        f.append(f"[{cur}][x{j}]overlay=0:0:shortest=1[b{j + 1}]")
        cur = f"b{j + 1}"
    f.append(f"[{cur}]trim=duration={d},format=yuv420p[v]")
    cmd += ["-filter_complex", ";".join(f), "-map", "[v]", "-r", str(FPS),
            "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-an", str(out)]
    run(cmd)
    return out, d


def assembler(segs, cible):
    cmd = ["ffmpeg", "-y"]
    for p, _ in segs:
        cmd += ["-i", str(p)]
    f, cur, t = [], "0:v", 0.0
    for i in range(1, len(segs)):
        t += segs[i - 1][1] - FONDU
        f.append(f"[{cur}][{i}:v]xfade=transition=fade:duration={FONDU}:offset={t:.3f}[v{i}]")
        cur = f"v{i}"
    total = t + segs[-1][1]
    f.append(f"[{cur}]format=yuv420p[v]")
    cmd += ["-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=44100:cl=stereo",
            "-filter_complex", ";".join(f), "-map", "[v]", "-map", f"{len(segs)}:a",
            "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
            "-shortest", str(cible)]
    run(cmd)
    return total


if __name__ == "__main__":
    masques()
    run(["node", str(ICI / "textes.js"), str(BUILD)])
    segs = [segment(i, s) for i, s in enumerate(CFG["scenes"])]
    cible = ICI / "lignee-presentation-tiktok.mp4"
    total = assembler(segs, cible)
    print(f"OK {cible} ({total:.1f} s)")
