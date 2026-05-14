const express = require('express');
const cors = require('cors');

const instrumentosRoutes = require('./src/routes/InstrumentosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({
        message: 'API da Loja de Instrumentos funcionando'
    });
});

app.use(instrumentosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
