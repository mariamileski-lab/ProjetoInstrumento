const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const connection = require('../config/database');
const instrumentosControllers = require('../controllers/InstrumentosControllers');
const instrumentosMidd = require('../middlewares/instrumentosMidd');

router.post('/usuarios', async (req, res) => {
    const { nome, email, senha, tipo_usuario } = req.body;

    if (!nome || !email || !senha || !tipo_usuario) {
        return res.status(400).json({
            message: 'Nome, email, senha e tipo_usuario sao obrigatorios'
        });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(String(senha), 10);

        const sql = `
            INSERT INTO usuarios (nome, email, senha, tipo_usuario)
            VALUES (?, ?, ?, ?)
        `;

        connection.query(sql, [nome, email, senhaCriptografada, tipo_usuario], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        message: 'Email ja cadastrado'
                    });
                }

                return res.status(500).json({
                    message: 'Erro ao cadastrar usuario'
                });
            }

            return res.status(201).json({
                id_usuario: result.insertId,
                nome,
                email,
                tipo_usuario
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro interno do servidor'
        });
    }
});

router.get('/usuarios', instrumentosMidd, (req, res) => {
    const sql = 'SELECT id_usuario, nome, email, tipo_usuario FROM usuarios ORDER BY id_usuario DESC';

    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao listar usuarios'
            });
        }

        return res.status(200).json(results);
    });
});

router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            message: 'Email e senha sao obrigatorios'
        });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    connection.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao buscar usuario'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Usuario nao encontrado'
            });
        }

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(String(senha), usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({
                message: 'Senha invalida'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                tipo: usuario.tipo_usuario
            },
            'segredo',
            {
                expiresIn: '1d'
            }
        );

        return res.json({ token });
    });
});

router.get('/categorias', (req, res) => {
    const sql = 'SELECT * FROM categorias ORDER BY id_categoria DESC';

    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao listar categorias'
            });
        }

        return res.status(200).json(results);
    });
});

router.post('/categorias', instrumentosMidd, (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({
            message: 'Nome da categoria e obrigatorio'
        });
    }

    const sql = 'INSERT INTO categorias (nome) VALUES (?)';

    connection.query(sql, [nome], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao cadastrar categoria'
            });
        }

        return res.status(201).json({
            id_categoria: result.insertId,
            nome
        });
    });
});

router.put('/categorias/:id', instrumentosMidd, (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({
            message: 'Nome da categoria e obrigatorio'
        });
    }

    const sql = 'UPDATE categorias SET nome = ? WHERE id_categoria = ?';

    connection.query(sql, [nome, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao atualizar categoria'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Categoria nao encontrada'
            });
        }

        return res.status(200).json({
            id_categoria: Number(req.params.id),
            nome
        });
    });
});

router.delete('/categorias/:id', instrumentosMidd, (req, res) => {
    const sql = 'DELETE FROM categorias WHERE id_categoria = ?';

    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao deletar categoria'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Categoria nao encontrada'
            });
        }

        return res.status(200).json({
            message: 'Categoria deletada com sucesso'
        });
    });
});

router.get('/instrumentos', instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/instrumentos/buscar', instrumentosControllers.buscarProdutos.bind(instrumentosControllers));
router.get('/instrumentos/frete/:cep', instrumentosControllers.calcularFrete.bind(instrumentosControllers));
router.post('/instrumentos/:id/comprar', instrumentosMidd, instrumentosControllers.comprarProduto.bind(instrumentosControllers));
router.get('/instrumentos/:id', instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/instrumentos', instrumentosMidd, instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/instrumentos/:id', instrumentosMidd, instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/instrumentos/:id', instrumentosMidd, instrumentosControllers.deletar.bind(instrumentosControllers));

router.get('/produtos', instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/produtos/buscar', instrumentosControllers.buscarProdutos.bind(instrumentosControllers));
router.get('/produtos/frete/:cep', instrumentosControllers.calcularFrete.bind(instrumentosControllers));
router.post('/produtos/:id/comprar', instrumentosMidd, instrumentosControllers.comprarProduto.bind(instrumentosControllers));
router.get('/produtos/:id', instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/produtos', instrumentosMidd, instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/produtos/:id', instrumentosMidd, instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/produtos/:id', instrumentosMidd, instrumentosControllers.deletar.bind(instrumentosControllers));

router.get('/compras', instrumentosMidd, instrumentosControllers.listarCompras.bind(instrumentosControllers));
router.put('/compras/:id/aprovar', instrumentosMidd, instrumentosControllers.aprovarCompra.bind(instrumentosControllers));
router.put('/compras/:id/reprovar', instrumentosMidd, instrumentosControllers.reprovarCompra.bind(instrumentosControllers));
router.post('/emails/teste', instrumentosMidd, instrumentosControllers.enviarEmailTeste.bind(instrumentosControllers));

module.exports = router;
