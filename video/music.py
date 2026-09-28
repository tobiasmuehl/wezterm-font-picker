"""Synthesize the ad's soundtrack: 20 s, 120 BPM (40 beats, 10 bars), A minor.

Every hit sits on a time used in video/Ad.tsx, so cuts land on the beat. Output: video/music.wav (mono, 16-bit).
Run: python3 video/music.py
"""
import wave
from pathlib import Path
import numpy as np

SR, T, BEAT = 44100, 20.0, 0.5
N = int(SR * T)
out = np.zeros(N)
rng = np.random.default_rng(7)

def ts(d): return np.arange(int(d * SR)) / SR
def add(sig, at, gain=1.0):
    i = int(round(at * SR)); j = min(N, i + len(sig))
    if i < N: out[i:j] += sig[:j - i] * gain
def lowpass(x, width):  # ponytail: moving-average low-pass, fine for a synth sketch
    return np.convolve(x, np.ones(width) / width, mode='same')
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def note(n): return 440 * 2 ** ((n - 69) / 12)  # MIDI → Hz

def kick(d=0.4):
    t = ts(d); f = 42 + 130 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    return np.tanh(body * 1.8) * 1.25
def hat(d=0.05):
    return np.diff(noise(d), prepend=0) * np.exp(-ts(d) / 0.012) * 0.5
def clap():
    t = ts(0.25); body = np.diff(noise(0.25), prepend=0) * np.exp(-t / 0.07)
    return sum(np.roll(body, int(o * SR)) for o in (0, 0.011, 0.022)) / 2
def bass(midi, d=0.24):
    t = ts(d); saw = 2 * ((t * note(midi)) % 1) - 1
    sub = np.sin(2 * np.pi * note(midi - 12) * t)
    return (lowpass(saw, 40) * 0.8 + sub * 1.1) * np.minimum(1, t / 0.005) * np.exp(-t / 0.2)
def pluck(midi, d=0.6, decay=0.22):
    t = ts(d); f = note(midi)
    return sum(np.sin(2 * np.pi * f * h * t) / h ** 1.6 for h in range(1, 7)) * np.exp(-t / decay) * np.minimum(1, t / 0.002)
def pad(midis, d):
    t = ts(d)
    x = sum(2 * ((t * note(m) * det) % 1) - 1 for m in midis for det in (0.997, 1.003))
    return lowpass(x, 90) / len(midis) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
def riser(d):
    t = ts(d); r = t / d
    return (lowpass(noise(d), 12) * (1 - r) + np.diff(noise(d), prepend=0) * r) * r ** 2
def impact():
    t = ts(1.2)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t / 0.2)) / SR) * np.exp(-t / 0.5)
    return kick(1.2) * 1.0 + sub * 1.3 + lowpass(noise(1.2), 6) * np.exp(-t / 0.35) * 0.7
def click():
    t = ts(0.02); return np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.004)

# One chord map for the whole piece: minor while searching, major once the font is found.
CHORDS = {'Am': (45, (57, 60, 64)), 'F': (41, (53, 57, 60)), 'G': (43, (55, 59, 62)), 'C': (48, (55, 60, 64)),
          'Esus': (40, (57, 59, 64)), 'E': (40, (56, 59, 64))}
SCHEDULE = [(0, 'Am'), (2.0, 'F'), (3.5, 'Esus'), (4.25, 'E'), (5.0, 'Am'), (7.0, 'F'), (8.5, 'G'), (9.5, 'E'),
            (10.5, 'C'), (14.0, 'G'), (16.0, 'Am'), (18.0, 'F'), (20.0, None)]
def chord_at(t): return CHORDS[[c for at, c in SCHEDULE if at <= t + 1e-9][-1]]

def groove(a, b, full):
    t = a
    while t < b - 1e-9:
        root = chord_at(t)[0]
        add(kick(), t, 0.9)
        add(hat(), t + 0.25, 0.35)
        if full:
            add(hat(), t + 0.125, 0.15); add(hat(), t + 0.375, 0.15)
            if round(t / BEAT) % 2: add(clap(), t, 0.45)
        for e in (0, 0.25):
            add(bass(root + (12 if e and full else 0)), t + e, 0.55)
        t += BEAT

