const connection = require('../config/database');

const db = connection.promise();

class InstrumentosModels {
    async listar(paginacao = null) {
        const limiteSql = this.montarLimiteSql(paginacao);

        const [instrumentos] = await db.query(
            `SELECT
                p.*,
                c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             ORDER BY p.id_produto DESC
             ${limiteSql.sql}`,
            limiteSql.parametros
        );

        return this.montarRespostaPaginada(
            instrumentos,
            paginacao,
            'SELECT COUNT(*) AS total FROM produtos'
        );
    }

    async buscarPorId(id) {
        const [instrumentos] = await db.query(
            `SELECT
                p.*,
                c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             WHERE p.id_produto = ?`,
            [id]
        );

        return instrumentos[0];
    }

    async buscarProdutos(filtros) {
        const condicoes = [];
        const parametros = [];

        if (filtros.marca) {
            await this.garantirColunaMarcaSeNecessario();
        }

        if (filtros.nome) {
            condicoes.push('p.nome LIKE ?');
            parametros.push(`%${filtros.nome}%`);
        }

        if (filtros.categoria) {
            if (Number.isInteger(Number(filtros.categoria))) {
                condicoes.push('p.id_categoria = ?');
                parametros.push(Number(filtros.categoria));
            } else {
                condicoes.push('c.nome LIKE ?');
                parametros.push(`%${filtros.categoria}%`);
            }
        }

        if (filtros.precoMin !== null) {
            condicoes.push('p.preco >= ?');
            parametros.push(filtros.precoMin);
        }

        if (filtros.precoMax !== null) {
            condicoes.push('p.preco <= ?');
            parametros.push(filtros.precoMax);
        }

        if (filtros.marca) {
            condicoes.push('p.marca LIKE ?');
            parametros.push(`%${filtros.marca}%`);
        }

        const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

        const limiteSql = this.montarLimiteSql(filtros.paginacao);

        const [produtos] = await db.query(
            `SELECT
                p.*,
                c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             ${where}
             ORDER BY p.id_produto DESC
             ${limiteSql.sql}`,
            [...parametros, ...limiteSql.parametros]
        );

        return this.montarRespostaPaginada(
            produtos,
            filtros.paginacao,
            `SELECT COUNT(*) AS total
             FROM produtos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
             ${where}`,
            parametros
        );
    }

