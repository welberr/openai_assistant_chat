let threadId = "";

document.addEventListener('DOMContentLoaded', async () => {
    await ready();
});

document.getElementById('sendButton').addEventListener('click', async () => {
    const input = document.getElementById('userInput');
    const userMessage = input.value;

    if (userMessage.trim() === '') {
        return;
    }

    await createUserMessage(userMessage);
    await clearInputChat();
    await showTypingIndicator();

    const response = await executeRun(userMessage);

    if (!response.ok) {
        await simulateAssistantTyping("Error to execute run.");
        return;
    }

    const typingIndicator = document.querySelector('.typing');
    if (typingIndicator) typingIndicator.remove();

    let container = document.querySelector('.chat-box');
    container.insertAdjacentHTML('beforeend', `
        <div class="message assistant-message">
            <div class="message-avatar">
                <img src="images/openai.png" alt="Avatar">
            </div>
            <div class="message-content">
                <p></p>
            </div>
        </div>
    `);

    const reader = response.body.getReader();

    const readStream = async () => {
        try {
            const { done, value } = await reader.read();
    
            if (done) {
                return;
            }
    
            var text = new TextDecoder().decode(value);
            await streamAssistantTyping(text);

            await readStream();
        } catch (error) {
            await simulateAssistantTyping("Error to execute  run.");
        }
    }
    
    await readStream();
});

async function ready() {

    await createThread();
    await showTypingIndicator();
    await simulateAssistantTyping("Hello! I am the OpenAI Assistant, ask me something so I can help you.");
}

async function createUserMessage(text){
    const container = document.querySelector('.chat-box');

    container.insertAdjacentHTML('beforeend', `
        <div class="message user-message">
            <div class="message-content">
                <p>${text}</p>
            </div>
            <div class="message-user-avatar">
                <img src="images/user.png" alt="Avatar">
            </div>
        </div>
    `);
}

async function clearInputChat() {
    document.getElementById('userInput').value = '';
}

async function showTypingIndicator() {
    const container = document.querySelector('.chat-box');
    container.insertAdjacentHTML('beforeend', `
        <div class="message assistant-message typing">
            <div class="message-avatar">
                <img src="images/openai.png" alt="Avatar">
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `);
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function streamAssistantTyping(message){
    setTimeout(async () => {
        let container = document.querySelector('.chat-box');
        let messageContainer = container.lastElementChild.querySelector('.message-content p');
        await typeText(messageContainer, message);
    }, 2000);
}

async function simulateAssistantTyping(message) {
    setTimeout(async () => {
        const typingIndicator = document.querySelector('.typing');
        if (typingIndicator) typingIndicator.remove();

        let container = document.querySelector('.chat-box');
        container.insertAdjacentHTML('beforeend', `
            <div class="message assistant-message">
                <div class="message-avatar">
                    <img src="images/openai.png" alt="Avatar">
                </div>
                <div class="message-content">
                    <p></p>
                </div>
            </div>
        `);

        let messageContainer = container.lastElementChild.querySelector('.message-content p');
        await typeText(messageContainer, message);
    }, 2000);
}

async function typeText(element, text) {
    return new Promise((resolve) => {
        let index = 0;
        const interval = setInterval(() => {
            element.textContent += text[index];
            index++;
            if (index === text.length) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}

async function createThread(){
    try {
        const response = await fetch('/openai/thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            threadId = data.threadId;
        } else {
            console.error('Erro ao criar a thread:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

async function executeRun(userMessage){
    try {
        const response = await fetch('/openai/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ threadId, userMessage})
        });

        if (response.ok) {
            return await response;
        } else {
            console.error('Erro ao executar run:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}
