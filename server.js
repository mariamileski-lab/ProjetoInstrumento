const express = require('express');
const cors = require('cors');
const path = require('path');

const instrumentosRoutes = require('./src/routes/InstrumentosRoutes');
const docsRoutes = require('./src/routes/docsRoutes');
const { notFoundHandler, errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     return res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.use(docsRoutes);
app.use(instrumentosRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;
