export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'Webhook funcionando!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const dados = req.body;
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Dados:', JSON.stringify(dados, null, 2));
    
    // Teste básico - só retorna os dados sem Firebase por enquanto
    const produtoId = dados.id || dados.product_id || `teste_${Date.now()}`;
    const produtoNome = dados.name || dados.nome || 'Produto Teste';
    
    console.log('Produto processado:', { produtoId, produtoNome });

    return res.status(200).json({ 
      success: true,
      message: 'Webhook recebido e processado',
      produtoId,
      produtoNome,
      dadosRecebidos: dados,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ERRO no webhook:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: error.message,
      stack: error.stack
    });
  }
}
