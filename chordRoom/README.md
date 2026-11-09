# Chord Room

A dependency-free, static web app for building chords, hearing them, and seeing how each note relates to the root. Built with HTML, CSS, and JavaScript using the Web Audio API.

## Run locally

Open `index.html` in a modern browser, or serve the folder with any static file server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

The app is static and can be deployed to any host that serves HTML, CSS, and JavaScript (for example GitHub Pages, Netlify, Cloudflare Pages, or any standard web host). No build command or server runtime is required. Publish the contents of this folder; `index.html` is the entry point.

## Features

- Two octave clickable keyboard, with root and chord tones highlighted
- Major, minor, diminished, augmented, suspended chords and common extensions
- Root, first, second, and third inversion controls
- Piano, warm keys, and glass synth timbres, synthesized in-browser
- Adjustable volume, simultaneous chord playback, and a short natural decay
- Chord symbols, note intervals, scale degrees, and matching scale suggestions

The typeface is loaded from Google Fonts when online; system sans-serif fallbacks are included.
