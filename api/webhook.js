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

    // Tenta importar Firebase apenas quando necessário
    let firebaseResult = null;
    try {
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

      const firebaseConfig = {
        apiKey: "AIzaSyDj847aPEBS1LQYWVnZ5AoEu6TBgPvAhwg",
        authDomain: "zoomsorveteria.firebaseapp.com",
        projectId: "zoomsorveteria",
        storageBucket: "zoomsorveteria.firebasestorage.app",
        messagingSenderId: "109600955336",
        appId: "1:109600955336:web:7c795c202817d87cfcfefd"
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // Processa o produto
      const produtoId = dados.id || dados.product_id || dados.codigo || `webhook_${Date.now()}`;
      const produtoNome = dados.name || dados.nome || dados.title || 'Produto Webhook';
      const preco = parseFloat(dados.price || dados.preco || 0);

      // Salva no Firebase
      await setDoc(doc(db, 'cardapio', produtoId), {
        codigo: produtoId,
        nome: produtoNome,
        preco: preco,
        tipo: dados.type || dados.tipo || 'unidade',
        ativo: dados.active !== false,
        origem: 'webhook',
        dadosOriginais: dados,
        updatedAt: serverTimestamp(),
        webhookProcessadoEm: serverTimestamp()
      }, { merge: true });

      firebaseResult = `Produto ${produtoNome} salvo no Firebase`;
      console.log(firebaseResult);

    } catch (firebaseError) {
      console.error('Erro Firebase:', firebaseError);
      firebaseResult = `Erro Firebase: ${firebaseError.message}`;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Dados processados',
      dados: dados,
      firebase: firebaseResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: error.message 
    });
  }
}
