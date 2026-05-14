const instrumentosServices = require('../services/InstrumentosServices');

class InstrumentosControllers {
    async listar(req, res) {
        try {
            const instrumentos = await instrumentosServices.listar();

            return res.status(200).json(instrumentos);
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

    responderErro(res, error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Erro interno do servidor'
        });
    }
}

module.exports = new InstrumentosControllers();
