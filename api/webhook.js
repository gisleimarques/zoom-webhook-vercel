export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).json({ status: 'OK' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const dados = req.body;
    console.log('=== WEBHOOK RECEBIDO ===', dados);

    // Usar fetch para chamar a REST API do Firebase
    const produtoId = dados.id || `teste_${Date.now()}`;
    const produtoNome = dados.name || 'Produto Teste';
    const preco = dados.price || 25.99;

    const firebaseURL = `https://firestore.googleapis.com/v1/projects/zoomsorveteria/databases/(default)/documents/cardapio/${produtoId}`;
    
    const firebaseDoc = {
      fields: {
        codigo: { stringValue: produtoId },
        nome: { stringValue: produtoNome },
        preco: { doubleValue: preco },
        tipo: { stringValue: 'unidade' },
        ativo: { booleanValue: true },
        origem: { stringValue: 'webhook' },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const response = await fetch(firebaseURL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firebaseDoc)
    });

    if (response.ok) {
      console.log('✅ Produto salvo no Firebase');
      return res.status(200).json({ 
        success: true, 
        message: 'Produto salvo com sucesso',
        produtoId,
        produtoNome
      });
    } else {
      throw new Error(`Firebase error: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
