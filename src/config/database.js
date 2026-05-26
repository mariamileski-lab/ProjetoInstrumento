const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senai2025',
    database: process.env.DB_NAME || 'Instrumentos'
});

if (process.env.NODE_ENV !== 'test') {
    connection.connect((err) => {
        if (err) {
            console.log('Erro ao conectar no banco');
            return;
        }

        console.log('Banco conectado com sucesso');
    });
}

module.exports = connection;
