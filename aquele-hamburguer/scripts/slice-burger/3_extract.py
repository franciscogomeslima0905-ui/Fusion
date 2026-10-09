import numpy as np, cv2, json, os
from PIL import Image
from scipy import ndimage as ndi
im=np.array(Image.open('im_fixed.png').convert('RGB'))
a=np.array(Image.open('alpha_fixed.png')).astype(np.float32)/255
L=np.load('L1.npy'); M=np.load('M.npy'); L[L==7]=8
H,W=L.shape
names=['top-bun','sauce-top','lettuce','onion','tomato','cheese','beef','sauce-bottom','bottom-bun']
RANK={2:0,0:1,1:2,3:3,4:4,5:5,6:6,8:7}  # frente -> fundo
ORDER=[0,1,2,3,4,5,6,8]
ys,xs=np.where(M); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
BW=x1-x0; U=600.0/BW
print('bbox',x0,y0,x1,y1,'BW',BW)
def clean(m,minpx=500):
    m=ndi.binary_fill_holes(m)
    m=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
    lab,n=ndi.label(m)
    if n:
        sizes=ndi.sum(m,lab,range(1,n+1)); keep=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>=minpx]); m=keep
    return m.astype(bool)
out=[]; os.makedirs('layers',exist_ok=True)
for i in ORDER:
    n=names[i]
    Mi=clean(L==i)
    hull=cv2.morphologyEx(Mi.astype(np.uint8),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(61,31))).astype(bool)&M
    # extensão por trás das camadas da frente, no máx. 14px além da própria camada
    near=cv2.dilate(Mi.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(29,29))).astype(bool)
    front=np.isin(L,[k for k in RANK if RANK[k]<RANK[i]])
    border=cv2.dilate(Mi.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7))).astype(bool)
    Ei=(hull&near|border)&~Mi&front
    # inpaint usando só os pixels da camada como fonte
    win=cv2.dilate(Mi.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(45,45))).astype(bool)
    unknown=(win&~Mi).astype(np.uint8)*255
    filled=cv2.inpaint(cv2.cvtColor(im,cv2.COLOR_RGB2BGR),unknown,5,cv2.INPAINT_TELEA)
    filled=cv2.cvtColor(filled,cv2.COLOR_BGR2RGB)
    solid=(Mi|Ei)
    al=cv2.GaussianBlur(solid.astype(np.float32),(0,0),1.1)
    al=np.clip((al-0.5)*1.8+0.5,0,1)
    # mantém a borda externa original do hambúrguer
    al=np.where(M,al,0)
    rgba=np.dstack([filled,(al*255).astype(np.uint8)])
    ly,lx=np.where(al>0.02)
    bx0,bx1,by0,by1=lx.min(),lx.max()+1,ly.min(),ly.max()+1
    crop=Image.fromarray(rgba[by0:by1,bx0:bx1])
    UP=1.8
    crop=crop.resize((int(crop.width*UP),int(crop.height*UP)),Image.LANCZOS)
    from PIL import ImageFilter
    r,g,b,al_=crop.split(); rgb=Image.merge('RGB',(r,g,b)).filter(ImageFilter.UnsharpMask(1.6,60,2)); crop=Image.merge('RGBA',(*rgb.split(),al_))
    crop.save(f'layers/{n}.webp',quality=90,method=6)
    out.append(dict(id=n,z=len(ORDER)-RANK[i],x=round((bx0-x0)*U,2),y=round((by0-y0)*U,2),w=round((bx1-bx0)*U,2),h=round((by1-by0)*U,2),cy=round((np.mean(np.where(Mi)[0])-y0)*U,2)))
    print(n,out[-1])
json.dump(dict(assembledH=round((y1-y0)*U,2),layers=out),open('layers/manifest.json','w'),indent=1)
names_o=[names[i] for i in ORDER]
def comp(G,name):
    n=len(out); c=Image.new('RGBA',(W+200,H+900),(14,14,14,255)); cen=sum(d['cy'] for d in out)/n
    for d in sorted(out,key=lambda d:d['z']):
        i=[o['id'] for o in out].index(d['id']); off=(i-(n-1)/2)*G
        l=Image.open(f"layers/{d['id']}.webp"); l=l.resize((int(d['w']/U),int(d['h']/U)),Image.LANCZOS)
        c.alpha_composite(l,(int(d['x']/U)+x0+50,int(d['y']/U)+y0+int(off/U)+400))
    c.convert('RGB').save(name)
comp(0,'prev_assembled.png'); comp(62,'prev_exploded.png')
