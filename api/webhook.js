export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'Webhook funcionando!',
      timestamp: new Date().toISOString(),
      message: 'Use POST para enviar dados'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const dados = req.body;
    console.log('Webhook recebido:', dados);

    // Simula processamento bem-sucedido
    return res.status(200).json({ 
      success: true,
      message: 'Dados recebidos com sucesso',
      dados: dados,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: error.message 
    });
  }
}
