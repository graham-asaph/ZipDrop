# ZipDrop-web

ZipDrop-web is a browser-based MVP for ZipDrop that runs 100% client-side.
No backend, no file uploads, and no build pipeline are required.

## What This MVP Includes

- Multi-file selection via drag-and-drop or file picker
- ZIP compression in the browser using JSZip (CDN)
- Auto-download of generated ZIP files
- Optional share flow using Web Share API (when supported)
- ZIP preview (list files inside a ZIP)
- Extract-all behavior (downloads each file individually)
- Light/Dark mode toggle persisted in localStorage
- Responsive layout for desktop and mobile

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- JSZip via CDN: https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js

## Project Structure

```text
ZipDrop-web/
|-- index.html
|-- style.css
|-- app.js
`-- README.md
```

## Run Locally

No install step is needed.

1. Clone this repository.
2. Open `index.html` in a browser.
3. Start compressing files directly on your device.

Tip: For the best local development workflow, use VS Code Live Server or any static file server.

## Deploy to GitHub Pages (No Build Step)

1. Create or fork a repository named `ZipDrop-web`.
2. Add the project files (`index.html`, `style.css`, `app.js`, `README.md`) to the `main` branch.
3. Push your changes to GitHub.
4. Go to repository Settings.
5. Open the Pages section.
6. Under Source, choose Deploy from a branch.
7. Select Branch: `main` and Folder: `/ (root)`.
8. Click Save.
9. Wait for GitHub Pages to publish your site.

Your app URL pattern will be:

https://username.github.io/ZipDrop-web/

Replace `username` with your GitHub username.

## Notes and Limitations

- Compression and extraction run fully in the browser.
- No data is sent to a server by this app.
- Password-protected ZIP generation is intentionally out of MVP scope.
- Browser ZIP encryption support is limited and not implemented here.
- Web Share API support varies by browser and device.

## License

MIT (or your preferred license)