    async criar(instrumento) {
        await this.garantirColunaMarcaSeNecessario();

        const {
            nome,
            descricao,
            preco,
            estoque,
            id_categoria,
            marca
        } = instrumento;

        const [resultado] = await db.query(
            `INSERT INTO produtos
                (nome, descricao, preco, estoque, id_categoria, marca)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, descricao, preco, estoque, id_categoria, marca]
        );

        return {
            id_produto: resultado.insertId,
            nome,
            descricao,
            preco,
            estoque,
            id_categoria,
            marca
        };
    }

    async atualizar(id, instrumento) {
        await this.garantirColunaMarcaSeNecessario();

        const {
            nome,
            descricao,
            preco,
            estoque,
            id_categoria,
            marca
        } = instrumento;

        const [resultado] = await db.query(
            `UPDATE produtos
             SET nome = ?, descricao = ?, preco = ?, estoque = ?, id_categoria = ?, marca = ?
             WHERE id_produto = ?`,
            [nome, descricao, preco, estoque, id_categoria, marca, id]
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

    async comprarProduto(idProduto, dadosCompra) {
        await this.criarTabelaComprasSeNecessario();

        const conn = connection.promise();

        try {
            await conn.beginTransaction();

            const [produtos] = await conn.query(
                'SELECT * FROM produtos WHERE id_produto = ? FOR UPDATE',
                [idProduto]
            );

            const produto = produtos[0];

            if (!produto) {
                const erro = new Error('Instrumento nao encontrado');
                erro.status = 404;
                throw erro;
            }

            if (produto.estoque <= 0 || produto.estoque < dadosCompra.quantidade) {
                const erro = new Error('Produto sem estoque suficiente');
                erro.status = 409;
                throw erro;
            }

            const valorProdutos = Number(produto.preco) * dadosCompra.quantidade;
            const valorTotal = valorProdutos + dadosCompra.valor_frete;

            await conn.query(
                'UPDATE produtos SET estoque = estoque - ? WHERE id_produto = ?',
                [dadosCompra.quantidade, idProduto]
            );

            const [resultado] = await conn.query(
                `INSERT INTO compras
                    (id_produto, id_usuario, quantidade, valor_produtos, valor_frete, valor_total, cep, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    idProduto,
                    dadosCompra.id_usuario,
                    dadosCompra.quantidade,
                    valorProdutos,
                    dadosCompra.valor_frete,
                    valorTotal,
                    dadosCompra.cep,
                    'pendente'
                ]
            );

            await conn.commit();

            return this.buscarCompraPorId(resultado.insertId);
        } catch (error) {
            await conn.rollback();
            throw error;
        }
    }

    async aprovarCompra(idCompra) {
        return this.atualizarStatusCompra(idCompra, 'aprovado');
    }

    async listarCompras(paginacao = null) {
        await this.criarTabelaComprasSeNecessario();

        const limiteSql = this.montarLimiteSql(paginacao);

        const [compras] = await db.query(
            `SELECT
                co.*,
                u.nome AS nome_usuario,
                u.email AS email_usuario,
                p.nome AS nome_produto
             FROM compras co
             LEFT JOIN usuarios u ON u.id_usuario = co.id_usuario
             LEFT JOIN produtos p ON p.id_produto = co.id_produto
             ORDER BY co.id_compra DESC
             ${limiteSql.sql}`,
            limiteSql.parametros
        );

        return this.montarRespostaPaginada(
            compras,
            paginacao,
            'SELECT COUNT(*) AS total FROM compras'
        );
    }

    async reprovarCompra(idCompra) {
        await this.criarTabelaComprasSeNecessario();

        const conn = connection.promise();

        try {
            await conn.beginTransaction();

            const [compras] = await conn.query(
                'SELECT * FROM compras WHERE id_compra = ? FOR UPDATE',
                [idCompra]
            );

            const compra = compras[0];

            if (!compra) {
                const erro = new Error('Compra nao encontrada');
                erro.status = 404;
                throw erro;
            }

            if (compra.status !== 'pendente') {
                const erro = new Error('Apenas compras pendentes podem ser reprovadas');
                erro.status = 400;
                throw erro;
            }

            await conn.query(
                'UPDATE compras SET status = ? WHERE id_compra = ?',
                ['reprovado', idCompra]
            );

            await conn.query(
                'UPDATE produtos SET estoque = estoque + ? WHERE id_produto = ?',
                [compra.quantidade, compra.id_produto]
            );

            await conn.commit();

            return this.buscarCompraPorId(idCompra);
        } catch (error) {
            await conn.rollback();
            throw error;
        }
    }

    async atualizarStatusCompra(idCompra, status) {
        await this.criarTabelaComprasSeNecessario();

        const [resultado] = await db.query(
            `UPDATE compras
             SET status = ?
             WHERE id_compra = ? AND status = 'pendente'`,
            [status, idCompra]
        );

        if (resultado.affectedRows === 0) {
            const [compras] = await db.query(
                'SELECT * FROM compras WHERE id_compra = ?',
                [idCompra]
            );

            if (!compras[0]) {
                const erro = new Error('Compra nao encontrada');
                erro.status = 404;
                throw erro;
            }

            const erro = new Error('Apenas compras pendentes podem ser aprovadas');
            erro.status = 400;
            throw erro;
        }

        return this.buscarCompraPorId(idCompra);
    }

    async buscarCompraPorId(idCompra) {
        await this.criarTabelaComprasSeNecessario();

        const [compras] = await db.query(
            `SELECT
                co.*,
                u.nome AS nome_usuario,
                u.email AS email_usuario,
                p.nome AS nome_produto
             FROM compras co
             LEFT JOIN usuarios u ON u.id_usuario = co.id_usuario
             LEFT JOIN produtos p ON p.id_produto = co.id_produto
             WHERE co.id_compra = ?`,
            [idCompra]
        );

        return compras[0];
    }

    async criarTabelaComprasSeNecessario() {
        await db.query(
            `CREATE TABLE IF NOT EXISTS compras (
                id_compra INT AUTO_INCREMENT PRIMARY KEY,
                id_produto INT NOT NULL,
                id_usuario INT NULL,
                quantidade INT NOT NULL,
                valor_produtos DECIMAL(10, 2) NOT NULL,
                valor_frete DECIMAL(10, 2) NOT NULL DEFAULT 0,
                valor_total DECIMAL(10, 2) NOT NULL,
                cep VARCHAR(8) NULL,
                status ENUM('pendente', 'aprovado', 'reprovado') NOT NULL DEFAULT 'pendente',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );
    }

    async garantirColunaMarcaSeNecessario() {
        const [colunas] = await db.query(
            "SHOW COLUMNS FROM produtos LIKE 'marca'"
        );

        if (colunas.length === 0) {
            await db.query(
                'ALTER TABLE produtos ADD COLUMN marca VARCHAR(100) NULL'
            );
        }
    }

    montarLimiteSql(paginacao) {
        if (!paginacao) {
            return {
                sql: '',
                parametros: []
            };
        }

        return {
            sql: 'LIMIT ? OFFSET ?',
            parametros: [paginacao.limite, paginacao.offset]
        };
    }

    async montarRespostaPaginada(dados, paginacao, sqlTotal, parametrosTotal = []) {
        if (!paginacao) {
            return dados;
        }

        const [resultado] = await db.query(sqlTotal, parametrosTotal);
        const total = resultado[0].total;

        return {
            dados,
            paginacao: {
                pagina: paginacao.pagina,
                limite: paginacao.limite,
                total,
                total_paginas: Math.ceil(total / paginacao.limite)
            }
        };
    }
}

module.exports = new InstrumentosModels();
