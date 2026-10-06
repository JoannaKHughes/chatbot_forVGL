#!/usr/bin/env python3
"""Round-trip chatConfig.json through a spreadsheet-friendly CSV.

  python3 tools/csvtool.py export            # chatConfig.json -> chatConfig.csv
  python3 tools/csvtool.py import            # chatConfig.csv  -> chatConfig.json (then validates)

CSV layout: one row per node. Columns: node, label, then option1_text, option1_next, option2_text, ...
Open the CSV in Excel/Google Sheets, edit, save as CSV (UTF-8), then import.
"""
import csv
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / 'chatConfig.json'
CSV_PATH = ROOT / 'chatConfig.csv'


def export():
	config = json.loads(JSON_PATH.read_text(encoding='utf-8'))
	width = max(len(node['options']) for node in config.values())
	header = ['node', 'label'] + [f'option{i}_{part}' for i in range(1, width + 1) for part in ('text', 'next')]
	with CSV_PATH.open('w', newline='', encoding='utf-8-sig') as f:
		writer = csv.writer(f)
		writer.writerow(header)
		for name, node in config.items():
			row = [name, node['label']]
			for option in node['options']:
				row += [option['text'], option['next']]
			writer.writerow(row)
	print(f'Wrote {CSV_PATH.name} ({len(config)} nodes)')


def import_():
	config = {}
	with CSV_PATH.open(newline='', encoding='utf-8-sig') as f:
		reader = csv.reader(f)
		next(reader)
		for row in reader:
			if not row or not row[0].strip():
				continue
			cells = row[2:]
			options = [{'text': cells[i], 'next': cells[i + 1].strip()}
				for i in range(0, len(cells) - 1, 2) if cells[i].strip()]
			config[row[0].strip()] = {'label': row[1], 'options': options}
	JSON_PATH.write_text(json.dumps(config, indent='\t', ensure_ascii=False) + '\n', encoding='utf-8')
	print(f'Wrote {JSON_PATH.name} ({len(config)} nodes)')
	return subprocess.call([sys.executable, str(ROOT / 'tools' / 'validate.py')])


if __name__ == '__main__':
	command = sys.argv[1] if len(sys.argv) > 1 else ''
	if command == 'export':
		export()
	elif command == 'import':
		sys.exit(import_())
	else:
		print(__doc__)
		sys.exit(2)
