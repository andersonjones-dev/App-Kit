# App-Kit

The shared pieces every Anderson Jones app uses, kept in **one file**: `v1/kit.js`.

| Piece | What it does |
|---|---|
| `about` | The "© 2026 Anderson Jones · About" link and the About panel |
| `install` | The slim "Add this app to your Home Screen" strip at the top (phones only, hidden once installed) |
| `update` | The "A new version is ready" bar with an Update button |

Fix something in `v1/kit.js` once and **every app picks it up** the next time it is opened with internet
(each app shows its saved copy first, then saves the newest copy in the background).

## Using it in an app

One tag per piece, all pointing at the same file:

```html
<script src="/App-Kit/v1/kit.js" data-part="about" data-app="App name" data-desc="One sentence." data-fine="Optional small print." data-host="#app"></script>
<script src="/App-Kit/v1/kit.js" data-part="install" data-app="App name" data-shrink="#app"></script>
<script src="/App-Kit/v1/kit.js" data-part="update" data-app="App name"></script>
```

Apps hosted somewhere else (ChurchOS on Vercel) use the full address:
`https://andersonjones-dev.github.io/App-Kit/v1/kit.js`

In the app's `sw.js`: add `'/App-Kit/v1/kit.js'` to the list of saved files, and add the App-Kit block
at the top of the fetch handler (copy it from any existing app) so it works offline.

## Rules

- Keep changes backwards-compatible. If a change would break older apps, put it in a new `v2/` folder instead.
- Test on a phone after each change: open two or three apps, close them, open again.
