"""Electronics workbench icon. Opaque square; iOS applies its own mask."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
image = Image.new('RGB', (1024, 1024), '#243e39')
d = ImageDraw.Draw(image)
cream = '#f7f6ef'
orange = '#e65b32'
# Breadboard silhouette, rails, center channel and generous socket spacing.
d.rounded_rectangle((154, 356, 870, 850), radius=60, fill='#172e29')
d.rounded_rectangle((154, 338, 870, 832), radius=60, fill=cream)
d.rounded_rectangle((198, 388, 826, 402), radius=7, fill=orange)
d.rounded_rectangle((198, 766, 826, 780), radius=7, fill='#347e72')
d.rounded_rectangle((198, 570, 826, 594), radius=12, fill='#d7d9cc')
for y in (449, 511, 652, 714):
    for x in range(224, 825, 60):
        d.ellipse((x-9, y-9, x+9, y+9), fill='#89998c')
# Two oversized jumper wires. Rounded paths read clearly at home-screen size.
def wire(points, color):
    d.line(points, fill=color, width=30, joint='curve')
    for x,y in points:
        d.ellipse((x-15,y-15,x+15,y+15), fill=color)
wire([(284, 511), (284, 278), (412, 278), (412, 449)], orange)
wire([(704, 511), (762, 511), (762, 652), (644, 652)], '#347e72')
# Series resistor bridges the breadboard channel.
d.line([(344, 511), (344, 714)], fill='#637a70', width=16)
d.rounded_rectangle((312, 548, 376, 677), radius=18, fill='#d6b570')
for y,color in ((568,'#b3462f'),(596,'#b3462f'),(624,'#563e30')):
    d.rectangle((314,y,374,y+12), fill=color)
# Prominent lit LED with two separate leads, flange and highlight.
d.line([(522, 361), (522, 449)], fill='#89998c', width=18)
d.line([(602, 361), (602, 511)], fill='#89998c', width=18)
d.rounded_rectangle((486, 207, 638, 371), radius=72, fill=orange)
d.rectangle((486, 296, 638, 371), fill=orange)
d.rounded_rectangle((469, 356, 655, 384), radius=12, fill='#ff9d59')
d.rounded_rectangle((511, 238, 531, 307), radius=10, fill='#ffe5a7')
# Light rays, not a generic robot mascot.
for a,b in (((560,146),(560,108)),((466,171),(438,143)),((655,171),(684,143)),((681,250),(721,250))):
    d.line([a,b], fill='#f5c86d', width=16)
    for x,y in (a,b):
        d.ellipse((x-8,y-8,x+8,y+8), fill='#f5c86d')
assets = ROOT / 'icons'
assets.mkdir(exist_ok=True)
for size in (180, 192, 512, 1024):
    target = ROOT / 'apple-touch-icon.png' if size == 180 else assets / f'icon-{size}.png'
    image.resize((size, size), Image.Resampling.LANCZOS).save(target)
    print(target.relative_to(ROOT))
