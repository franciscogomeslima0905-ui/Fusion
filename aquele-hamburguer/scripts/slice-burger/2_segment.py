import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
SRC='/tmp/claude-0/-home-user-Fusion/2f57b70d-37a2-55d6-ac98-2cb6fabdeefc/images/9.webp'
im=np.array(Image.open(SRC).convert('RGB'))
H,W=im.shape[:2]
a=np.array(Image.open('u2net.png'))[:,:,3].astype(np.float32)/255
# --- reconstrói o pão inferior (a xícara de ketchup tapa o lado direito): espelha o lado esquerdo com transição suave
AX=375.0
yy,xx=np.mgrid[0:H,0:W]
mx=np.clip(np.round(2*AX-xx).astype(int),0,W-1)
def sstep(t,a0,a1): t=np.clip((t-a0)/(a1-a0),0,1); return t*t*(3-2*t)
w=(sstep(xx,500,570)*sstep(yy,748,790)).astype(np.float32)
mir=im[yy,mx].astype(np.float32)
im=(im.astype(np.float32)*(1-w[...,None])+mir*w[...,None]).astype(np.uint8)
a=a*(1-w)+a[yy,mx]*w
M=ndi.binary_fill_holes(a>0.5)
hsv=cv2.cvtColor(im,cv2.COLOR_RGB2HSV).astype(np.float32); h=hsv[...,0]*2; s=hsv[...,1]/255; v=hsv[...,2]/255
green=(h>62)&(h<165)&(s>0.28)&(v>0.22)
purple=(h>240)&(h<352)&(s>0.12)&(v>0.2)
tomato=((h<20)|(h>352))&(s>0.5)&(v>0.3)
cheese=(h>=20)&(h<=52)&(s>0.55)&(v>0.55)
dark=(v<0.45)
sauce=(h>=8)&(h<=40)&(s>0.18)&(s<0.62)&(v>0.62)
Y=yy
L=np.full((H,W),-1,np.int8)
L[M]=8
L[M&(Y<442)]=0
mid=M&(Y>=442)
L[mid&(Y<500)]=1
L[mid&(Y<560)&dark]=2
L[mid&(Y<590)&green]=2
L[mid&(Y>=495)&(Y<615)&purple]=3
L[mid&(Y>=525)&(Y<640)&tomato]=4
L[mid&(Y>=575)&(Y<730)&cheese]=5
L[mid&(Y>=610)&(Y<770)&dark&(L!=2)]=6
L[mid&(Y>=690)&(Y<800)&sauce&(L!=6)&(L!=5)]=7
# zonas sem classe
un=mid&(L==8)
L[un&(Y>=500)&(Y<552)]=2
L[un&(Y>=552)&(Y<600)]=4
L[un&(Y>=600)&(Y<640)]=5
L[un&(Y>=640)&(Y<735)]=6
# moda 11x11 para limpar ruído
def mode_filter(L,k):
    out=L.copy()
    cnt=np.stack([cv2.blur(((L==i)&M).astype(np.float32),(k,k)) for i in range(9)])
    best=cnt.argmax(0).astype(np.int8)
    out[M]=best[M]; return out
L=mode_filter(L,11)
L[~M]=-1
np.save('L1.npy',L); np.save('M.npy',M); Image.fromarray(im).save('im_fixed.png')
Image.fromarray((a*255).astype(np.uint8)).save('alpha_fixed.png')
cols=np.array([[200,160,90],[255,230,200],[80,200,60],[200,60,200],[230,40,30],[255,210,0],[90,50,30],[255,180,160],[210,140,50]],np.uint8)
vis=np.zeros((H,W,3),np.uint8)+30
for i in range(9): vis[L==i]=cols[i]
Image.fromarray(vis).save('labels1.png')
Image.fromarray(np.concatenate([im,vis],1)).crop((0,220,1472,880)).save('labels1_cmp.png')
