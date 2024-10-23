const express = require('express');
const openaiService =  require('../service/openaiService');

const router = express.Router();

router.post('/thread', async (request, response) => {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');

    try {
        const threadId = await openaiService.createThread();
        return response.status(201).json({ threadId });
    } catch (error) {
        if (!response.headersSent) {
            return response.status(500).send(`Erro interno do servidor: ${error.message}`);
        } else {
            console.error('Erro após envio dos headers:', error);
        }
    }
});

router.post('/run', async (request, response) => {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
  
    try {
        const { threadId, userMessage } = request.body;
  
        if (threadId.length === 0) {
            return response.status(400).send('ThreadId Missing!');
        }

        await openaiService.executeRun(
            threadId,
            userMessage,
            (text) => {
                response.write(text);
            }
        );
     
        response.end();
  
    } catch (error) {
        if (!response.headersSent) {
            response.status(500).send(`Erro interno do servidor: ${error.message}`);
        } else {
            console.error('Erro após envio dos headers:', error);
        }
    }
});

module.exports = router;