const instrumentosServices = require('../services/InstrumentosServices');

class InstrumentosControllers {
    async listar(req, res, next) {
        try {
            const instrumentos = await instrumentosServices.listar(req.query);

            return res.status(200).json(instrumentos);
        } catch (error) {
            return next(error);
        }
    }

    async buscarProdutos(req, res, next) {
        try {
            const produtos = await instrumentosServices.buscarProdutos(req.query);

            return res.status(200).json(produtos);
        } catch (error) {
            return next(error);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const instrumento = await instrumentosServices.buscarPorId(req.params.id);

            return res.status(200).json(instrumento);
        } catch (error) {
            return next(error);
        }
    }

    async criar(req, res, next) {
        try {
            const instrumento = await instrumentosServices.criar(req.body);

            return res.status(201).json(instrumento);
        } catch (error) {
            return next(error);
        }
    }

    async atualizar(req, res, next) {
        try {
            const instrumento = await instrumentosServices.atualizar(req.params.id, req.body);

            return res.status(200).json(instrumento);
        } catch (error) {
            return next(error);
        }
    }

    async deletar(req, res, next) {
        try {
            await instrumentosServices.deletar(req.params.id);

            return res.status(200).json({
                message: 'Instrumento deletado com sucesso'
            });
        } catch (error) {
            return next(error);
        }
    }

    async comprarProduto(req, res, next) {
        try {
            const compra = await instrumentosServices.comprarProduto(req.params.id, req.body, req.user);

            return res.status(201).json(compra);
        } catch (error) {
            return next(error);
        }
    }

    async calcularFrete(req, res, next) {
        try {
            const frete = await instrumentosServices.calcularFrete(req.params.cep || req.query.cep);

            return res.status(200).json(frete);
        } catch (error) {
            return next(error);
        }
    }

    async aprovarCompra(req, res, next) {
        try {
            const compra = await instrumentosServices.aprovarCompra(req.params.id);

            return res.status(200).json(compra);
        } catch (error) {
            return next(error);
        }
    }

    async listarCompras(req, res, next) {
        try {
            const compras = await instrumentosServices.listarCompras(req.query);

            return res.status(200).json(compras);
        } catch (error) {
            return next(error);
        }
    }

    async reprovarCompra(req, res, next) {
        try {
            const compra = await instrumentosServices.reprovarCompra(req.params.id);

            return res.status(200).json(compra);
        } catch (error) {
            return next(error);
        }
    }

    async enviarEmailTeste(req, res, next) {
        try {
            const resultado = await instrumentosServices.enviarEmailTeste(req.body);

            return res.status(200).json(resultado);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new InstrumentosControllers();
