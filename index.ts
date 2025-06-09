import { ActionFlow, createMetadata, ExecutionResponse, Metadata } from '@sherrylinks/sdk';
import express from 'express';
import type { Request, Response } from 'express';

const exampleAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'safeTransferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

// Create a simple token transfer metadata
const metadata: Metadata = {
  url: 'https://sherry.social',
  icon: 'https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//BuyCoffee-Miniapp.png',
  title: 'Sherry',
  baseUrl: 'https://6v1kgmz3-3000.use2.devtunnels.ms/metadata',
  description: 'Sherry is a social media platform that allows you to connect with your friends and family.',
  actions: [
    {
      type: 'dynamic',
      label: 'Enviar Café ☕',
      chains: { source: 'avalanche' },
      path: 'https://6v1kgmz3-3000.use2.devtunnels.ms/api/test',
      params: [
        {
          name: 'amount',
          label: 'Elige cantidad',
          type: 'radio',
          required: true,
          options: [
            { label: 'Pequeño ☕', value: 0.01, description: '0.01 AVAX' },
            { label: 'Mediano 🧋', value: 0.05, description: '0.05 AVAX' },
            { label: 'Grande 🍵', value: 0.1, description: '0.1 AVAX' },
          ],
        },
        {
          name: 'text',
          label: 'Escribe un mensaje',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/metadata', (req: Request, res: Response) => {
  console.log('Solicitud recibida en /metadata');
  res.json(validatedMetadata);
});

app.post('/api/test', (req: Request, res: Response) => {
  console.log('Solicitud recibida en /api/test');
  // test?amount=0.05
  const { amount, text } = req.query;
  console.log('amount', amount);
  console.log('text', text);

  res.status(400).json({
    error: 'Invalid request',
  });

  // const a: ExecutionResponse = {
  //   chainId: '43113',
  //   serializedTransaction:
  //     '0x02f87082012a022f2f83018000947e3a9eaf9dcc38a2133b2587b7e7e7f7f6a5e3e88082520894000000000000000000000000000000000000000080c001a0df789ddf0aed53a6a9c5b8c3c5d5b8c3c5d5b8c3c5d5b8c3c5d5b8c3c5d5b8a00df789ddf0aed53a6a9c5b8c3c5d5b8c3c5d5b8c3c5d5b8c3c5d5b8c3c5d5b8',
  // };
  // res.status(200).json(a).header({
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  //   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  // });
});

app.get('/swap-flow', (req: Request, res: Response) => {
  console.log('Solicitud recibida en /swap-flow');
  res.json(validatedMetadata);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
