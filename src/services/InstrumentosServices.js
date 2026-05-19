const instrumentosModels = require('../models/InstrumentosModels');
const emailServices = require('./EmailServices');

class InstrumentosServices {
    async listar(query = {}) {
        const paginacao = this.validarPaginacao(query);

        return instrumentosModels.listar(paginacao);
    }

    async buscarProdutos(filtros) {
        const filtrosValidados = this.validarFiltros(filtros);

        return instrumentosModels.buscarProdutos(filtrosValidados);
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

    async comprarProduto(id, dados = {}, usuario) {
        this.validarId(id);

        const quantidade = Number(dados.quantidade || 1);

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            const erro = new Error('Quantidade invalida');
            erro.status = 400;
            throw erro;
        }

        const frete = dados.cep ? await this.calcularFrete(dados.cep) : {
            cep: null,
            valor: 0,
            prazo_dias: null
        };

        const compra = await instrumentosModels.comprarProduto(Number(id), {
            id_usuario: usuario?.id || null,
            quantidade,
            cep: frete.cep,
            valor_frete: frete.valor
        });

        await emailServices.enviarStatusCompra(compra);

        return compra;
    }

    async calcularFrete(cep) {
        const cepLimpo = String(cep || '').replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            const erro = new Error('CEP invalido');
            erro.status = 400;
            throw erro;
        }

        let endereco;

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

            if (!resposta.ok) {
                const erro = new Error('Erro ao consultar ViaCEP');
                erro.status = 502;
                throw erro;
            }

            endereco = await resposta.json();
        } catch (error) {
            if (error.status) {
                throw error;
            }

            const erro = new Error('Nao foi possivel consultar o ViaCEP');
            erro.status = 502;
            throw erro;
        }

        if (endereco.erro) {
            const erro = new Error('CEP nao encontrado');
            erro.status = 404;
            throw erro;
        }

        let valor = 35;
        let prazoDias = 8;

        if (endereco.uf === 'SP') {
            valor = 15;
            prazoDias = 3;
        } else if (['RJ', 'MG', 'ES'].includes(endereco.uf)) {
            valor = 20;
            prazoDias = 5;
        } else if (['PR', 'SC', 'RS'].includes(endereco.uf)) {
            valor = 25;
            prazoDias = 6;
        } else if (['DF', 'GO', 'MT', 'MS'].includes(endereco.uf)) {
            valor = 30;
            prazoDias = 7;
        }


        return {
            cep: cepLimpo,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            uf: endereco.uf,
            valor,
            prazo_dias: prazoDias
        };
    }

    async aprovarCompra(id) {
        this.validarId(id);

        const compra = await instrumentosModels.aprovarCompra(Number(id));

        await emailServices.enviarStatusCompra(compra);

        return compra;
    }

    async listarCompras(query = {}) {
        const paginacao = this.validarPaginacao(query);

        return instrumentosModels.listarCompras(paginacao);
    }

    async reprovarCompra(id) {
        this.validarId(id);

        const compra = await instrumentosModels.reprovarCompra(Number(id));

        await emailServices.enviarStatusCompra(compra);

        return compra;
    }

    async enviarEmailTeste(dados) {
        if (!dados.para) {
            const erro = new Error('Email do destinatario e obrigatorio');
            erro.status = 400;
            throw erro;
        }

        return emailServices.enviarEmail({
            para: dados.para,
            assunto: dados.assunto || 'Teste de email - Loja de Instrumentos',
            texto: dados.texto || 'Email de teste enviado pela API da Loja de Instrumentos.'
        });
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
            id_categoria: dados.id_categoria ? Number(dados.id_categoria) : null,
            marca: dados.marca ? String(dados.marca).trim() : null
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

    validarFiltros(filtros) {
        const precoMin = filtros.preco_min ?? filtros.precoMin ?? filtros.preco;
        const precoMax = filtros.preco_max ?? filtros.precoMax ?? filtros.preco;

        const filtrosValidados = {
            nome: filtros.nome ? String(filtros.nome).trim() : null,
            categoria: filtros.categoria ? String(filtros.categoria).trim() : null,
            marca: filtros.marca ? String(filtros.marca).trim() : null,
            precoMin: precoMin !== undefined ? Number(precoMin) : null,
            precoMax: precoMax !== undefined ? Number(precoMax) : null,
            paginacao: this.validarPaginacao(filtros)
        };

        if (filtrosValidados.precoMin !== null && (Number.isNaN(filtrosValidados.precoMin) || filtrosValidados.precoMin < 0)) {
            const erro = new Error('Preco minimo invalido');
            erro.status = 400;
            throw erro;
        }

        if (filtrosValidados.precoMax !== null && (Number.isNaN(filtrosValidados.precoMax) || filtrosValidados.precoMax < 0)) {
            const erro = new Error('Preco maximo invalido');
            erro.status = 400;
            throw erro;
        }

        if (
            filtrosValidados.precoMin !== null &&
            filtrosValidados.precoMax !== null &&
            filtrosValidados.precoMin > filtrosValidados.precoMax
        ) {
            const erro = new Error('Preco minimo nao pode ser maior que o preco maximo');
            erro.status = 400;
            throw erro;
        }

        return filtrosValidados;
    }

    validarPaginacao(query) {
        if (query.pagina === undefined && query.limite === undefined) {
            return null;
        }

        const pagina = Number(query.pagina || 1);
        const limite = Number(query.limite || 10);

        if (!Number.isInteger(pagina) || pagina <= 0) {
            const erro = new Error('Pagina invalida');
            erro.status = 400;
            throw erro;
        }

        if (!Number.isInteger(limite) || limite <= 0 || limite > 100) {
            const erro = new Error('Limite invalido');
            erro.status = 400;
            throw erro;
        }

        return {
            pagina,
            limite,
            offset: (pagina - 1) * limite
        };
    }
}

module.exports = new InstrumentosServices();
