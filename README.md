# 🎵 Projeto Instrumentos Musicais API

## 📌 Sobre o projeto

A API Instrumentos Musicais foi desenvolvida com o objetivo de simular um sistema de gerenciamento de loja de instrumentos musicais, permitindo o cadastro de usuários, categorias, produtos, compras e gerenciamento administrativo.

O projeto foi desenvolvido utilizando Node.js com Express, seguindo uma arquitetura organizada em rotas, controllers, middlewares e validações, além da utilização de autenticação JWT para proteger rotas privadas.

---

# 🚀 Funcionalidades

## 🔐 Autenticação

* Login de usuários
* Geração de token JWT
* Controle de acesso por tipo de usuário
* Rotas protegidas com middleware de autenticação

---

## 👤 Usuários

* Cadastro de usuários
* Listagem de usuários
* Controle de permissões administrativas

---

## 🗂️ Categorias

* Criar categorias
* Listar categorias
* Atualizar categorias
* Remover categorias

---

## 🎸 Produtos / Instrumentos

* Cadastro de produtos
* Atualização de produtos
* Remoção de produtos
* Busca por ID
* Busca personalizada
* Cálculo de frete por CEP
* Compra de produtos

---

## 🛒 Compras

* Criação de compras através dos produtos
* Listagem de compras
* Aprovação de compras
* Reprovação de compras
* Controle de status das compras

---

## 📧 Emails

* Envio de email teste
* Validação de dados de entrada

---

# 🛠️ Tecnologias utilizadas

* Node.js
* Express
* MySQL
* JWT
* BcryptJS
* Nodemailer
* Postman
* JavaScript

---

# 🔒 Segurança e validações

O projeto conta com:

* Middleware global de erros
* Validação de payloads
* Criptografia de senhas com Bcrypt
* Proteção de rotas com JWT
* Controle de permissões administrativas
* Padronização de respostas HTTP

---

# 📁 Estrutura do projeto

```bash
src/
├── config/
├── controllers/
├── middlewares/
├── routes/
├── errors/
├── services/
└── database/
```

---

# 📬 Rotas da API

# 🔐 Auth

## Login

```http
POST /login
```

### Body

```json
{
  "email": "admin@gmail.com",
  "senha": "123456"
}
```

---

# 👤 Usuários

## Criar usuário

```http
POST /usuarios
```

### Body

```json
{
  "nome": "Maria",
  "email": "maria@gmail.com",
  "senha": "123456",
  "tipo_usuario": "admin"
}
```

---

## Listar usuários

```http
GET /usuarios
```

---

# 🗂️ Categorias

## Listar categorias

```http
GET /categorias
```

---

## Criar categoria

```http
POST /categorias
```

### Body

```json
{
  "nome": "Cordas"
}
```

---

## Atualizar categoria

```http
PUT /categorias/:id
```

### Body

```json
{
  "nome": "Percussão"
}
```

---

## Deletar categoria

```http
DELETE /categorias/:id
```

---

# 🎸 Produtos

## Listar produtos

```http
GET /produtos
```

---

## Buscar produtos

```http
GET /produtos/buscar?nome=violao
```

---

## Buscar produto por ID

```http
GET /produtos/:id
```

---

## Calcular frete

```http
GET /produtos/frete/:cep
```

---

## Criar produto

```http
POST /produtos
```

### Body

```json
{
  "nome": "Violão Yamaha",
  "descricao": "Violão profissional",
  "preco": 1500,
  "estoque": 10,
  "id_categoria": 1
}
```

---

## Atualizar produto

```http
PUT /produtos/:id
```

---

## Deletar produto

```http
DELETE /produtos/:id
```

---

## Comprar produto

```http
POST /produtos/:id/comprar
```

### Body

```json
{
  "quantidade": 1
}
```

---

# 🛒 Compras

## Listar compras

```http
GET /compras
```

---

## Aprovar compra

```http
PUT /compras/:id/aprovar
```

---

## Reprovar compra

```http
PUT /compras/:id/reprovar
```

---

# 📧 Emails

## Enviar email teste

```http
POST /emails/teste
```

### Body

```json
{
  "para": "teste@gmail.com"
}
```

---

# ▶️ Como executar o projeto

## Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

---

## Instale as dependências

```bash
npm install
```

---

## Configure as variáveis de ambiente

Crie um arquivo `.env` com:

* conexão do banco MySQL
* JWT_SECRET
* configuração de email

---

## Execute o projeto

```bash
npm start
```

ou

```bash
nodemon
```

---

# 📖 Testes da API

Os testes da API foram realizados utilizando o Postman, com collection organizada por módulos:

* Auth
* Usuários
* Categorias
* Produtos
* Compras
* Emails

Além disso, a collection possui autenticação automática via JWT utilizando variáveis de ambiente.

---

# 🎯 Objetivo acadêmico

Este projeto foi desenvolvido com foco em:

* aprendizado de APIs REST
* autenticação JWT
* validações e segurança
* integração com banco de dados
* organização de back-end
* boas práticas de desenvolvimento

---
