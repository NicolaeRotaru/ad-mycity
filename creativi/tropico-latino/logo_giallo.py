# Logo El Tropico Latino: sostituisce il bianco di fondo con un giallo scuro (oro, senape, ocra).
# Uso: python3 logo_giallo.py <screenshot.jpg>   — misure del cerchio prese dallo screenshot WhatsApp 1080x2340 del 26/11.
import sys
from PIL import Image, ImageDraw, ImageFont
import numpy as np
SRC=sys.argv[1]  # lo screenshot col logo nel cerchio bianco
OUT='/home/user/ad-mycity/creativi/tropico-latino/'
im=np.asarray(Image.open(SRC).convert('RGB')).astype(float)
cx,cy,r=539.5,1169.5,356
px,py,pr=805.5,1435.5,64          # matita di WhatsApp da coprire
x0,y0=int(cx-r),int(cy-r); S=2*r
a=im[y0:y0+S,x0:x0+S]
Y,X=np.mgrid[0:S,0:S]+0.5
d=np.hypot(X-(cx-x0),Y-(cy-y0))
pen=np.hypot(X-(px-x0),Y-(py-y0))<=pr
inside=d<=r-3
cand=((a.min(axis=2)>185)&inside)|pen
seed=cand&((d>r-14)|pen)
bg=seed.copy()
while True:                          # riempimento a partire dal bordo: solo il bianco collegato al fondo
    g=bg.copy()
    g[1:]|=bg[:-1]; g[:-1]|=bg[1:]; g[:,1:]|=bg[:,:-1]; g[:,:-1]|=bg[:,1:]
    g&=cand
    if (g==bg).all(): break
    bg=g
# buchi delle lettere (O, P, R, A, ®): bianco chiuso, circondato da nero, nella corona delle scritte
from collections import deque
rest=cand&~bg
lab=np.zeros(rest.shape,int); n=0; filled=0
H2,W2=rest.shape
for sy,sx in zip(*np.nonzero(rest)):
    if lab[sy,sx]: continue
    n+=1; q=deque([(sy,sx)]); lab[sy,sx]=n; pts=[]
    while q:
        y,x=q.popleft(); pts.append((y,x))
        for yy,xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0<=yy<H2 and 0<=xx<W2 and rest[yy,xx] and not lab[yy,xx]:
                lab[yy,xx]=n; q.append((yy,xx))
    ys=np.array([p[0] for p in pts]); xs=np.array([p[1] for p in pts])
    comp=np.zeros_like(rest); comp[ys,xs]=True
    ring=comp.copy()
    for _ in range(4):
        b=ring.copy(); b[1:]|=ring[:-1]; b[:-1]|=ring[1:]; b[:,1:]|=ring[:,:-1]; b[:,:-1]|=ring[:,1:]; ring=b
    ring&=~comp
    edge=a[ring]
    darkfrac=(edge.max(axis=1)<120).mean()
    dist=d[ys,xs].mean()
    if dist>0.5*r and darkfrac>0.6 and len(pts)<4000:
        bg|=comp; filled+=1
print('componenti',n,'buchi riempiti',filled)
# interno del marchio ®: piccolo, la compressione lo rende crema invece che bianco
rx,ry=653.6,472.8
near=np.hypot(X-rx,Y-ry)<16
dk=near&(a.max(axis=2)<110)
yy,xx=np.nonzero(dk); rcx,rcy=(xx.min()+xx.max())/2+0.5,(yy.min()+yy.max())/2+0.5; rr=(xx.max()-xx.min())/2
bg|=(np.hypot(X-rcx,Y-rcy)<rr-0.5)&(a.min(axis=2)>140)
print('®',round(rcx,1),round(rcy,1),'raggio',rr)
band=bg.copy()
for _ in range(2):
    b=band.copy(); b[1:]|=band[:-1]; b[:-1]|=band[1:]; b[:,1:]|=band[:,:-1]; b[:,:-1]|=band[:,1:]; band=b
band&=~bg
def make(hexc):
    col=np.array([int(hexc[i:i+2],16) for i in (1,3,5)],float)
    o=a.copy()
    o[band]=a[band]*col/255.0          # bordi morbidi: moltiplica, il nero resta nero
    o[bg]=col
    o[~inside]=col
    return Image.fromarray(o.clip(0,255).astype(np.uint8))
shades={'oro':'#F2B705','senape':'#E0A11B','ocra':'#C98E12'}
imgs={}
for k,v in shades.items():
    imgs[k]=make(v)
    if True:
        imgs[k].resize((1024,1024),Image.LANCZOS).save(OUT+f'logo-sfondo-{k}.png')
# foglio di confronto: anteprima rotonda come la mostra WhatsApp
T=360; pad=30
sheet=Image.new('RGB',(pad+3*(T+pad),T+2*pad+50),'#1b1d22')
dr=ImageDraw.Draw(sheet)
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22)
except: f=ImageFont.load_default()
m=Image.new('L',(T*4,T*4),0); ImageDraw.Draw(m).ellipse((0,0,T*4-1,T*4-1),255); m=m.resize((T,T),Image.LANCZOS)
for i,(k,v) in enumerate(shades.items()):
    x=pad+i*(T+pad)
    sheet.paste(imgs[k].resize((T,T),Image.LANCZOS),(x,pad),m)
    lab=f'{k} {v}'; w=dr.textlength(lab,font=f)
    dr.text((x+(T-w)/2,pad+T+12),lab,fill='#eeeeee',font=f)
sheet.save(OUT+'confronto-tre-gialli.png')
print('bg px',bg.sum(),'band px',band.sum())
