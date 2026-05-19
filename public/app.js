const productGrid = document.getElementById('productGrid');
const searchForm = document.getElementById('searchForm');
const reloadProducts = document.getElementById('reloadProducts');
const freightForm = document.getElementById('freightForm');
const freightResult = document.getElementById('freightResult');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartTotal = document.getElementById('cartTotal');
const loginForm = document.getElementById('loginForm');
const userForm = document.getElementById('userForm');
const logoutButton = document.getElementById('logoutButton');
const loadUsersButton = document.getElementById('loadUsersButton');
const loadSalesButton = document.getElementById('loadSalesButton');
const sessionStatus = document.getElementById('sessionStatus');
const loginMessage = document.getElementById('loginMessage');
const userMessage = document.getElementById('userMessage');
const usersTable = document.getElementById('usersTable');
const salesTable = document.getElementById('salesTable');

const fallbackImages = [
    'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=900&q=80'
];

const sampleProducts = [
    {
        id_produto: 1,
        nome: 'Violao Acustico Natural',
        descricao: 'Som encorpado para estudo, palco e rodas musicais.',
        preco: 799.9,
        estoque: 8,
        categoria: 'Cordas',
        marca: 'Giannini'
    },
    {
        id_produto: 2,
        nome: 'Guitarra Stratocaster',
        descricao: 'Captadores versateis e braco confortavel.',
        preco: 1499.9,
        estoque: 4,
        categoria: 'Cordas',
        marca: 'Tagima'
    },
    {
        id_produto: 3,
        nome: 'Teclado Arranjador',
        descricao: 'Ritmos, timbres e praticidade para composicao.',
        preco: 2199,
        estoque: 0,
        categoria: 'Teclas',
        marca: 'Yamaha'
    }
];

let cart = [];
let token = localStorage.getItem('lojaToken') || '';

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function productImage(product, index) {
    if (product.imagem) {
        return product.imagem;
    }

    return fallbackImages[index % fallbackImages.length];
}

