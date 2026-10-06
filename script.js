// Conversation tree lives in chatConfig.json (edit it there, then run: python3 tools/validate.py)
let chatConfig = {};
fetch('chatConfig.json')
	.then(response => response.json())
	.then(config => { chatConfig = config; })
	.catch(error => console.error('Could not load chatConfig.json', error));

// DOM Elements
const chatIcon = document.getElementById('chat-icon');
const chatbox = document.getElementById('chatbox');
const greeting = document.getElementById('greeting');
const optionsDiv = document.getElementById('options');
const exit = document.getElementById('exit');

function openChat() {
	chatbox.classList.add('open');
	chatIcon.classList.add('hidden');
	chatIcon.setAttribute('aria-expanded', 'true');
	displayMessage(chatConfig.start);
}

function closeChat() {
	chatbox.classList.remove('open');
	chatIcon.classList.remove('hidden');
	chatIcon.setAttribute('aria-expanded', 'false');
	chatIcon.focus();
}

chatIcon.addEventListener('click', openChat);
exit.addEventListener('click', closeChat);

// Function to display the message and options
function displayMessage(node) {
    if (!node) return;  // config not loaded yet
    greeting.innerHTML = node.label;  // Using innerHTML to allow HTML tags to render
    optionsDiv.innerHTML = '';
    greeting.parentElement.scrollTop = 0;
    node.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => {
            const nextNode = chatConfig[option.next];
            displayMessage(nextNode || chatConfig.start);  // unknown node: back to main menu
        });
        optionsDiv.appendChild(button);
    });
}
