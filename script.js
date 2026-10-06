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

chatIcon.addEventListener('click', function() {
    if (chatbox.style.display === 'none' || chatbox.style.display === '') {
        chatbox.style.display = 'block';
        displayMessage(chatConfig.start);
    chatIcon.style.display = 'none';
    } else {
        chatbox.style.display = 'none';
		chatIcon.style.dsiplay = 'none';
    }
});

//exit
exit.addEventListener('click', function() {
	 if (chatIcon.style.display === 'none' || chatIcon.style.display === ''){
    chatbox.style.display = 'none';
    chatIcon.style.display = '';
	 }
	 else{
		 
        chatbox.style.display = 'block';
        displayMessage(chatConfig.start);
    chatIcon.style.display = 'none';
	 }
});

// Function to display the message and options
function displayMessage(node) {
    if (!node) return;  // config not loaded yet
    greeting.innerHTML = node.label;  // Using innerHTML to allow HTML tags to render
    optionsDiv.innerHTML = '';
    node.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => {
            const nextNode = chatConfig[option.next];
            if (nextNode) {
                displayMessage(nextNode);
            } else {
                alert('End of conversation!');
                // Optionally, you can add a reset function here to start over
            }
        });
        optionsDiv.appendChild(button);
    });
}
