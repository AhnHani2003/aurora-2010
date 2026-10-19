"""Create a transparent display asset; preserve the supplied portrait verbatim.

Only near-black pixels connected to the image perimeter become transparent.
Dark interior hair, eyes and clothing details are never globally color-keyed.
Run: python scripts/prepare-portrait.py (Pillow required).
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "public/assets/tom/portrait.png"
destination = ROOT / "public/assets/tom/layers"
destination.mkdir(parents=True, exist_ok=True)
image = Image.open(source).convert("RGB")
width, height = image.size
pixels = image.load()
visited = bytearray(width * height)
queue = deque()

def enqueue(x, y):
    index = y * width + x
    if not visited[index] and max(pixels[x, y]) <= 21:
        visited[index] = 1
        queue.append((x, y))

for x in range(width):
    enqueue(x, 0)
    enqueue(x, height - 1)
for y in range(height):
    enqueue(0, y)
    enqueue(width - 1, y)
while queue:
    x, y = queue.popleft()
    if x:
        enqueue(x - 1, y)
    if x + 1 < width:
        enqueue(x + 1, y)
    if y:
        enqueue(x, y - 1)
    if y + 1 < height:
        enqueue(x, y + 1)

alpha = Image.frombytes("L", image.size, bytes(0 if pixel else 255 for pixel in visited))
# Subpixel softening removes a hard fringe without eroding the hair silhouette.
alpha = alpha.filter(ImageFilter.GaussianBlur(0.55))
image.putalpha(alpha)
image.thumbnail((970, 1024), Image.Resampling.LANCZOS)
image.save(destination / "portrait-cutout.webp", "WEBP", quality=94, method=6)
print(f"Preserved {source.name}; wrote {image.width}x{image.height} RGBA cutout.")
