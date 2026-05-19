const express = require('express');
const router = express.Router();

const auth = require('../middlewares/instrumentosMidd');
const instrumentosControllers = require('../controllers/InstrumentosControllers');

router.get('/produtos', auth, instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/produtos/buscar', auth, instrumentosControllers.buscarProdutos.bind(instrumentosControllers));
router.get('/produtos/frete/:cep', auth, instrumentosControllers.calcularFrete.bind(instrumentosControllers));
router.post('/produtos/:id/comprar', auth, instrumentosControllers.comprarProduto.bind(instrumentosControllers));
router.get('/produtos/:id', auth, instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/produtos', auth, instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/produtos/:id', auth, instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/produtos/:id', auth, instrumentosControllers.deletar.bind(instrumentosControllers));

router.get('/compras', auth, instrumentosControllers.listarCompras.bind(instrumentosControllers));
router.put('/compras/:id/aprovar', auth, instrumentosControllers.aprovarCompra.bind(instrumentosControllers));
router.put('/compras/:id/reprovar', auth, instrumentosControllers.reprovarCompra.bind(instrumentosControllers));
router.post('/emails/teste', auth, instrumentosControllers.enviarEmailTeste.bind(instrumentosControllers));

module.exports = router;
