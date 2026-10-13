from rembg import remove, new_session
from PIL import Image
im=Image.open('/tmp/claude-0/-home-user-Fusion/2f57b70d-37a2-55d6-ac98-2cb6fabdeefc/images/9.webp').convert('RGB')
for m in ['isnet-general-use','u2net']:
    s=new_session(m)
    out=remove(im,session=s)
    out.save(f'cut/{m}.png'); print(m,out.size)
    bg=Image.new('RGBA',out.size,(40,40,160,255)); bg.alpha_composite(out); bg.convert('RGB').save(f'cut/{m}_preview.png')
