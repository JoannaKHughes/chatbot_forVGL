#!/usr/bin/env python3
"""Check chatConfig.json: valid JSON, a 'start' node, every 'next' points to a real node.

Usage: python3 tools/validate.py [path/to/chatConfig.json]
Exits 1 on errors. Unreachable nodes are reported as warnings only.
"""
import json
import sys
from pathlib import Path

ALLOWED_UNREACHABLE = set()  # node names allowed to have no incoming link


def main():
	path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / 'chatConfig.json'
	try:
		config = json.loads(path.read_text(encoding='utf-8'))
	except json.JSONDecodeError as e:
		print(f'ERROR {path}: invalid JSON at line {e.lineno}, column {e.colno}: {e.msg}')
		return 1

	errors = []
	if 'start' not in config:
		errors.append("missing 'start' node")
	linked = set()
	for name, node in config.items():
		if not isinstance(node.get('label'), str):
			errors.append(f"{name}: missing 'label'")
		for option in node.get('options', []):
			target = option.get('next')
			if not option.get('text'):
				errors.append(f"{name}: option without 'text'")
			if target not in config:
				errors.append(f"{name}: option '{option.get('text')}' points to unknown node '{target}'")
			linked.add(target)

	for name in config:
		if name != 'start' and name not in linked and name not in ALLOWED_UNREACHABLE:
			print(f'WARN  {name}: no option links to this node')
	for error in errors:
		print(f'ERROR {error}')
	print(f'{len(config)} nodes, {sum(len(n.get("options", [])) for n in config.values())} links, {len(errors)} errors')
	return 1 if errors else 0


if __name__ == '__main__':
	sys.exit(main())
