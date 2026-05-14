const instrumentosModels = require('../models/InstrumentosModels');

class InstrumentosServices {
    async listar() {
        return instrumentosModels.listar();
    }

    async buscarPorId(id) {
        this.validarId(id);

        const instrumento = await instrumentosModels.buscarPorId(id);

        if (!instrumento) {
            const erro = new Error('Instrumento nao encontrado');
            erro.status = 404;
            throw erro;
        }

        return instrumento;
    }

    async criar(dados) {
        const instrumento = this.validarDados(dados);

        return instrumentosModels.criar(instrumento);
    }

    async atualizar(id, dados) {
        this.validarId(id);

        await this.buscarPorId(id);

        const instrumento = this.validarDados(dados);
        const atualizado = await instrumentosModels.atualizar(id, instrumento);

        if (!atualizado) {
            const erro = new Error('Instrumento nao encontrado');
            erro.status = 404;
            throw erro;
        }

        return instrumentosModels.buscarPorId(id);
    }

    async deletar(id) {
        this.validarId(id);

        const deletado = await instrumentosModels.deletar(id);

        if (!deletado) {
            const erro = new Error('Instrumento nao encontrado');
            erro.status = 404;
            throw erro;
        }

        return true;
    }

    validarId(id) {
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            const erro = new Error('Id invalido');
            erro.status = 400;
            throw erro;
        }
    }

    validarDados(dados) {
        const instrumento = {
            nome: dados.nome,
            descricao: dados.descricao || null,
            preco: Number(dados.preco),
            estoque: Number(dados.estoque ?? dados.quantidade),
            id_categoria: dados.id_categoria ? Number(dados.id_categoria) : null
        };

        if (!instrumento.nome) {
            const erro = new Error('Nome e obrigatorio');
            erro.status = 400;
            throw erro;
        }

        if (Number.isNaN(instrumento.preco) || instrumento.preco < 0) {
            const erro = new Error('Preco invalido');
            erro.status = 400;
            throw erro;
        }

        if (!Number.isInteger(instrumento.estoque) || instrumento.estoque < 0) {
            const erro = new Error('Estoque invalido');
            erro.status = 400;
            throw erro;
        }

        if (instrumento.id_categoria !== null && (!Number.isInteger(instrumento.id_categoria) || instrumento.id_categoria <= 0)) {
            const erro = new Error('Categoria invalida');
            erro.status = 400;
            throw erro;
        }

        return instrumento;
    }
}

module.exports = new InstrumentosServices();
