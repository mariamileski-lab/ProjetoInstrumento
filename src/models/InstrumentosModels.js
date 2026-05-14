const connection = require('../config/database');

const db = connection.promise();

class InstrumentosModels {
    async listar() {
        const [instrumentos] = await db.query(
            `SELECT
                p.id_produto,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.id_categoria,
                c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             ORDER BY p.id_produto DESC`
        );

        return instrumentos;
    }

    async buscarPorId(id) {
        const [instrumentos] = await db.query(
            `SELECT
                p.id_produto,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.id_categoria,
                c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             WHERE p.id_produto = ?`,
            [id]
        );

        return instrumentos[0];
    }

    async criar(instrumento) {
        const {
            nome,
            descricao,
            preco,
            estoque,
            id_categoria
        } = instrumento;

        const [resultado] = await db.query(
            `INSERT INTO produtos
                (nome, descricao, preco, estoque, id_categoria)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, descricao, preco, estoque, id_categoria]
        );

        return {
            id_produto: resultado.insertId,
            nome,
            descricao,
            preco,
            estoque,
            id_categoria
        };
    }

    async atualizar(id, instrumento) {
        const {
            nome,
            descricao,
            preco,
            estoque,
            id_categoria
        } = instrumento;

        const [resultado] = await db.query(
            `UPDATE produtos
             SET nome = ?, descricao = ?, preco = ?, estoque = ?, id_categoria = ?
             WHERE id_produto = ?`,
            [nome, descricao, preco, estoque, id_categoria, id]
        );

        return resultado.affectedRows > 0;
    }

    async deletar(id) {
        const [resultado] = await db.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

module.exports = new InstrumentosModels();