function productId(product) {
    return product.id_produto || product.id || product.codigo;
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = '<article class="loading-card">Nenhum produto encontrado.</article>';
        return;
    }

    productGrid.innerHTML = products.map((product, index) => {
        const estoque = Number(product.estoque || 0);
        const disabled = estoque <= 0 ? 'disabled' : '';
        const stockClass = estoque <= 0 ? 'stock out' : 'stock';
        const stockText = estoque <= 0 ? 'Sem estoque' : `${estoque} em estoque`;

        return `
            <article class="product-card">
                <div class="product-media" style="background-image: url('${productImage(product, index)}')"></div>
                <div class="product-body">
                    <span class="${stockClass}">${stockText}</span>
                    <h3 class="product-title">${product.nome || 'Instrumento'}</h3>
                    <div class="product-meta">${product.marca || 'Marca selecionada'} · ${product.categoria || 'Categoria'}</div>
                    <p class="product-meta">${product.descricao || 'Instrumento disponivel na loja.'}</p>
                    <div class="product-bottom">
                        <strong class="price">${formatCurrency(product.preco)}</strong>
                        <button type="button" ${disabled} data-product='${JSON.stringify(product)}'>Adicionar</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    productGrid.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => {
            addToCart(JSON.parse(button.dataset.product));
        });
    });
}

async function loadProducts(filters = {}) {
    productGrid.innerHTML = '<article class="loading-card">Carregando produtos...</article>';

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    const endpoint = params.toString() ? `/produtos/buscar?${params}` : '/produtos';

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        renderProducts(sampleProducts);
    }
}

function addToCart(product) {
    const id = productId(product);
    const item = cart.find((cartItem) => productId(cartItem) === id);

    if (item) {
        item.quantidade += 1;
    } else {
        cart.push({
            ...product,
            quantidade: 1
        });
    }

    renderCart();
}

function renderCart() {
    cartEmpty.style.display = cart.length ? 'none' : 'block';

    cartItems.innerHTML = cart.map((item) => `
        <div class="cart-line">
            <span>${item.quantidade}x ${item.nome}</span>
            <strong>${formatCurrency(Number(item.preco) * item.quantidade)}</strong>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + Number(item.preco || 0) * item.quantidade, 0);
    cartTotal.textContent = `Total: ${formatCurrency(total)}`;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

function updateSessionStatus() {
    if (token) {
        sessionStatus.textContent = 'Login ativo';
        sessionStatus.classList.add('active');
        return;
    }

    sessionStatus.textContent = 'Sem login';
    sessionStatus.classList.remove('active');
}

function renderUsers(users) {
    if (!users.length) {
        usersTable.innerHTML = '<tr><td colspan="4">Nenhum usuario encontrado.</td></tr>';
        return;
    }

    usersTable.innerHTML = users.map((user) => `
        <tr>
            <td>${user.id_usuario}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.tipo_usuario}</td>
        </tr>
    `).join('');
}

function renderSales(sales) {
    if (!sales.length) {
        salesTable.innerHTML = '<tr><td colspan="6">Nenhuma venda encontrada.</td></tr>';
        return;
    }

    salesTable.innerHTML = sales.map((sale) => {
        const isPending = sale.status === 'pendente';
        const actions = isPending
            ? `<div class="action-row">
                <button class="table-action" data-sale-action="aprovar" data-sale-id="${sale.id_compra}">Aprovar</button>
                <button class="table-action reject" data-sale-action="reprovar" data-sale-id="${sale.id_compra}">Reprovar</button>
            </div>`
            : 'Finalizada';

        return `
            <tr>
                <td>${sale.id_compra}</td>
                <td>${sale.nome_usuario || sale.email_usuario || 'Cliente'}</td>
                <td>${sale.nome_produto || sale.id_produto}</td>
                <td>${formatCurrency(sale.valor_total)}</td>
                <td><span class="status-badge ${sale.status}">${sale.status}</span></td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');

    salesTable.querySelectorAll('[data-sale-action]').forEach((button) => {
        button.addEventListener('click', async () => {
            await updateSaleStatus(button.dataset.saleId, button.dataset.saleAction);
        });
    });
}

async function loadUsers() {
    if (!token) {
        usersTable.innerHTML = '<tr><td colspan="4">Faca login para carregar usuarios.</td></tr>';
        return;
    }

    usersTable.innerHTML = '<tr><td colspan="4">Carregando usuarios...</td></tr>';

    try {
        const response = await fetch('/usuarios', {
            headers: authHeaders()
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao carregar usuarios');
        }

        renderUsers(data);
    } catch (error) {
        usersTable.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
    }
}

async function loadSales() {
    if (!token) {
        salesTable.innerHTML = '<tr><td colspan="6">Faca login para carregar vendas.</td></tr>';
        return;
    }

    salesTable.innerHTML = '<tr><td colspan="6">Carregando vendas...</td></tr>';

    try {
        const response = await fetch('/compras', {
            headers: authHeaders()
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao carregar vendas');
        }

        renderSales(data);
    } catch (error) {
        salesTable.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
}

async function updateSaleStatus(id, action) {
    try {
        const response = await fetch(`/compras/${id}/${action}`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar venda');
        }

        await loadSales();
    } catch (error) {
        salesTable.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    loadProducts({
        nome: document.getElementById('filterName').value,
        categoria: document.getElementById('filterCategory').value,
        marca: document.getElementById('filterBrand').value,
        precoMax: document.getElementById('filterPrice').value
    });
});

reloadProducts.addEventListener('click', () => loadProducts());

freightForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const cep = document.getElementById('cepInput').value.replace(/\D/g, '');

    if (cep.length !== 8) {
        freightResult.textContent = 'Digite um CEP com 8 numeros.';
        return;
    }

    freightResult.textContent = 'Consultando frete...';

    try {
        const response = await fetch(`/produtos/frete/${cep}`);
        const freight = await response.json();

        if (!response.ok) {
            throw new Error(freight.message || 'Erro ao calcular frete');
        }

        freightResult.textContent = `${freight.logradouro || 'Endereco'} - ${freight.cidade}/${freight.uf}. Frete ${formatCurrency(freight.valor)} com prazo de ${freight.prazo_dias} dias.`;
    } catch (error) {
        freightResult.textContent = error.message;
    }
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginMessage.textContent = 'Entrando...';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                senha: document.getElementById('loginPassword').value
            })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        token = data.token;
        localStorage.setItem('lojaToken', token);
        updateSessionStatus();
        loginMessage.textContent = 'Login realizado com sucesso.';
        await Promise.all([loadUsers(), loadSales()]);
    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

logoutButton.addEventListener('click', () => {
    token = '';
    localStorage.removeItem('lojaToken');
    updateSessionStatus();
    loginMessage.textContent = 'Voce saiu da area administrativa.';
});

userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    userMessage.textContent = 'Cadastrando usuario...';

    try {
        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                senha: document.getElementById('userPassword').value,
                tipo_usuario: document.getElementById('userType').value
            })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao cadastrar usuario');
        }

        userForm.reset();
        userMessage.textContent = 'Usuario cadastrado com sucesso.';
        await loadUsers();
    } catch (error) {
        userMessage.textContent = error.message;
    }
});

loadUsersButton.addEventListener('click', loadUsers);
loadSalesButton.addEventListener('click', loadSales);

updateSessionStatus();
loadProducts();
