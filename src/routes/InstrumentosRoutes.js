const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const connection = require('../config/database');
const { jwtSecret } = require('../config/auth');
const instrumentosControllers = require('../controllers/InstrumentosControllers');
const instrumentosMidd = require('../middlewares/instrumentosMidd');
const { requireAdmin } = instrumentosMidd;
const AppError = require('../errors/AppError');
const {
    validar,
    usuario,
    login,
    categoria,
    instrumento,
    compra,
    emailTeste,
    idParam,
    cepParam
} = require('../middlewares/validations');

router.post('/usuarios', instrumentosMidd, requireAdmin, validar(usuario), async (req, res, next) => {
    const { nome, email, senha, tipo_usuario } = req.body;

    try {
        const senhaCriptografada = await bcrypt.hash(String(senha), 10);

        const sql = `
            INSERT INTO usuarios (nome, email, senha, tipo_usuario)
            VALUES (?, ?, ?, ?)
        `;

        connection.query(sql, [nome, email, senhaCriptografada, tipo_usuario], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return next(new AppError('Email ja cadastrado', 409));
                }

                return next(new AppError('Erro ao cadastrar usuario', 500));
            }

            return res.status(201).json({
                id_usuario: result.insertId,
                nome,
                email,
                tipo_usuario
            });
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/usuarios', instrumentosMidd, requireAdmin, (req, res, next) => {
    const sql = 'SELECT id_usuario, nome, email, tipo_usuario FROM usuarios ORDER BY id_usuario DESC';

    connection.query(sql, (err, results) => {
        if (err) {
            return next(new AppError('Erro ao listar usuarios', 500));
        }

        return res.status(200).json(results);
    });
});

router.post('/login', validar(login), (req, res, next) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    connection.query(sql, [email], async (err, results) => {
        if (err) {
            return next(new AppError('Erro ao buscar usuario', 500));
        }

        if (results.length === 0) {
            return next(new AppError('Usuario nao encontrado', 401));
        }

        const usuarioEncontrado = results[0];
        const senhaValida = await bcrypt.compare(String(senha), usuarioEncontrado.senha);

        if (!senhaValida) {
            return next(new AppError('Senha invalida', 401));
        }

        const token = jwt.sign(
            {
                id: usuarioEncontrado.id_usuario,
                tipo: usuarioEncontrado.tipo_usuario
            },
            jwtSecret,
            {
                expiresIn: '1d'
            }
        );

        return res.json({ token });
    });
});

router.get('/categorias', (req, res, next) => {
    const sql = 'SELECT * FROM categorias ORDER BY id_categoria DESC';

    connection.query(sql, (err, results) => {
        if (err) {
            return next(new AppError('Erro ao listar categorias', 500));
        }

        return res.status(200).json(results);
    });
});

router.post('/categorias', instrumentosMidd, requireAdmin, validar(categoria), (req, res, next) => {
    const { nome } = req.body;
    const sql = 'INSERT INTO categorias (nome) VALUES (?)';

    connection.query(sql, [nome], (err, result) => {
        if (err) {
            return next(new AppError('Erro ao cadastrar categoria', 500));
        }

        return res.status(201).json({
            id_categoria: result.insertId,
            nome
        });
    });
});

router.put('/categorias/:id', instrumentosMidd, requireAdmin, validar(idParam), validar(categoria), (req, res, next) => {
    const { nome } = req.body;
    const sql = 'UPDATE categorias SET nome = ? WHERE id_categoria = ?';

    connection.query(sql, [nome, req.params.id], (err, result) => {
        if (err) {
            return next(new AppError('Erro ao atualizar categoria', 500));
        }

        if (result.affectedRows === 0) {
            return next(new AppError('Categoria nao encontrada', 404));
        }

        return res.status(200).json({
            id_categoria: Number(req.params.id),
            nome
        });
    });
});

router.delete('/categorias/:id', instrumentosMidd, requireAdmin, validar(idParam), (req, res, next) => {
    const sql = 'DELETE FROM categorias WHERE id_categoria = ?';

    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return next(new AppError('Erro ao deletar categoria', 500));
        }

        if (result.affectedRows === 0) {
            return next(new AppError('Categoria nao encontrada', 404));
        }

        return res.status(200).json({
            message: 'Categoria deletada com sucesso'
        });
    });
});

router.get('/instrumentos', instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/instrumentos/buscar', instrumentosControllers.buscarProdutos.bind(instrumentosControllers));
router.get('/instrumentos/frete/:cep', validar(cepParam), instrumentosControllers.calcularFrete.bind(instrumentosControllers));
router.post('/instrumentos/:id/comprar', instrumentosMidd, validar(idParam), validar(compra), instrumentosControllers.comprarProduto.bind(instrumentosControllers));
router.get('/instrumentos/:id', validar(idParam), instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/instrumentos', instrumentosMidd, requireAdmin, validar(instrumento), instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/instrumentos/:id', instrumentosMidd, requireAdmin, validar(idParam), validar(instrumento), instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/instrumentos/:id', instrumentosMidd, requireAdmin, validar(idParam), instrumentosControllers.deletar.bind(instrumentosControllers));

router.get('/produtos', instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/produtos/buscar', instrumentosControllers.buscarProdutos.bind(instrumentosControllers));
router.get('/produtos/frete/:cep', validar(cepParam), instrumentosControllers.calcularFrete.bind(instrumentosControllers));
router.post('/produtos/:id/comprar', instrumentosMidd, validar(idParam), validar(compra), instrumentosControllers.comprarProduto.bind(instrumentosControllers));
router.get('/produtos/:id', validar(idParam), instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/produtos', instrumentosMidd, requireAdmin, validar(instrumento), instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/produtos/:id', instrumentosMidd, requireAdmin, validar(idParam), validar(instrumento), instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/produtos/:id', instrumentosMidd, requireAdmin, validar(idParam), instrumentosControllers.deletar.bind(instrumentosControllers));

router.get('/compras', instrumentosMidd, requireAdmin, instrumentosControllers.listarCompras.bind(instrumentosControllers));
router.put('/compras/:id/aprovar', instrumentosMidd, requireAdmin, validar(idParam), instrumentosControllers.aprovarCompra.bind(instrumentosControllers));
router.put('/compras/:id/reprovar', instrumentosMidd, requireAdmin, validar(idParam), instrumentosControllers.reprovarCompra.bind(instrumentosControllers));
router.post('/emails/teste', instrumentosMidd, requireAdmin, validar(emailTeste), instrumentosControllers.enviarEmailTeste.bind(instrumentosControllers));

module.exports = router;
