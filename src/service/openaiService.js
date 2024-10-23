const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const createThread = async () => {
    try {
        const thread = await openaiClient.beta.threads.create();
        return thread.id;

    } catch (error) {
        throw new Error(`An error occurred in the method: CreateThread - ${error.message}`);
    }
};

const executeRun = async (threadId, userMessage, cb) => {
    try {
        await openaiClient.beta.threads.messages.create(
            threadId,
            {
                role: 'user',
                content: userMessage,
            },
        );

        let options = {
            assistant_id: process.env.OPENAI_ASSISTANT_ID,
            stream: true
        };

        const stream = await openaiClient.beta.threads.runs.create(threadId, options);

        await printMessages(stream, cb);
  
    } catch (error) {
        throw new Error(`Erro ao executar run: ${error.message}`);
    }
};

const printMessages = async (stream, cb) => {
    for await (const event of stream) {
        if (event.event === 'thread.message.delta') {
            const chunk = event.data.delta.content[0];
            if (chunk && 'text' in chunk && chunk.text.value) {
                cb(chunk.text.value);
            }
        }

        if (event.event === 'thread.run.failed') {
            cb(event.data.last_error.message);
        }
    }
};

module.exports = { createThread, executeRun };