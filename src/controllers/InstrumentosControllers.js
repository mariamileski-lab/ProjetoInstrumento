const instrumentosServices = require('../services/InstrumentosServices');

class InstrumentosControllers {
    async listar(req, res) {
        try {
            const instrumentos = await instrumentosServices.listar(req.query);

            return res.status(200).json(instrumentos);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async buscarProdutos(req, res) {
        try {
            const produtos = await instrumentosServices.buscarProdutos(req.query);

            return res.status(200).json(produtos);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async buscarPorId(req, res) {
        try {
            const instrumento = await instrumentosServices.buscarPorId(req.params.id);

            return res.status(200).json(instrumento);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async criar(req, res) {
        try {
            const instrumento = await instrumentosServices.criar(req.body);

            return res.status(201).json(instrumento);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async atualizar(req, res) {
        try {
            const instrumento = await instrumentosServices.atualizar(req.params.id, req.body);

            return res.status(200).json(instrumento);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async deletar(req, res) {
        try {
            await instrumentosServices.deletar(req.params.id);

            return res.status(200).json({
                message: 'Instrumento deletado com sucesso'
            });
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async comprarProduto(req, res) {
        try {
            const compra = await instrumentosServices.comprarProduto(req.params.id, req.body, req.user);

            return res.status(201).json(compra);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async calcularFrete(req, res) {
        try {
            const frete = await instrumentosServices.calcularFrete(req.params.cep || req.query.cep);

            return res.status(200).json(frete);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async aprovarCompra(req, res) {
        try {
            const compra = await instrumentosServices.aprovarCompra(req.params.id);

            return res.status(200).json(compra);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async listarCompras(req, res) {
        try {
            const compras = await instrumentosServices.listarCompras(req.query);

            return res.status(200).json(compras);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async reprovarCompra(req, res) {
        try {
            const compra = await instrumentosServices.reprovarCompra(req.params.id);

            return res.status(200).json(compra);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    async enviarEmailTeste(req, res) {
        try {
            const resultado = await instrumentosServices.enviarEmailTeste(req.body);

            return res.status(200).json(resultado);
        } catch (error) {
            return this.responderErro(res, error);
        }
    }

    responderErro(res, error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Erro interno do servidor'
        });
    }
}

module.exports = new InstrumentosControllers();
