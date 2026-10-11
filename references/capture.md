# Real browser capture

The demo recorder uses the [Playwright video API](https://playwright.dev/docs/videos). It starts a fresh local browser context, records the viewport, waits for the real Canvas first frame, moves the actual mouse across the apple, lets the particles recover, then clicks Bird and records its wing strokes. The video is finalized by closing the context before FFmpeg reads it.

```sh
npm ci
npx playwright install chromium
npm run record
```

If Chromium is already installed, set `CHROMIUM_PATH=/usr/bin/chromium`. Playwright still needs its FFmpeg helper for video recording (`npx playwright install ffmpeg`). The script starts its own loopback server; it never opens the user's signed-in browser or posts anything. Python 3 and FFmpeg must be on PATH.

Outputs:

- `media/apple-bird.gif`: browser-recorded animation, sized for sharing.
- `output/playwright/recording.webm`: original viewport capture, ignored by Git.
- `output/playwright/recording.json`: dimensions, duration and actual interaction samples.

The app's `?capture=1` cursor is a DOM overlay driven by real pointer events. It makes the mouse visible in viewport recording. Particle animation and scattering are the same code path as normal use. No animation clock is fast-forwarded for the GIF.

The recorder uses palette generation followed by palette application, 18 fps and 960-pixel width. Inspect a contact sheet, playback and the encoded metadata. Keep the beginning free of loading states and the end long enough to see restoration. If the upload target rejects the size, reduce resolution/frame rate or shorten the capture; retain the original master.

The GIF shows desktop mouse interaction and two procedural objects. The separate browser checks exercise emulated touch, reduced motion, theme changes and lifecycle. Neither establishes performance on a physical phone. X may transcode the uploaded GIF; retain both the original GIF and the post's visible accepted media state. [X's photo/GIF posting help](https://help.x.com/en/using-x/posting-gifs-and-pictures) describes attachment and posting.
