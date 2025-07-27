const API_URL = "https://storageat.onrender.com/storage";

const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');
const totalProdutosSpan = document.getElementById('totalProdutos');
const vendidosSpan = document.getElementById('totalVendidos');
const lucroSpan = document.getElementById('lucroVendas');

let totalVendidos = 0;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const produto = {
    title: document.getElementById('nome').value.trim(),
    quantidade: Number(document.getElementById('quantidade').value),
    precoCompra: Number(document.getElementById('precoCompra').value.replace(',', '.')),
    value: Number(document.getElementById('precoVenda').value.replace(',', '.')),
    description: document.getElementById('descricao')?.value.trim() || ''
  };

  if (
    !produto.title ||
    isNaN(produto.quantidade) || produto.quantidade <= 0 ||
    isNaN(produto.precoCompra) || produto.precoCompra <= 0 ||
    isNaN(produto.value) || produto.value <= 0
  ) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  try {
    console.log('Produto a ser enviado:', produto);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto),
    });

    if (!res.ok) {
      const data = await res.json();
      alert('Erro ao adicionar produto: ' + (data.error || 'Erro desconhecido'));
      return;
    }

    form.reset();
    carregarProdutos();
  } catch (err) {
    alert('Erro ao adicionar produto');
    console.error(err);
  }
});

async function carregarProdutos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao carregar produtos');

    const produtos = await res.json();

    tabela.innerHTML = '';
    let totalQuantidade = 0;
    let lucroTotal = 0;

    produtos.forEach(produto => {
      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      tdNome.textContent = produto.title;

      const tdQuantidade = document.createElement('td');
      tdQuantidade.textContent = produto.quantidade;

      const tdValor = document.createElement('td');
      const valorVenda = Number(produto.value);
      tdValor.textContent = `R$ ${valorVenda.toFixed(2)}`;

      const precoCompra = Number(produto.preco_compra || produto.precoCompra || 0);
      const lucroProduto = (valorVenda - precoCompra) * produto.quantidade;
      lucroTotal += lucroProduto;

      const tdLucro = document.createElement('td');
      tdLucro.textContent = `R$ ${lucroProduto.toFixed(2)}`;

      const tdAcoes = document.createElement('td');
      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.onclick = () => excluirProduto(produto.id);
      tdAcoes.appendChild(btnExcluir);

      const tdVender = document.createElement('td');
      const btnVender = document.createElement('button');
      btnVender.textContent = 'Vender 1';
      btnVender.disabled = produto.quantidade <= 0;
      btnVender.onclick = () => venderProduto(produto.id);
      tdVender.appendChild(btnVender);

      tr.append(tdNome, tdQuantidade, tdValor, tdLucro, tdAcoes, tdVender);
      tabela.appendChild(tr);

      totalQuantidade += produto.quantidade;
    });

    totalProdutosSpan.textContent = totalQuantidade;
    lucroSpan.textContent = lucroTotal.toFixed(2);
    vendidosSpan.textContent = totalVendidos;
  } catch (err) {
    alert('Erro ao carregar produtos');
    console.error(err);
  }
}

async function venderProduto(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/decrement`, { method: 'PATCH' });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      totalVendidos += 1;
      carregarProdutos();
    } else {
      alert(data.error || 'Erro ao vender o produto');
    }
  } catch (err) {
    alert('Erro ao tentar vender o produto');
    console.error(err);
  }
}

async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      carregarProdutos();
    } else {
      alert('Erro ao excluir produto');
    }
  } catch (err) {
    alert('Erro ao excluir produto');
    console.error(err);
  }
}

document.getElementById('btnLimpar').addEventListener('click', () => {
  if (!confirm('Limpar tabela e relatório? Isso não apaga dados do backend.')) return;
  tabela.innerHTML = '';
  totalProdutosSpan.textContent = '0';
  lucroSpan.textContent = '0.00';
  vendidosSpan.textContent = '0';
  totalVendidos = 0;
});

carregarProdutos();
