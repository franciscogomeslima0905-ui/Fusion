import numpy as np
from PIL import Image
im = Image.open('assets/logo_original.png').convert('RGB')
a = np.asarray(im).astype(np.float32)
bg = a[5,5]
print('bg', bg)
# sample pink/red
print('pink', a[650,300], 'red', a[420,350])
red = a[420,350]; pink = a[650,300]
d_bg = np.linalg.norm(a-bg,axis=2)
# decide fg color per pixel: nearest of red/pink by projecting
def alpha_for(fg):
    v = fg-bg
    t = ((a-bg)@v)/ (v@v)
    return np.clip(t,0,1)
ar, ap = alpha_for(red), alpha_for(pink)
# residual error for each hypothesis
def err(fg, al):
    rec = bg + (fg-bg)*al[...,None]
    return np.linalg.norm(a-rec,axis=2)
er, ep = err(red,ar), err(pink,ap)
use_red = er<ep
alpha = np.where(use_red, ar, ap)
fg = np.where(use_red[...,None], red, pink)
alpha[d_bg<6]=0
out = np.dstack([fg, alpha*255]).astype(np.uint8)
img = Image.fromarray(out,'RGBA')
bbox = img.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
print('bbox',bbox)
pad=6
bbox=(bbox[0]-pad,bbox[1]-pad,bbox[2]+pad,bbox[3]+pad)
img.crop(bbox).save('assets/logo_gb.png')
print(img.crop(bbox).size)
# preview on brown
prev = Image.new('RGB',img.crop(bbox).size,tuple(int(x) for x in bg))
prev.paste(img.crop(bbox),(0,0),img.crop(bbox))
prev.save('assets/_logo_preview.png')
