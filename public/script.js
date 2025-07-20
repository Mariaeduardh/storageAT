const API_URL = 'https://storageat.onrender.com';

const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');
const totalProdutosSpan = document.getElementById('totalProdutos');
const totalVendidosSpan = document.getElementById('totalVendidos');
const lucroVendasSpan = document.getElementById('lucroVendas');
const btnLimpar = document.getElementById('btnLimpar');

let produtos = [];
let vendas = [];

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_URL}/storage`);
    if (!response.ok) throw new Error('Erro ao carregar produtos');
    produtos = await response.json();
    atualizarTabela();
  } catch (error) {
    console.error(error);
    alert('Não foi possível carregar os produtos. Tente novamente.');
  }
}

async function registrarSaida(id) {
  try {
    const produto = produtos.find(p => p.id === id);
    if (!produto || (produto.quantidade ?? 0) === 0) return;

    const novaQuantidade = (produto.quantidade ?? 0) - 1;

    const response = await fetch(`${API_URL}/storage/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: produto.title,
        description: produto.description,
        value: produto.value,
        quantidade: novaQuantidade
      }),
    });

    if (!response.ok) throw new Error('Erro ao registrar saída');

    // Atualiza a quantidade local do produto
    produto.quantidade = novaQuantidade;

    // Registra a venda localmente (para relatório)
    vendas.push({
      nome: produto.title,
      precoCompra: parseFloat(extrairPrecoCompra(produto.description)),
      precoVenda: produto.value,
      quantidade: 1
    });

    atualizarTabela();
  } catch (error) {
    console.error(error);
    alert('Não foi possível registrar a saída. Tente novamente.');
  }
}

function extrairPrecoCompra(desc) {
  const match = desc.match(/Compra: R\$([\d.,]+)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

function atualizarTabela() {
  tabela.innerHTML = '';

  produtos.forEach((produto) => {
    const lucroUnitario = produto.value - extrairPrecoCompra(produto.description);
    const quantidade = produto.quantidade ?? 0;
    const lucroTotal = lucroUnitario * quantidade;

    const linha = document.createElement('tr');
    if (quantidade === 0) linha.classList.add('fora-estoque');

    linha.innerHTML = `
      <td>${produto.title}</td>
      <td>${quantidade}</td>
      <td>R$ ${lucroUnitario.toFixed(2)}</td>
      <td>R$ ${lucroTotal.toFixed(2)}</td>
      <td></td>
    `;

    const tdAcoes = linha.querySelector('td:last-child');
    const btnVender = document.createElement('button');
    btnVender.textContent = 'Vender';
    btnVender.disabled = quantidade === 0;
    btnVender.addEventListener('click', () => registrarSaida(produto.id));
    tdAcoes.appendChild(btnVender);

    tabela.appendChild(linha);
  });

  atualizarRelatorio();
}

function atualizarRelatorio() {
  const totalProdutos = produtos.reduce((sum, p) => sum + (p.quantidade ?? 0), 0);
  const totalVendidos = vendas.reduce((sum, v) => sum + v.quantidade, 0);
  const lucroVendas = vendas.reduce((sum, v) => sum + ((v.precoVenda - v.precoCompra) * v.quantidade), 0);

  totalProdutosSpan.textContent = totalProdutos;
  totalVendidosSpan.textContent = totalVendidos;
  lucroVendasSpan.textContent = lucroVendas.toFixed(2);
}

async function adicionarProduto(evento) {
  evento.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const precoCompra = parseFloat(document.getElementById('precoCompra').value);
  const precoVenda = parseFloat(document.getElementById('precoVenda').value);

  if (!nome || isNaN(quantidade) || quantidade <= 0 || isNaN(precoCompra) || precoCompra <= 0 || isNaN(precoVenda) || precoVenda <= 0) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const descricao = `Compra: R$${precoCompra.toFixed(2)} | Qtde: ${quantidade}`;

  try {
    const response = await fetch(`${API_URL}/storage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: nome,
        description: descricao,
        value: precoVenda,
        quantidade
      }),
    });

    if (!response.ok) throw new Error('Erro ao adicionar produto');

    await carregarProdutos();
    form.reset();
  } catch (error) {
    console.error(error);
    alert('Não foi possível adicionar o produto. Tente novamente.');
  }
}

async function limparTabela() {
  produtos = [];
  vendas = [];
  atualizarTabela();
  atualizarRelatorio();
  await carregarProdutos();
}

form.addEventListener('submit', adicionarProduto);
btnLimpar.addEventListener('click', limparTabela);

carregarProdutos();
