import subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pathlib
R=str(pathlib.Path(__file__).resolve().parent.parent)+'/'
SERIF=R+'polices/cormorant-garamond.woff2'; ITAL=R+'polices/cormorant-garamond-italique.woff2'; SANS=R+'polices/inter.woff2'
W,H=1080,1920
# (clip, start, dur, lines, style)
S=[
 ('rideaux-soleil',0.3,3.4,["Si un proche","mourait cette nuit,","sauriez-vous","quoi faire ?"],'hook'),
 ('brume-campagne',0.3,2.8,["Personne ne nous l\u2019apprend.","Alors voici","les premières 24 heures."],'n'),
 ('photos-mains',0.3,4.2,["Faire constater le décès","par un médecin.","Il établit le certificat."],'1'),
 ('photos-boite',1.0,4.2,["Déclarer le décès","à la mairie.","Les pompes funèbres","peuvent s\u2019en charger."],'2'),
 ('bois-poncage',2.0,4.2,["Chercher s\u2019il avait","laissé des volontés","ou un contrat obsèques."],'3'),
 ('couture-gros-plan',0.5,4.2,["Choisir les pompes funèbres","et demander","un devis détaillé."],'4'),
 ('aube-champs',2.0,3.4,["Enregistrez cette vidéo.","Un jour, quelqu\u2019un","en aura besoin."],'n'),
 ('aube-champs',8.0,4.2,None,'end'),
]
def card(lines,style,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    if style=='end':
        im=Image.new('RGBA',(W,H),(18,14,10,150)); d=ImageDraw.Draw(im)
        logo=Image.open(R+'images/monogramme-or.png').convert('RGBA'); logo.thumbnail((220,220)); im.alpha_composite(logo,((W-logo.width)//2,560))
        f1=ImageFont.truetype(SERIF,130); f2=ImageFont.truetype(ITAL,64); f3=ImageFont.truetype(SANS,44); f4=ImageFont.truetype(ITAL,58)
        def c(t,f,y,fill):
            w=d.textlength(t,font=f); d.text(((W-w)/2,y),t,font=f,fill=fill)
        c('Lignée',f1,820,(245,236,220,255))
        c('Le guide complet, gratuit :',f2,990,(235,222,200,255))
        c('la semaine, le mois, les six mois.',f4,1080,(214,180,120,255))
        c('maison-lignee.fr/guide',f3,1240,(245,236,220,230))
        return im.save(path)
    num=style if style in '1234' and len(style)==1 else None
    size=110 if style=='hook' else 88
    f=ImageFont.truetype(ITAL if style!='hook' else SERIF,size)
    lh=int(size*1.18); total=lh*len(lines); y0=(H-total)//2-120
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    band=Image.new('L',(W,H),0); bd=ImageDraw.Draw(band)
    bd.rectangle((0,y0-(330 if num else 110),W,y0+total+90),fill=135)
    band=band.filter(ImageFilter.GaussianBlur(70))
    sh=Image.composite(Image.new('RGBA',(W,H),(12,9,6,255)),sh,band); sd=ImageDraw.Draw(sh)
    for i,t in enumerate(lines):
        w=d.textlength(t,font=f); x=(W-w)/2; y=y0+i*lh
        sd.text((x,y+4),t,font=f,fill=(0,0,0,255))
        d.text((x,y),t,font=f,fill=(250,244,232,255))
    if num:
        fn=ImageFont.truetype(SERIF,190); w=d.textlength(num,font=fn)
        d.text(((W-w)/2,y0-250),num,font=fn,fill=(214,180,120,255))
        fs=ImageFont.truetype(SANS,34); t='DANS LES 24 HEURES'; w=d.textlength(t,font=fs)
        d.text(((W-w)/2,y0-300),t,font=fs,fill=(235,222,200,200))
    sh=sh.filter(ImageFilter.GaussianBlur(10))
    sh.alpha_composite(im); sh.save(path)
segs=[]
for i,(clip,st,du,lines,style) in enumerate(S):
    png=f'o{i}.png'; card(lines,style,png)
    src=R+f'videos/{clip}.mp4'
    vf=("scale=-2:1920:flags=lanczos,crop=1080:1920,"
        f"zoompan=z='1+0.0009*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,"
        "eq=saturation=0.75:brightness=-0.06:contrast=1.03,colorbalance=rm=0.04:bm=-0.04,vignette=PI/5")
    if style=='end': vf+=",gblur=sigma=14"
    out=f's{i}.mp4'
    fc=f"[0:v]{vf}[b];[1:v]format=rgba,fade=t=in:st=0.15:d=0.45:alpha=1[t];[b][t]overlay=0:0,format=yuv420p[v]"
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(st),'-t',str(du),'-i',src,'-loop','1','-t',str(du),'-i',png,
        '-filter_complex',fc,'-map','[v]','-r','30','-c:v','libx264','-crf','18','-preset','medium',out],check=True)
    segs.append((out,du))
# crossfade chain
X=0.4
inputs=[]; 
for s,_ in segs: inputs+=['-i',s]
fc=''; prev='[0:v]'; off=0
for i in range(1,len(segs)):
    off+=segs[i-1][1]-X
    lab=f'[x{i}]'; fc+=f"{prev}[{i}:v]xfade=transition=fade:duration={X}:offset={off:.2f}{lab};"; prev=lab
total=sum(d for _,d in segs)-X*(len(segs)-1)
fc+=f"{prev}fade=t=in:st=0:d=0.3,fade=t=out:st={total-0.6:.2f}:d=0.6[v]"
subprocess.run(['ffmpeg','-y','-loglevel','error',*inputs,'-f','lavfi','-t',f'{total:.2f}','-i','anullsrc=r=44100:cl=stereo',
  '-filter_complex',fc,'-map','[v]','-map',f'{len(segs)}:a','-c:v','libx264','-crf','19','-preset','slow','-profile:v','high','-pix_fmt','yuv420p',
  '-c:a','aac','-shortest','-movflags','+faststart','lignee-tiktok-24h.mp4'],check=True)
print('total',total)
