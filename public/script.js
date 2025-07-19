const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');
const totalProdutosSpan = document.getElementById('totalProdutos');
const totalVendidosSpan = document.getElementById('totalVendidos');
const lucroVendasSpan = document.getElementById('lucroVendas');

let produtos = JSON.parse(localStorage.getItem('estoque')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

function atualizarTabela() {
    tabela.innerHTML = '';
    produtos.forEach((produto, index) => {
        const lucroUnitario = produto.precoVenda - produto.precoCompra;
        const lucroTotal = lucroUnitario * produto.quantidade;

        let classeLinha = '';
        if (produto.novidade) classeLinha = 'novidade';
        if (produto.quantidade === 0) classeLinha = 'fora-estoque';

        const linha = `
            <tr class="${classeLinha}">
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${lucroUnitario.toFixed(2)}</td>
                <td>R$ ${lucroTotal.toFixed(2)}</td>
                <td>
                    <button onclick="registrarSaida(${index})" ${produto.quantidade === 0 ? 'disabled' : ''}>Vender</button>
                </td>
            </tr>
        `;
        tabela.innerHTML += linha;
    });

    atualizarRelatorio();
}

function atualizarRelatorio() {
    const totalProdutos = produtos.reduce((sum, p) => sum + p.quantidade, 0);
    const totalVendidos = vendas.reduce((sum, v) => sum + v.quantidade, 0);
    const lucroVendas = vendas.reduce((sum, v) => sum + ((v.precoVenda - v.precoCompra) * v.quantidade), 0);

    totalProdutosSpan.textContent = totalProdutos;
    totalVendidosSpan.textContent = totalVendidos;
    lucroVendasSpan.textContent = lucroVendas.toFixed(2);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const precoCompra = parseFloat(document.getElementById('precoCompra').value);
    const precoVenda = parseFloat(document.getElementById('precoVenda').value);

    const novoProduto = { nome, quantidade, precoCompra, precoVenda, novidade: true };
    produtos.push(novoProduto);
    
    salvarDados();
    atualizarTabela();
    form.reset();
});

function registrarSaida(index) {
    if (produtos[index].quantidade > 0) {
        produtos[index].quantidade -= 1;

        vendas.push({
            nome: produtos[index].nome,
            precoCompra: produtos[index].precoCompra,
            precoVenda: produtos[index].precoVenda,
            quantidade: 1
        });

        produtos[index].novidade = false;  // Produto deixa de ser novidade após uma venda
        salvarDados();
        atualizarTabela();
    }
}

function salvarDados() {
    localStorage.setItem('estoque', JSON.stringify(produtos));
    localStorage.setItem('vendas', JSON.stringify(vendas));
}

atualizarTabela();
