const express = require('express');
const router = express.Router();

const auth = require('../middlewares/instrumentosMidd');
const instrumentosControllers = require('../controllers/InstrumentosControllers');

router.get('/produtos', auth, instrumentosControllers.listar.bind(instrumentosControllers));
router.get('/produtos/:id', auth, instrumentosControllers.buscarPorId.bind(instrumentosControllers));
router.post('/produtos', auth, instrumentosControllers.criar.bind(instrumentosControllers));
router.put('/produtos/:id', auth, instrumentosControllers.atualizar.bind(instrumentosControllers));
router.delete('/produtos/:id', auth, instrumentosControllers.deletar.bind(instrumentosControllers));

module.exports = router;
