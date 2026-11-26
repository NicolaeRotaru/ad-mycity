# Base musicale originale per il reel (scritta da programma, nessun brano di altri).
# 96 bpm, accordi caldi da piano elettrico, basso, cassa morbida, shaker; fruscii sui cambi scena.
import numpy as np, wave, sys
SR = 48000; T = 15.0; BPM = 96; B = 60 / BPM
n = int(SR * T); out = np.zeros(n)
t_all = np.arange(n) / SR
rng = np.random.default_rng(7)
def note(f): return 440 * 2 ** ((f - 69) / 12)
def add(sig, start):
    i = int(start * SR); j = min(n, i + len(sig))
    if i < n: out[i:j] += sig[: j - i]
def ep(freq, dur, vol):  # piano elettrico: armoniche + decadimento + tremolo
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 1.6) * np.minimum(1, t / 0.008)
    s = np.sin(2*np.pi*freq*t) + .35*np.sin(2*np.pi*2*freq*t)*np.exp(-t*4) + .12*np.sin(2*np.pi*3*freq*t)*np.exp(-t*7)
    return vol * env * s * (1 + .08*np.sin(2*np.pi*4.5*t))
def bass(freq, dur, vol):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 3) * np.minimum(1, t / 0.005)
    return vol * np.tanh(1.6*np.sin(2*np.pi*freq*t)) * env
def kick(vol):
    t = np.arange(int(.3 * SR)) / SR
    f = 45 + 80*np.exp(-t*30)
    return vol * np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*12)
def shaker(vol):
    m = int(.06 * SR); s = rng.standard_normal(m); s = np.diff(s, prepend=0)  # passa-alto grezzo
    return vol * s * np.exp(-np.arange(m)/SR*60)
def whoosh(dur, vol):
    m = int(dur*SR); s = rng.standard_normal(m)
    k = np.ones(24)/24; s = np.convolve(s, k, 'same')  # passa-basso grezzo
    env = np.sin(np.pi*np.arange(m)/m)**2
    return vol * s * env
def click(vol):
    t = np.arange(int(.05*SR))/SR
    return vol*np.sin(2*np.pi*1700*t)*np.exp(-t*90)
# accordi (MIDI) per battuta: Fmaj7, Am7, Dm7, Bbmaj7, Fmaj7, C6 -> F
chords = [[53,57,60,64],[57,60,64,67],[50,57,60,65],[46,53,57,62],[53,57,60,64],[48,55,60,64]]
roots  = [41,45,38,46,41,48]
bars = int(np.ceil(T / (4*B)))
for b in range(bars):
    c = chords[b % len(chords)]; r = roots[b % len(roots)]; t0 = b*4*B
    for k, m in enumerate(c): add(ep(note(m), 4*B+.6, .11), t0 + k*.012)
    add(ep(note(c[-1]+12), 1.2, .05), t0 + 2.5*B)  # piccola risposta acuta
    for bt, d in [(0, 1.4), (1.5, .45), (2, 1.4), (3.5, .45)]: add(bass(note(r), d*B, .32), t0 + bt*B)
    for bt in (0, 2, 2.75): add(kick(.55), t0 + bt*B)
    for e in range(8): add(shaker(.05 if e % 2 else .025), t0 + e*B/2)
for tt in (2.62, 6.22, 9.82, 12.22): add(whoosh(.6, .22), tt)
add(click(.25), 5.5)
fade = np.ones(n); fo = int(1.4*SR); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
fade[:int(.05*SR)] = np.linspace(0, 1, int(.05*SR))
out *= fade; out /= np.max(np.abs(out)) * 1.12
st = np.stack([out, np.roll(out, 240)*.96], 1)  # un filo di larghezza stereo
pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('musica ok', T, 's')
