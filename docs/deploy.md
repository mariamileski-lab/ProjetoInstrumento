# Deploy da Loja de Instrumentos

## Opcao recomendada: Railway

Railway e uma boa escolha para este projeto porque permite subir Node.js e MySQL no mesmo painel.

### 1. Preparar repositorio

1. Suba o projeto para o GitHub.
2. Confirme que o arquivo `.env` nao foi enviado.
3. Use `.env.example` como referencia das variaveis.

### 2. Criar banco MySQL

1. No Railway, crie um novo projeto.
2. Adicione um servico MySQL.
3. Abra as variaveis do MySQL e copie:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### 3. Criar aplicacao Node.js

1. No mesmo projeto, adicione um servico a partir do repositorio GitHub.
2. Configure as variaveis:

```env
NODE_ENV=production
DB_HOST=valor_do_MYSQLHOST
DB_PORT=valor_do_MYSQLPORT
DB_USER=valor_do_MYSQLUSER
DB_PASSWORD=valor_do_MYSQLPASSWORD
DB_NAME=valor_do_MYSQLDATABASE
JWT_SECRET=um_texto_grande_e_secreto
```

3. O comando de start deve ser:

```bash
npm start
```

### 4. Criar tabelas

Abra o banco MySQL no Railway e execute o conteudo de:

```txt
database/schema.sql
```

### 5. Criar usuario admin

Com a API no ar, cadastre o primeiro admin usando:

```http
POST /usuarios
Content-Type: application/json

{
  "nome": "Admin",
  "email": "admin@loja.com",
  "senha": "123456",
  "tipo_usuario": "admin"
}
```

Depois acesse o front em producao, faca login com esse admin e confira:

- catalogo
- usuarios
- vendas
- documentacao em `/docs`
- contrato OpenAPI em `/openapi.json`

## Rotas importantes para a banca

- Frontend: `/`
- Documentacao: `/docs`
- OpenAPI JSON: `/openapi.json`
- Login: `POST /login`
- Produtos: `GET /produtos`
- Compras: `GET /compras`
