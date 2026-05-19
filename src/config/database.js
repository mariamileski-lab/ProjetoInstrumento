const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senai2025',
    database: 'Instrumentos'
});

connection.connect((err) => {
    if (err) {
        console.log('Erro ao conectar no banco');
        return;
    }

    console.log('Banco conectado com sucesso');
});

module.exports = connection;