const API_URL = 'https://storageat.onrender.com'; 

const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');
const totalProdutosSpan = document.getElementById('totalProdutos');
const totalVendidosSpan = document.getElementById('totalVendidos');
const lucroVendasSpan = document.getElementById('lucroVendas');

let produtos = [];
let vendas = [];


async function carregarProdutos() {
  const response = await fetch(`${API_URL}/storage`);
  produtos = await response.json();
  atualizarTabela();
}


async function registrarSaida(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto || produto.value === 0) return;

  const novaQuantidade = produto.quantidade ? produto.quantidade - 1 : 0;

  await fetch(`${API_URL}/storage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: produto.title,
      description: produto.description,
      value: produto.value,
      quantidade: novaQuantidade 
    }),
  });


  produto.quantidade = novaQuantidade;

  vendas.push({
    nome: produto.title,
    precoCompra: parseFloat(extrairPrecoCompra(produto.description)), 
    precoVenda: produto.value,
    quantidade: 1
  });

  atualizarTabela();
}

// Função para extrair preço de compra da descrição
function extrairPrecoCompra(desc) {
  // Supondo que a descrição tenha o formato "Compra: R$XX.XX | ..."
  const match = desc.match(/Compra: R\$([\d.,]+)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

function atualizarTabela() {
  tabela.innerHTML = '';
  produtos.forEach((produto) => {
    const lucroUnitario = produto.value - extrairPrecoCompra(produto.description);
    const quantidade = produto.quantidade ?? 0;
    const lucroTotal = lucroUnitario * quantidade;

    const linha = `
      <tr class="${quantidade === 0 ? 'fora-estoque' : ''}">
        <td>${produto.title}</td>
        <td>${quantidade}</td>
        <td>R$ ${lucroUnitario.toFixed(2)}</td>
        <td>R$ ${lucroTotal.toFixed(2)}</td>
        <td>
          <button onclick="registrarSaida('${produto.id}')" ${quantidade === 0 ? 'disabled' : ''}>Vender</button>
        </td>
      </tr>
    `;
    tabela.innerHTML += linha;
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

  const nome = document.getElementById('nome').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const precoCompra = parseFloat(document.getElementById('precoCompra').value);
  const precoVenda = parseFloat(document.getElementById('precoVenda').value);

  const descricao = `Compra: R$${precoCompra.toFixed(2)} | Qtde: ${quantidade}`;

  await fetch(`${API_URL}/storage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: nome,
      description: descricao,
      value: precoVenda,
      quantidade 
    }),
  });

  await carregarProdutos();
  form.reset();
}

form.addEventListener('submit', adicionarProduto);


carregarProdutos();
