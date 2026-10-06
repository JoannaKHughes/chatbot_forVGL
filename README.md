# VGL Chatbot

Click-through support chatbot for the Veterinary Genetics Laboratory, built as a drop-in widget.

## Adding it to a site

Copy these four files to one folder on the web server:

- `vgl-chat.js`
- `vgl-chat.css`
- `chatConfig.json`
- `vglLogo.png`

Then add this one line to the site-wide page template:

```html
<script src="/path/to/vgl-chat.js" defer></script>
```

The script loads the other three files from its own folder and builds its own HTML.
All its CSS is scoped under `#vgl-chat`, with sizes in px, so the host theme can't restyle it.

### Staying open across pages

Each page change on a normal website reloads all scripts. The widget saves `{ open, history }` to
`sessionStorage` on every click and restores it on load, so the chat reopens on the same answer
(and **Back** still works) after the visitor moves to another page.

- Closing the chat, or closing the browser tab, resets it to the main menu.
- Links inside answers open in a new tab, so the chat stays where it is.

## Testing locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/test-site/ — three mock VGL pages (Home, DNA Tests, FAQs) that each
include the widget with the one-line script tag. `test-site/site.css` also contains deliberately
aggressive "host theme" rules (shrunk root font size, styled buttons and links) to check that the
widget holds up against a real site's CSS.

Opening the HTML files directly from disk will not work: the browser blocks loading the JSON.

## Files

| File | Purpose |
|------|---------|
| `chatConfig.json` | The conversation tree (all messages and buttons). **Edit this.** |
| `vgl-chat.js` | The widget: builds the HTML, loads the tree, saves and restores state. |
| `vgl-chat.css` | Widget styles, matched to vgl.ucdavis.edu. |
| `vglLogo.png` | Launcher logo. |
| `index.html` | Bare widget demo. |
| `test-site/` | Mock multi-page VGL site for local testing. |
| `tools/validate.py` | Checks the tree for broken links. |
| `tools/csvtool.py` | Converts the tree to/from CSV for spreadsheet editing. |

## Tree format

Each node has a readable name, a `label` (HTML allowed) and a list of `options`.
Each option's `next` is the name of another node. The chat starts at `start`.

```json
"howToOrder_dog": {
	"label": "What test are you looking to order?",
	"options": [
		{ "text": "Parentage Verification", "next": "howToOrder_dog_parentage" }
	]
}
```

## Editing the conversation

1. Edit `chatConfig.json` directly, **or** run `python3 tools/csvtool.py export`, edit `chatConfig.csv` in a spreadsheet, save as CSV, then run `python3 tools/csvtool.py import`.
2. Run `python3 tools/validate.py` — must report `0 errors`.
3. Preview at http://localhost:8000/test-site/ (see above).
