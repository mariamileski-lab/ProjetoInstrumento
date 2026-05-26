const AppError = require('../errors/AppError');

function validar(schema) {
    return (req, res, next) => {
        try {
            schema(req);
            next();
        } catch (error) {
            next(error);
        }
    };
}

function exigirCampos(body, campos) {
    const faltando = campos.filter((campo) => body[campo] === undefined || body[campo] === null || body[campo] === '');

    if (faltando.length) {
        throw new AppError('Dados de entrada invalidos', 400, faltando.map((campo) => ({
            campo,
            mensagem: `${campo} e obrigatorio`
        })));
    }
}

function validarEmail(email, campo = 'email') {
    const emailTexto = String(email || '').trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTexto);

    if (!emailValido) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo,
            mensagem: 'Email invalido'
        }]);
    }
}

function validarNumeroInteiroPositivo(valor, campo) {
    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo,
            mensagem: `${campo} deve ser um numero inteiro positivo`
        }]);
    }

    return numero;
}

function validarNumeroNaoNegativo(valor, campo) {
    const numero = Number(valor);

    if (Number.isNaN(numero) || numero < 0) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo,
            mensagem: `${campo} deve ser um numero maior ou igual a zero`
        }]);
    }

    return numero;
}

function validarInteiroNaoNegativo(valor, campo) {
    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero < 0) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo,
            mensagem: `${campo} deve ser um numero inteiro maior ou igual a zero`
        }]);
    }

    return numero;
}

function usuario(req) {
    exigirCampos(req.body, ['nome', 'email', 'senha', 'tipo_usuario']);
    validarEmail(req.body.email);

    if (String(req.body.senha).length < 6) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo: 'senha',
            mensagem: 'senha deve ter pelo menos 6 caracteres'
        }]);
    }
}

function login(req) {
    exigirCampos(req.body, ['email', 'senha']);
    validarEmail(req.body.email);
}

function categoria(req) {
    exigirCampos(req.body, ['nome']);
}

function instrumento(req) {
    exigirCampos(req.body, ['nome', 'preco']);
    validarNumeroNaoNegativo(req.body.preco, 'preco');

    const estoque = req.body.estoque ?? req.body.quantidade;
    if (estoque === undefined || estoque === null || estoque === '') {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo: 'estoque',
            mensagem: 'estoque e obrigatorio'
        }]);
    }

    validarInteiroNaoNegativo(estoque, 'estoque');

    if (req.body.id_categoria !== undefined && req.body.id_categoria !== null && req.body.id_categoria !== '') {
        validarNumeroInteiroPositivo(req.body.id_categoria, 'id_categoria');
    }
}

function compra(req) {
    if (req.body.quantidade !== undefined) {
        validarNumeroInteiroPositivo(req.body.quantidade, 'quantidade');
    }

    if (req.body.cep !== undefined) {
        const cep = String(req.body.cep).replace(/\D/g, '');

        if (cep.length !== 8) {
            throw new AppError('Dados de entrada invalidos', 400, [{
                campo: 'cep',
                mensagem: 'CEP deve conter 8 digitos'
            }]);
        }
    }
}

function emailTeste(req) {
    exigirCampos(req.body, ['para']);
    validarEmail(req.body.para, 'para');
}

function idParam(req) {
    validarNumeroInteiroPositivo(req.params.id, 'id');
}

function cepParam(req) {
    const cep = String(req.params.cep || req.query.cep || '').replace(/\D/g, '');

    if (cep.length !== 8) {
        throw new AppError('Dados de entrada invalidos', 400, [{
            campo: 'cep',
            mensagem: 'CEP deve conter 8 digitos'
        }]);
    }
}

module.exports = {
    validar,
    usuario,
    login,
    categoria,
    instrumento,
    compra,
    emailTeste,
    idParam,
    cepParam
};