# The motif: E G A G E + an ending that tells the story (D = question, C = found). One lead voice throughout.
E5, G5, A5, C6, D5, D6, E6, C5 = 76, 79, 81, 84, 74, 86, 88, 72
MELODY = [
    # "So many terminal fonts." — first statement, one note per word, left hanging on D
    (1.25, E5, .25), (1.5, G5, .25), (1.75, A5, .25), (2.0, G5, .5), (2.5, E5, .25), (2.75, D5, .75),
    # "How do you pick one?" — same motif, faster, the question hangs on D over E
    (3.5, E5, .125), (3.625, G5, .125), (3.75, A5, .125), (3.875, G5, .125), (4.0, D5, 1.0),
    # Duels — the motif's rise becomes a ladder; each key press is a higher peak (A → C → D → E)
    (5.5, E5, .25), (5.75, G5, .25), (6.0, A5, .5),
    (7.25, G5, .25), (7.5, A5, .25), (7.75, C6, .5),
    (8.5, A5, .25), (8.75, C6, .25), (9.0, D6, .5),
    (9.5, D6, .25), (9.75, E6, .25),
    # "Pick by eye. Find your font." — the motif resolves, up to C
    (10.5, E5, .25), (10.75, G5, .25), (11.0, C6, 1.0),
    # End card — slow, warm reprise in major, settling on C
    (12.0, E5, .5), (12.5, G5, .5), (13.0, A5, .5), (13.5, G5, .5), (14.0, E5, 1.0), (15.0, D5, 1.0),
    (16.0, E5, .5), (16.5, G5, .5), (17.0, A5, .5), (17.5, G5, .5), (18.0, E5, .5), (18.5, C5, 1.25),
]
def lead(midi, dur):
    d = dur + 0.6
    return pluck(midi, d, 0.12 + dur * 0.5) + pluck(midi - 12, d, 0.1 + dur * 0.4) * 0.35

def pads(gain_at):
    for (a, c), (b, _) in zip(SCHEDULE, SCHEDULE[1:]):
        add(pad(CHORDS[c][1], b - a + 0.3), a, gain_at(a))

# 0–1.0 cursor blinks, then the stretch into the wall
add(click(), 0.0, 0.5); add(click(), 0.5, 0.5); add(riser(0.5), 0.5, 0.35)
add(impact(), 1.0)
groove(1.0, 3.5, full=False)
# 3.5–5.0 question — half-time
add(riser(0.5), 3.0, 0.4); add(impact(), 3.5); add(kick(), 4.5, 0.8)
# 5.0–10.0 duels — full groove, a hit on every key press
add(riser(0.5), 4.5, 0.5); add(impact(), 5.0)
groove(5.0, 10.0, full=True)
for at in (6.0, 7.75, 9.0, 9.75): add(clap(), at, 0.7); add(impact(), at, 0.45)
# 10.0–12.0 zoom (melody breathes), then the resolution
add(riser(0.5)[::-1], 10.0, 0.4); add(impact(), 10.5); add(kick(), 11.0, 0.7)
add(riser(0.5), 11.5, 0.4); add(impact(), 12.0)
# 12.0–19.75 end card — soft kick per bar, gentle hats
for bar in range(4):
    at = 12.0 + bar * 2
    add(kick(), at, 0.5)
    for j in range(4): add(hat(), at + j * 0.5 + 0.25, 0.12)
pads(lambda a: 0.3 if 3.5 <= a < 5 or a >= 10.5 else 0.14)
for at, m, dur in MELODY: add(lead(m, dur), at, 0.32)
fade = np.clip((19.75 - np.arange(N) / SR) / 1.5, 0, 1)
fade[:int(18.25 * SR)] = 1
out *= fade
add(click(), 19.75, 0.5)

out = np.tanh(out * 1.2)
out *= 0.89 / np.abs(out).max()
path = Path(__file__).resolve().parent / 'music.wav'
with wave.open(str(path), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print(f'wrote {path.name} ({T:.0f}s)')
