process.env.NODE_ENV = 'test';

const test = require('node:test');
const { after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');

const app = require('../server');
const connection = require('../src/config/database');
const { jwtSecret } = require('../src/config/auth');

after(() => {
    connection.destroy();
});

function tokenValido() {
    return jwt.sign({ id: 1, tipo: 'admin' }, jwtSecret, { expiresIn: '1h' });
}

function request({ method = 'GET', path, body, token }) {
    const server = app.listen(0);
    const { port } = server.address();
    const payload = body ? JSON.stringify(body) : null;

    const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
            Accept: 'application/json'
        }
    };

    if (payload) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                await new Promise((closeResolve) => server.close(closeResolve));
                resolve({
                    status: res.statusCode,
                    body: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', async (error) => {
            await new Promise((closeResolve) => server.close(closeResolve));
            reject(error);
        });

        if (payload) {
            req.write(payload);
        }

        req.end();
    });
}

test('POST /usuarios valida payload obrigatorio antes de acessar o banco', async () => {
    const response = await request({
        method: 'POST',
        path: '/usuarios',
        body: {
            nome: 'Maria'
        }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.message, 'Dados de entrada invalidos');
    assert.equal(response.body.error.status, 400);
    assert.ok(response.body.error.details.some((detail) => detail.campo === 'email'));
});

test('POST /login rejeita email em formato invalido', async () => {
    const response = await request({
        method: 'POST',
        path: '/login',
        body: {
            email: 'email-invalido',
            senha: '123456'
        }
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body.error.details, [{
        campo: 'email',
        mensagem: 'Email invalido'
    }]);
});

test('rotas protegidas retornam erro padronizado sem token', async () => {
    const response = await request({
        path: '/usuarios'
    });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
        error: {
            message: 'Token nao fornecido',
            status: 401
        }
    });
});

test('POST /produtos valida payload com token valido', async () => {
    const response = await request({
        method: 'POST',
        path: '/produtos',
        token: tokenValido(),
        body: {
            nome: 'Violao',
            preco: -10,
            estoque: 2
        }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.message, 'Dados de entrada invalidos');
    assert.equal(response.body.error.details[0].campo, 'preco');
});

test('parametros id invalidos retornam 400 padronizado', async () => {
    const response = await request({
        path: '/produtos/abc'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.status, 400);
    assert.equal(response.body.error.details[0].campo, 'id');
});

test('rotas inexistentes retornam 404 padronizado', async () => {
    const response = await request({
        path: '/rota-inexistente'
    });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        error: {
            message: 'Rota nao encontrada',
            status: 404
        }
    });
});
