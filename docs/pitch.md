# Pitch final

## Abertura

Este projeto e uma Loja de Instrumentos com API em Node.js, Express e MySQL. O sistema permite gerenciar produtos, usuarios, vendas, estoque, calculo de frete por CEP e aprovacao ou reprovacao de compras.

## Problema

Lojas pequenas precisam controlar produtos, estoque e pedidos de forma simples. Sem um sistema centralizado, e facil vender produto sem estoque, perder historico de vendas ou deixar dados administrativos expostos.

## Solucao

A aplicacao resolve isso com:

- catalogo de instrumentos integrado ao banco;
- login com JWT;
- area administrativa visivel apenas para usuarios admin;
- cadastro de usuarios;
- controle de vendas e status de compra;
- baixa automatica de estoque ao comprar;
- devolucao de estoque quando a compra e reprovada;
- consulta de frete usando ViaCEP;
- respostas de erro padronizadas;
- validacao de dados de entrada;
- testes automatizados das rotas criticas;
- documentacao OpenAPI acessivel em producao.

## Demonstracao sugerida

1. Abrir o site em producao.
2. Mostrar que as informacoes ficam ocultas antes do login admin.
3. Fazer login com usuario admin.
4. Mostrar catalogo, usuarios e vendas.
5. Buscar um produto.
6. Calcular frete por CEP.
7. Finalizar uma compra.
8. Abrir a area de vendas e aprovar ou reprovar a compra.
9. Abrir `/docs` e mostrar a documentacao da API.

## Diferenciais tecnicos

O backend usa camadas separadas de rotas, controllers, services e models. Tambem possui middlewares globais para validacao, autenticacao e tratamento de erros. Para qualidade, foram criados testes automatizados com `node:test`.

## Fechamento

Como resultado, o sistema fica pronto para uso em ambiente real, com deploy em nuvem, banco de dados remoto, documentacao publica da API e fluxo administrativo protegido.
