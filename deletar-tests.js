import fetch from 'node-fetch';


const API_URL = 'https://storageat.onrender.com/storage'; // Ajuste para seu backend

async function deletarProdutosTeste() {
  const resposta = await fetch(API_URL);
  const produtos = await resposta.json();

  // Exemplo: remove todos que têm no nome ou descrição algo tipo 'teste'
  const produtosTeste = produtos.filter(p => 
    p.title.toLowerCase().includes('teste') || 
    (p.description && p.description.toLowerCase().includes('teste'))
  );

  for (const produto of produtosTeste) {
    console.log(`Deletando produto ${produto.title} (id: ${produto.id})`);
    await fetch(`${API_URL}/${produto.id}`, { method: 'DELETE' });
  }
  console.log('Produtos de teste deletados!');
}

deletarProdutosTeste();
