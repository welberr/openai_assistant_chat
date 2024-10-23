const express = require('express');
const path = require('path');
const openaiRouter = require('./routes/openai');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/openai', openaiRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});