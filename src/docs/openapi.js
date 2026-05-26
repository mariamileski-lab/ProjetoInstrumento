const openapi = {
    openapi: '3.0.3',
    info: {
        title: 'Loja de Instrumentos API',
        version: '1.0.0',
        description: 'API para catalogo, usuarios, compras, frete e administracao da Loja de Instrumentos.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Ambiente local'
        }
    ],
    tags: [
        { name: 'Autenticacao' },
        { name: 'Usuarios' },
        { name: 'Categorias' },
        { name: 'Produtos' },
        { name: 'Compras' },
        { name: 'Email' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'object',
                        properties: {
                            message: { type: 'string', example: 'Dados de entrada invalidos' },
                            status: { type: 'integer', example: 400 },
                            details: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        campo: { type: 'string', example: 'email' },
                                        mensagem: { type: 'string', example: 'Email invalido' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            UsuarioInput: {
                type: 'object',
                required: ['nome', 'email', 'senha', 'tipo_usuario'],
                properties: {
                    nome: { type: 'string', example: 'Maria Admin' },
                    email: { type: 'string', format: 'email', example: 'admin@loja.com' },
                    senha: { type: 'string', minLength: 6, example: '123456' },
                    tipo_usuario: { type: 'string', enum: ['cliente', 'admin', 'funcionario'], example: 'admin' }
                }
            },
            Usuario: {
                type: 'object',
                properties: {
                    id_usuario: { type: 'integer', example: 1 },
                    nome: { type: 'string', example: 'Maria Admin' },
                    email: { type: 'string', example: 'admin@loja.com' },
                    tipo_usuario: { type: 'string', example: 'admin' }
                }
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@loja.com' },
                    senha: { type: 'string', example: '123456' }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                }
            },
            CategoriaInput: {
                type: 'object',
                required: ['nome'],
                properties: {
                    nome: { type: 'string', example: 'Cordas' }
                }
            },
            Categoria: {
                type: 'object',
                properties: {
                    id_categoria: { type: 'integer', example: 1 },
                    nome: { type: 'string', example: 'Cordas' }
                }
            },
            ProdutoInput: {
                type: 'object',
                required: ['nome', 'preco', 'estoque'],
                properties: {
                    nome: { type: 'string', example: 'Violao Acustico' },
                    descricao: { type: 'string', nullable: true, example: 'Violao para estudo e palco.' },
                    preco: { type: 'number', minimum: 0, example: 799.9 },
                    estoque: { type: 'integer', minimum: 0, example: 8 },
                    id_categoria: { type: 'integer', nullable: true, example: 1 },
                    marca: { type: 'string', nullable: true, example: 'Giannini' }
                }
            },
            Produto: {
                allOf: [
                    { $ref: '#/components/schemas/ProdutoInput' },
                    {
                        type: 'object',
                        properties: {
                            id_produto: { type: 'integer', example: 1 },
                            categoria: { type: 'string', example: 'Cordas' }
                        }
                    }
                ]
            },
            CompraInput: {
                type: 'object',
                properties: {
                    quantidade: { type: 'integer', minimum: 1, example: 1 },
                    cep: { type: 'string', example: '01001000' }
                }
            },
            Compra: {
                type: 'object',
                properties: {
                    id_compra: { type: 'integer', example: 1 },
                    id_produto: { type: 'integer', example: 1 },
                    id_usuario: { type: 'integer', nullable: true, example: 1 },
                    quantidade: { type: 'integer', example: 1 },
                    valor_produtos: { type: 'number', example: 799.9 },
                    valor_frete: { type: 'number', example: 15 },
                    valor_total: { type: 'number', example: 814.9 },
                    cep: { type: 'string', nullable: true, example: '01001000' },
                    status: { type: 'string', enum: ['pendente', 'aprovado', 'reprovado'], example: 'pendente' },
                    nome_usuario: { type: 'string', nullable: true, example: 'Maria Admin' },
                    email_usuario: { type: 'string', nullable: true, example: 'admin@loja.com' },
                    nome_produto: { type: 'string', nullable: true, example: 'Violao Acustico' }
                }
            },
            Frete: {
                type: 'object',
                properties: {
                    cep: { type: 'string', example: '01001000' },
                    logradouro: { type: 'string', example: 'Praca da Se' },
                    bairro: { type: 'string', example: 'Se' },
                    cidade: { type: 'string', example: 'Sao Paulo' },
                    uf: { type: 'string', example: 'SP' },
                    valor: { type: 'number', example: 15 },
                    prazo_dias: { type: 'integer', example: 3 }
                }
            },
            EmailTesteInput: {
                type: 'object',
                required: ['para'],
                properties: {
                    para: { type: 'string', format: 'email', example: 'cliente@email.com' },
                    assunto: { type: 'string', example: 'Teste de email' },
                    texto: { type: 'string', example: 'Mensagem de teste enviada pela API.' }
                }
            }
        }
    },
    paths: {
        '/login': {
            post: {
                tags: ['Autenticacao'],
                summary: 'Autentica usuario e retorna JWT',
                requestBody: jsonBody('LoginInput'),
                responses: {
                    200: jsonResponse('LoginResponse', 'Login realizado'),
                    400: errorResponse(),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/usuarios': {
            post: {
                tags: ['Usuarios'],
                summary: 'Cadastra usuario',
                requestBody: jsonBody('UsuarioInput'),
                responses: {
                    201: jsonResponse('Usuario', 'Usuario criado'),
                    400: errorResponse(),
                    409: errorResponse(),
                    500: errorResponse()
                }
            },
            get: {
                tags: ['Usuarios'],
                summary: 'Lista usuarios cadastrados',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: arrayResponse('Usuario', 'Lista de usuarios'),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/categorias': {
            get: {
                tags: ['Categorias'],
                summary: 'Lista categorias',
                responses: {
                    200: arrayResponse('Categoria', 'Lista de categorias'),
                    500: errorResponse()
                }
            },
            post: {
                tags: ['Categorias'],
                summary: 'Cria categoria',
                security: [{ bearerAuth: [] }],
                requestBody: jsonBody('CategoriaInput'),
                responses: {
                    201: jsonResponse('Categoria', 'Categoria criada'),
                    400: errorResponse(),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/categorias/{id}': {
            put: {
                tags: ['Categorias'],
                summary: 'Atualiza categoria',
                security: [{ bearerAuth: [] }],
                parameters: [idParam()],
                requestBody: jsonBody('CategoriaInput'),
                responses: {
                    200: jsonResponse('Categoria', 'Categoria atualizada'),
                    400: errorResponse(),
                    401: errorResponse(),
                    404: errorResponse(),
                    500: errorResponse()
                }
            },
            delete: {
                tags: ['Categorias'],
                summary: 'Remove categoria',
                security: [{ bearerAuth: [] }],
                parameters: [idParam()],
                responses: {
                    200: messageResponse('Categoria deletada com sucesso'),
                    400: errorResponse(),
                    401: errorResponse(),
                    404: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/produtos': {
            get: {
                tags: ['Produtos'],
                summary: 'Lista produtos',
                parameters: paginationParams(),
                responses: {
                    200: arrayResponse('Produto', 'Lista de produtos'),
                    400: errorResponse(),
                    500: errorResponse()
                }
            },
            post: {
                tags: ['Produtos'],
                summary: 'Cria produto',
                security: [{ bearerAuth: [] }],
                requestBody: jsonBody('ProdutoInput'),
                responses: {
                    201: jsonResponse('Produto', 'Produto criado'),
                    400: errorResponse(),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/produtos/buscar': {
            get: {
                tags: ['Produtos'],
                summary: 'Busca produtos por filtros',
                parameters: [
                    { name: 'nome', in: 'query', schema: { type: 'string' } },
                    { name: 'categoria', in: 'query', schema: { type: 'string' } },
                    { name: 'marca', in: 'query', schema: { type: 'string' } },
                    { name: 'precoMin', in: 'query', schema: { type: 'number' } },
                    { name: 'precoMax', in: 'query', schema: { type: 'number' } },
                    ...paginationParams()
                ],
                responses: {
                    200: arrayResponse('Produto', 'Produtos filtrados'),
                    400: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/produtos/{id}': {
            get: {
                tags: ['Produtos'],
                summary: 'Busca produto por ID',
                parameters: [idParam()],
                responses: {
                    200: jsonResponse('Produto', 'Produto encontrado'),
                    400: errorResponse(),
                    404: errorResponse(),
                    500: errorResponse()
                }
            },
            put: {
                tags: ['Produtos'],
                summary: 'Atualiza produto',
                security: [{ bearerAuth: [] }],
                parameters: [idParam()],
                requestBody: jsonBody('ProdutoInput'),
                responses: {
                    200: jsonResponse('Produto', 'Produto atualizado'),
                    400: errorResponse(),
                    401: errorResponse(),
                    404: errorResponse(),
                    500: errorResponse()
                }
            },
            delete: {
                tags: ['Produtos'],
                summary: 'Remove produto',
                security: [{ bearerAuth: [] }],
                parameters: [idParam()],
                responses: {
                    200: messageResponse('Instrumento deletado com sucesso'),
                    400: errorResponse(),
                    401: errorResponse(),
                    404: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/produtos/frete/{cep}': {
            get: {
                tags: ['Produtos'],
                summary: 'Calcula frete por CEP usando ViaCEP',
                parameters: [
                    {
                        name: 'cep',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: '01001000' }
                    }
                ],
                responses: {
                    200: jsonResponse('Frete', 'Frete calculado'),
                    400: errorResponse(),
                    404: errorResponse(),
                    502: errorResponse()
                }
            }
        },
        '/produtos/{id}/comprar': {
            post: {
                tags: ['Compras'],
                summary: 'Registra compra de produto',
                security: [{ bearerAuth: [] }],
                parameters: [idParam()],
                requestBody: jsonBody('CompraInput'),
                responses: {
                    201: jsonResponse('Compra', 'Compra criada'),
                    400: errorResponse(),
                    401: errorResponse(),
                    404: errorResponse(),
                    409: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/compras': {
            get: {
                tags: ['Compras'],
                summary: 'Lista compras',
                security: [{ bearerAuth: [] }],
                parameters: paginationParams(),
                responses: {
                    200: arrayResponse('Compra', 'Lista de compras'),
                    400: errorResponse(),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        },
        '/compras/{id}/aprovar': statusCompraPath('Aprova compra pendente'),
        '/compras/{id}/reprovar': statusCompraPath('Reprova compra pendente e devolve estoque'),
        '/emails/teste': {
            post: {
                tags: ['Email'],
                summary: 'Envia email de teste',
                security: [{ bearerAuth: [] }],
                requestBody: jsonBody('EmailTesteInput'),
                responses: {
                    200: {
                        description: 'Resultado do envio',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        enviado: { type: 'boolean', example: false },
                                        motivo: { type: 'string', example: 'Servico de email nao configurado' }
                                    }
                                }
                            }
                        }
                    },
                    400: errorResponse(),
                    401: errorResponse(),
                    500: errorResponse()
                }
            }
        }
    }
};

function jsonBody(schemaName) {
    return {
        required: true,
        content: {
            'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
            }
        }
    };
}

function jsonResponse(schemaName, description) {
    return {
        description,
        content: {
            'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
            }
        }
    };
}

function arrayResponse(schemaName, description) {
    return {
        description,
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: { $ref: `#/components/schemas/${schemaName}` }
                }
            }
        }
    };
}

function errorResponse() {
    return jsonResponse('ErrorResponse', 'Erro padronizado');
}

function messageResponse(example) {
    return {
        description: 'Mensagem de sucesso',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example }
                    }
                }
            }
        }
    };
}

function idParam() {
    return {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1, example: 1 }
    };
}

function paginationParams() {
    return [
        { name: 'pagina', in: 'query', schema: { type: 'integer', minimum: 1, example: 1 } },
        { name: 'limite', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, example: 10 } }
    ];
}

function statusCompraPath(summary) {
    return {
        put: {
            tags: ['Compras'],
            summary,
            security: [{ bearerAuth: [] }],
            parameters: [idParam()],
            responses: {
                200: jsonResponse('Compra', 'Compra atualizada'),
                400: errorResponse(),
                401: errorResponse(),
                404: errorResponse(),
                500: errorResponse()
            }
        }
    };
}

module.exports = openapi;
