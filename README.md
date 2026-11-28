# TrustyLoop for YouTube

Loop a whole YouTube video, or just the part between A and B. Use it from the toolbar or from the controls right under the video.

![TrustyLoop popup in light and dark theme](screenshots/readme-popup.png)

## Install (Chrome or Brave)

1. Open `chrome://extensions` (Brave: `brave://extensions`) and turn on **Developer mode**.
2. Click **Load unpacked** and choose this folder.
3. Reload any YouTube tab that was already open.

## Use

**Under the video**, next to Subscribe:

<img src="screenshots/readme-under-video.png" alt="The loop button next to Subscribe, then looping 4:36 to 5:05 with A and B set" width="440">

- Click the **loop** button to repeat the whole video. **A | B** slides out to its left.
- Click **A** at the start of the part and **B** at its end: only that part repeats.
- Click the loop button again to stop everything.

**In the popup** (toolbar icon): the same controls, a switch to show or hide the controls under the video (on by default), plus a light/dark toggle. Both stay in sync.

A new video starts without a loop. The controls under the video follow YouTube's own light or dark theme. On music.youtube.com they float above the player bar.

## Privacy

No network access, no analytics. The only thing saved is whether to show the controls under the video. It runs only on youtube.com and music.youtube.com.

## Files

| File | Job |
| --- | --- |
| `manifest.json` | Runs only on YouTube; asks only for storage (the show/hide choice) |
| `content.js` | The loop logic and the controls under the video |
| `popup.html`, `popup.js` | The toolbar popup |
| `popup.css` | Popup styles, shared with the other Trusty extensions |
| `theme.js` | Light/dark toggle for the popup |
| `screenshots/` | Images for this page and the Chrome Web Store (not part of the extension) |

## License

Copyright (c) 2026 zkrogfoss. [MIT](LICENSE), without any warranty.
