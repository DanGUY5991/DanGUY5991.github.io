# Blackfoot Sounds — mic compare (Aa / Yes)

Installable PWA hosted under this user site:

**https://danguy5991.github.io/blackfoot-sounds/**

## Flow

1. Play sample (`assets/aa-yes.mp3`)
2. Record your try
3. Compare waveforms
4. Read advice for the next try

## PWA

- `manifest.webmanifest` — standalone install
- `sw.js` — caches the shell + sample audio
- `icons/` — app icons
- QR on the page → public HTTPS Pages URL (not localhost)

Mic requires HTTPS (or localhost). GitHub Pages provides HTTPS after merge to `main`.
