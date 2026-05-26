CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('cliente', 'admin', 'funcionario') NOT NULL DEFAULT 'cliente'
);

CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    id_categoria INT NULL,
    marca VARCHAR(100) NULL,
    CONSTRAINT fk_produtos_categorias
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_usuario INT NULL,
    quantidade INT NOT NULL,
    valor_produtos DECIMAL(10, 2) NOT NULL,
    valor_frete DECIMAL(10, 2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(10, 2) NOT NULL,
    cep VARCHAR(8) NULL,
    status ENUM('pendente', 'aprovado', 'reprovado') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome)
SELECT 'Cordas'
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Cordas');

INSERT INTO categorias (nome)
SELECT 'Teclas'
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Teclas');

INSERT INTO categorias (nome)
SELECT 'Percussao'
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Percussao');

INSERT INTO produtos (nome, descricao, preco, estoque, id_categoria, marca)
SELECT 'Violao Acustico Natural', 'Som encorpado para estudo, palco e rodas musicais.', 799.90, 8, c.id_categoria, 'Giannini'
FROM categorias c
WHERE c.nome = 'Cordas'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Violao Acustico Natural');

INSERT INTO produtos (nome, descricao, preco, estoque, id_categoria, marca)
SELECT 'Guitarra Stratocaster', 'Captadores versateis e braco confortavel.', 1499.90, 4, c.id_categoria, 'Tagima'
FROM categorias c
WHERE c.nome = 'Cordas'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Guitarra Stratocaster');

INSERT INTO produtos (nome, descricao, preco, estoque, id_categoria, marca)
SELECT 'Teclado Arranjador', 'Ritmos, timbres e praticidade para composicao.', 2199.00, 5, c.id_categoria, 'Yamaha'
FROM categorias c
WHERE c.nome = 'Teclas'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Teclado Arranjador');
