/*
 * VGL support chatbot — drop-in widget.
 *
 * Add to any page with one line:
 *   <script src="/path/to/vgl-chat.js" defer></script>
 *
 * The script loads vgl-chat.css, chatConfig.json and vglLogo.png from the same folder,
 * builds its own HTML, and remembers its state in sessionStorage so it stays open
 * on the same message when the visitor moves to another page.
 */
(function () {
	'use strict';

	const scriptSrc = document.currentScript ? document.currentScript.src : '';
	const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
	const STORAGE_KEY = 'vglChatState';

	let chatConfig = {};
	let state = loadState();  // { open: boolean, history: [node names] }

	// --- State (sessionStorage: survives page changes, cleared when the tab closes) ---

	function loadState() {
		try {
			const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
			if (saved && Array.isArray(saved.history)) {
				return saved;
			}
		} catch (e) {
			// storage blocked or corrupt: start fresh
		}
		return { open: false, history: ['start'] };
	}

	function saveState() {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			// storage blocked: chat still works, just won't persist
		}
	}

	// --- DOM ---

	const stylesheet = document.createElement('link');
	stylesheet.rel = 'stylesheet';
	stylesheet.href = baseUrl + 'vgl-chat.css';
	document.head.appendChild(stylesheet);

	const root = document.createElement('div');
	root.id = 'vgl-chat';
	root.innerHTML = `
		<button type="button" class="vgl-chat-launcher" aria-controls="vgl-chat-window" aria-expanded="false">
			<img class="vgl-chat-logo" src="${baseUrl}vglLogo.png" alt="" />
			<span>Need help?</span>
		</button>
		<section class="vgl-chat-window" id="vgl-chat-window" role="dialog" aria-label="VGL Support">
			<header class="vgl-chat-header">
				<span class="vgl-chat-title">VGL Support</span>
				<button type="button" class="vgl-chat-close" aria-label="Close chat">&times;</button>
			</header>
			<div class="vgl-chat-body">
				<div class="vgl-chat-message" aria-live="polite"></div>
				<div class="vgl-chat-options"></div>
			</div>
			<nav class="vgl-chat-nav">
				<button type="button" class="vgl-chat-back">&lsaquo; Back</button>
				<button type="button" class="vgl-chat-home">Main menu</button>
			</nav>
		</section>`;
	document.body.appendChild(root);

	const launcher = root.querySelector('.vgl-chat-launcher');
	const chatWindow = root.querySelector('.vgl-chat-window');
	const body = root.querySelector('.vgl-chat-body');
	const message = root.querySelector('.vgl-chat-message');
	const options = root.querySelector('.vgl-chat-options');
	const nav = root.querySelector('.vgl-chat-nav');

	// --- Behavior ---

	function render() {
		root.classList.toggle('vgl-chat-open', state.open);
		launcher.setAttribute('aria-expanded', String(state.open));
		if (!state.open) {
			return;
		}

		const name = state.history[state.history.length - 1];
		const node = chatConfig[name] || chatConfig.start;
		if (!node) {
			return;  // config not loaded yet
		}

		message.innerHTML = node.label;  // labels contain trusted HTML links
		message.querySelectorAll('a').forEach(link => {
			// open links in a new tab so the chat stays where it is
			link.target = '_blank';
			link.rel = 'noopener';
		});

		options.innerHTML = '';
		node.options.forEach(option => {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = option.text;
			button.addEventListener('click', () => go(option.next));
			options.appendChild(button);
		});

		nav.hidden = state.history.length <= 1;
		body.scrollTop = 0;
	}

	function go(name) {
		if (name === 'start' || !chatConfig[name]) {
			state.history = ['start'];
		} else {
			state.history.push(name);
		}
		saveState();
		render();
	}

	function back() {
		if (state.history.length > 1) {
			state.history.pop();
		}
		saveState();
		render();
	}

	function open() {
		state = { open: true, history: ['start'] };
		saveState();
		render();
		chatWindow.querySelector('.vgl-chat-close').focus();
	}

	function close() {
		state = { open: false, history: ['start'] };
		saveState();
		render();
		launcher.focus();
	}

	launcher.addEventListener('click', open);
	root.querySelector('.vgl-chat-close').addEventListener('click', close);
	root.querySelector('.vgl-chat-back').addEventListener('click', back);
	root.querySelector('.vgl-chat-home').addEventListener('click', () => go('start'));
	chatWindow.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			close();
		}
	});

	fetch(baseUrl + 'chatConfig.json')
		.then(response => response.json())
		.then(config => {
			chatConfig = config;
			render();
		})
		.catch(error => console.error('VGL chat: could not load chatConfig.json', error));

	render();
})();
