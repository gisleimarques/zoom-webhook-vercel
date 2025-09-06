import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const dados = req.body;
    console.log('Webhook recebido:', dados);

    if (!dados) {
      return res.status(400).json({ error: 'Nenhum dado recebido' });
    }

    const produtoId = dados.id || dados.product_id || dados.codigo || `produto_${Date.now()}`;
    const produtoNome = dados.name || dados.nome || dados.title || 'Produto sem nome';
    const preco = parseFloat(dados.price || dados.preco || 0);
    
    await setDoc(doc(db, 'cardapio', produtoId), {
      codigo: produtoId,
      nome: produtoNome,
      preco: preco,
      tipo: dados.type || dados.tipo || 'unidade',
      ativo: dados.active !== false && dados.ativo !== false,
      origem: 'webhook',
      dadosOriginais: dados,
      updatedAt: serverTimestamp(),
      webhookProcessadoEm: serverTimestamp()
    }, { merge: true });

    await addDoc(collection(db, 'webhook_logs'), {
      tipo: 'produto_atualizado',
      produtoId: produtoId,
      produtoNome: produtoNome,
      dados: dados,
      processadoEm: serverTimestamp()
    });

    console.log(`Produto ${produtoNome} salvo com sucesso`);

    return res.status(200).json({ 
      success: true,
      message: 'Produto processado com sucesso',
      produtoId: produtoId,
      produtoNome: produtoNome
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
