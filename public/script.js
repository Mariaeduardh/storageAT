const API_URL = "https://storageat.onrender.com"; // backend no Render

const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');
const totalProdutosSpan = document.getElementById('totalProdutos');
const lucroSpan = document.getElementById('lucroVendas');

// 🟢 ADICIONAR PRODUTO
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const produto = {
    title: document.getElementById('nome').value.trim(),
    quantidade: Number(document.getElementById('quantidade').value),
    value: Number(document.getElementById('precoVenda').value),
    precoCompra: Number(document.getElementById('precoCompra').value),
  };

  if (!produto.title || produto.quantidade <= 0 || produto.value <= 0 || produto.precoCompra <= 0) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto),
  });

  form.reset();
  carregarProdutos();
});

// 🟡 LIMPAR VISUALMENTE (NÃO APAGA DO BANCO)
document.getElementById('btnLimpar').addEventListener('click', () => {
  tabela.innerHTML = '';
  totalProdutosSpan.textContent = '0';
  lucroSpan.textContent = '0.00';
});

// 🔵 CARREGAR PRODUTOS
async function carregarProdutos() {
  const resposta = await fetch(API_URL);
  const produtos = await resposta.json();

  tabela.innerHTML = '';
  let totalQuantidade = 0;
  let lucroTotal = 0;

  produtos.forEach((produto) => {
    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    tdNome.textContent = produto.title;

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = produto.quantidade;

    const tdValor = document.createElement('td');
    tdValor.textContent = `R$ ${produto.value.toFixed(2)}`;

    const tdLucro = document.createElement('td');
    const lucroUnitario = produto.value - produto.precoCompra;
    const lucro = lucroUnitario * produto.quantidade;
    tdLucro.textContent = `R$ ${lucro.toFixed(2)}`;

    const tdAcoes = document.createElement('td');

    // BOTÃO VENDER 1
    const btnVender = document.createElement('button');
    btnVender.textContent = 'Vender 1';
    btnVender.disabled = produto.quantidade === 0;
    btnVender.onclick = () => venderProduto(produto.id);

    // BOTÃO EXCLUIR
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.onclick = () => excluirProduto(produto.id);

    tdAcoes.appendChild(btnVender);
    tdAcoes.appendChild(btnExcluir);

    tr.append(tdNome, tdQuantidade, tdValor, tdLucro, tdAcoes);
    tabela.appendChild(tr);

    totalQuantidade += produto.quantidade;
    lucroTotal += lucro;
  });

  totalProdutosSpan.textContent = totalQuantidade;
  lucroSpan.textContent = lucroTotal.toFixed(2);
}

// 🔴 FUNÇÃO VENDER 1
async function venderProduto(id) {
  try {
    const resposta = await fetch(`${API_URL}/storage/${id}/decrement`, {
      method: 'PATCH',
    });

    const data = await resposta.json();

    if (resposta.ok) {
      alert(data.message);
    } else {
      alert(data.error || 'Erro ao vender produto');
    }

    carregarProdutos();
  } catch (error) {
    console.error("Erro na venda:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// 🧹 FUNÇÃO EXCLUIR
async function excluirProduto(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    carregarProdutos();
  }
}

// Inicializa
carregarProdutos();
