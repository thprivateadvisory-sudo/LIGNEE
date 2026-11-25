import subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pathlib
R=str(pathlib.Path(__file__).resolve().parent.parent)+'/'
SERIF=R+'polices/cormorant-garamond.woff2'; ITAL=R+'polices/cormorant-garamond-italique.woff2'; SANS=R+'polices/inter.woff2'
W,H=1080,1920
# (clip, start, dur, lines, style)
# Plans Pexels (licence libre), téléchargés à la volée par leur identifiant
S=[
 (5767251,3.0,3.6,["Le jour où","je partirai,","je veux que mes enfants","sachent quoi faire."],'hook'),
 (5708391,4.0,3.0,["Alors un soir,","j\u2019ai tout écrit."],'n'),
 (6918039,0.0,3.4,["Inhumation","ou crémation."],'n'),
 (6624500,1.0,3.4,["La musique","pour la cérémonie."],'n'),
 (5227354,4.0,3.4,["Qui prévenir.","Où sont mes papiers."],'n'),
 (6785798,1.0,3.6,["Ce qu\u2019on garde","de mes affaires.","Et pour qui."],'n'),
 (10312216,10.0,3.8,["Une soirée pour moi.","Des jours de doute","en moins pour eux."],'n'),
 (10312216,30.0,4.4,None,'end'),
]
CACHE=os.path.expanduser('~/.cache/lignee-pexels'); os.makedirs(CACHE,exist_ok=True)
def clip_path(c):
    if isinstance(c,str): return R+f'videos/{c}.mp4'
    p=f'{CACHE}/{c}.mp4'
    if not os.path.exists(p):
        subprocess.run(['curl','-sL','--fail','-o',p,f'https://www.pexels.com/download/video/{c}/'],check=True)
    return p
def card(lines,style,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    if style=='end':
        im=Image.new('RGBA',(W,H),(18,14,10,150)); d=ImageDraw.Draw(im)
        logo=Image.open(R+'images/monogramme-or.png').convert('RGBA'); logo.thumbnail((220,220)); im.alpha_composite(logo,((W-logo.width)//2,560))
        f1=ImageFont.truetype(SERIF,130); f2=ImageFont.truetype(ITAL,64); f3=ImageFont.truetype(SANS,44); f4=ImageFont.truetype(ITAL,58)
        def c(t,f,y,fill):
            w=d.textlength(t,font=f); d.text(((W-w)/2,y),t,font=f,fill=fill)
        c('Lignée',f1,820,(245,236,220,255))
        c('Préparer, pour que les siens',f2,990,(235,222,200,255))
        c('n\u2019aient qu\u2019à se souvenir.',f2,1065,(235,222,200,255))
        c('Et vous, vous l\u2019avez écrit ?',f4,1190,(214,180,120,255))
        c('maison-lignee.fr',f3,1310,(245,236,220,230))
        return im.save(path)
    size=104 if style=='hook' else 88
    f=ImageFont.truetype(ITAL if style!='hook' else SERIF,size)
    lh=int(size*1.18); total=lh*len(lines); y0=(H-total)//2-120
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    band=Image.new('L',(W,H),0); bd=ImageDraw.Draw(band)
    bd.rectangle((0,y0-110,W,y0+total+90),fill=135)
    band=band.filter(ImageFilter.GaussianBlur(70))
    sh=Image.composite(Image.new('RGBA',(W,H),(12,9,6,255)),sh,band); sd=ImageDraw.Draw(sh)
    for i,t in enumerate(lines):
        w=d.textlength(t,font=f); x=(W-w)/2; y=y0+i*lh
        sd.text((x,y+4),t,font=f,fill=(0,0,0,255))
        d.text((x,y),t,font=f,fill=(250,244,232,255))
    sh=sh.filter(ImageFilter.GaussianBlur(10))
    sh.alpha_composite(im); sh.save(path)
segs=[]
for i,(clip,st,du,lines,style) in enumerate(S):
    png=f'o{i}.png'; card(lines,style,png)
    src=clip_path(clip)
    cx={6918039:'1100'}.get(clip,'(iw-ow)/2')
    vf=(f"scale=-2:1920:flags=lanczos,crop=1080:1920:{cx}:0,"
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
  '-c:a','aac','-shortest','-movflags','+faststart','lignee-tiktok-volontes.mp4'],check=True)
print('total',total)
