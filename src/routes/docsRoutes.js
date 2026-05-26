const express = require('express');
const openapi = require('../docs/openapi');

const router = express.Router();

router.get('/openapi.json', (req, res) => {
    const spec = {
        ...openapi,
        servers: [
            {
                url: `${req.protocol}://${req.get('host')}`,
                description: 'Servidor atual'
            },
            ...openapi.servers
        ]
    };

    return res.json(spec);
});

router.get('/docs', (req, res) => {
    return res.type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentacao da API - Loja de Instrumentos</title>
    <style>
        body { margin: 0; background: #f6f3ee; color: #171412; font-family: Arial, Helvetica, sans-serif; }
        header { padding: 32px clamp(18px, 5vw, 72px); background: #24463a; color: #fffdf9; }
        main { padding: 32px clamp(18px, 5vw, 72px); }
        h1, h2, h3 { margin: 0; }
        .lead { max-width: 760px; line-height: 1.6; color: rgba(255,255,255,.82); }
        .toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
        a, button { min-height: 40px; border: 0; border-radius: 6px; padding: 0 14px; display: inline-flex; align-items: center; background: #bd4129; color: #fffdf9; font-weight: 800; text-decoration: none; cursor: pointer; }
        section { margin-bottom: 24px; border: 1px solid #ded6cd; border-radius: 8px; background: #fffdf9; overflow: hidden; }
        .tag { padding: 18px 20px; border-bottom: 1px solid #ded6cd; background: #fbf8f2; }
        .endpoint { display: grid; gap: 8px; padding: 16px 20px; border-bottom: 1px solid #eee4da; }
        .endpoint:last-child { border-bottom: 0; }
        code { width: fit-content; border-radius: 6px; padding: 5px 8px; background: #171412; color: #fffdf9; font-size: 13px; }
        .summary { color: #766d64; }
    </style>
</head>
<body>
    <header>
        <h1>Loja de Instrumentos API</h1>
        <p class="lead">Documentacao OpenAPI das rotas de autenticacao, usuarios, categorias, produtos, compras, frete e email.</p>
        <div class="toolbar">
            <a href="/openapi.json" target="_blank">Abrir OpenAPI JSON</a>
            <button type="button" id="copyUrl">Copiar URL para Postman/Insomnia</button>
        </div>
    </header>
    <main id="content"></main>
    <script>
        const methods = { get: 'GET', post: 'POST', put: 'PUT', delete: 'DELETE' };
        fetch('/openapi.json')
            .then((response) => response.json())
            .then((spec) => {
                const tags = new Map(spec.tags.map((tag) => [tag.name, []]));
                Object.entries(spec.paths).forEach(([path, actions]) => {
                    Object.entries(actions).forEach(([method, details]) => {
                        const tag = details.tags?.[0] || 'Outros';
                        if (!tags.has(tag)) tags.set(tag, []);
                        tags.get(tag).push({ method, path, details });
                    });
                });

                document.getElementById('content').innerHTML = Array.from(tags.entries()).map(([tag, endpoints]) => \`
                    <section>
                        <div class="tag"><h2>\${tag}</h2></div>
                        \${endpoints.map((endpoint) => \`
                            <div class="endpoint">
                                <code>\${methods[endpoint.method]} \${endpoint.path}</code>
                                <strong>\${endpoint.details.summary || ''}</strong>
                                <span class="summary">\${endpoint.details.security ? 'Requer Bearer Token JWT.' : 'Rota publica.'}</span>
                            </div>
                        \`).join('')}
                    </section>
                \`).join('');
            });

        document.getElementById('copyUrl').addEventListener('click', async () => {
            await navigator.clipboard.writeText(location.origin + '/openapi.json');
        });
    </script>
</body>
</html>`);
});

module.exports = router;
