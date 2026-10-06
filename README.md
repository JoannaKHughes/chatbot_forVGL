# VGL Chatbot

Click-through support chatbot for the Veterinary Genetics Laboratory.

## Files

| File | Purpose |
|------|---------|
| `chatConfig.json` | The conversation tree (all messages and buttons). **Edit this.** |
| `script.js` | Loads `chatConfig.json` and renders the chat. |
| `index.html`, `style.css`, `vglLogo.png` | Page and styling. |
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

## Editing

1. Edit `chatConfig.json` directly, **or** run `python3 tools/csvtool.py export`, edit `chatConfig.csv` in a spreadsheet, save as CSV, then run `python3 tools/csvtool.py import`.
2. Run `python3 tools/validate.py` — must report `0 errors`.
3. Preview: `python3 -m http.server 8000`, then open http://localhost:8000.
   (Opening `index.html` directly from disk will not load the JSON.)
