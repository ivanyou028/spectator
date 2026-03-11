import sys
from PIL import Image

img = Image.open('assets/copilot-demo.webp')
frames = []
durations = []
try:
    for i in range(img.n_frames):
        img.seek(i)
        dur = img.info.get('duration', 100)
        durations.append(dur)
        # Convert to P mode for GIF
        frames.append(img.copy().convert('P', palette=Image.ADAPTIVE))
except EOFError:
    pass

if len(frames) > 0:
    frames[0].save('assets/copilot-demo.gif', save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
