import sys
from PIL import Image

img = Image.open('assets/copilot-demo.webp')
frames = []
total_dur = 0
durations = []
try:
    for i in range(img.n_frames):
        img.seek(i)
        
        dur = img.info.get('duration', 100)
        if dur == 0: dur = 100
        durations.append(dur)
        frames.append(img.copy())
        
        total_dur += dur
        if total_dur >= 9800:
            break
except EOFError:
    pass

print(f"Extracted {len(frames)} frames. Original had {img.n_frames} frames.")
if len(frames) > 0:
    frames[0].save('assets/copilot-demo-clipped.webp', save_all=True, append_images=frames[1:], duration=durations, loop=0, method=4)
