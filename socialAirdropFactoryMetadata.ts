import { DynamicActionValidationError, ExecutionResponse, Metadata } from '@sherrylinks/sdk';
import express from 'express';
import type { Request, Response } from 'express';
import { encodeFunctionData, serializeTransaction, decodeFunctionResult } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { parseGwei } from 'viem';
import { createPublicClient, http } from 'viem';

const CONTRACT_ADDRESS = '0x1F578Ea168348Ac1883561C2218e8DaF95b96924' as `0x${string}`;
const FUJI_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc' as `0x${string}`;

const FUJI_CHAIN_ID = 43113;
const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'campaignId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'tweetUrl',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'criteria',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxWinners',
        type: 'uint256',
      },
    ],
    name: 'CampaignCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'campaignId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Claimed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'campaigns',
    outputs: [
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'tweetUrl',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'criteria',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'maxWinners',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'claimed',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'campaignId',
        type: 'string',
      },
    ],
    name: 'claimAirdrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'campaignId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'tweetUrl',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'criteria',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'maxWinners',
        type: 'uint256',
      },
    ],
    name: 'createCampaign',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'campaignId',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'hasClaimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'tweetUrlUsed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const socialAirdropFactoryMetadata: Metadata = {
  url: 'https://sherry.social',
  icon: 'https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//BuyCoffee-Miniapp.png',
  title: 'Social Airdrop Factory',
  description: 'Crea y participa en campañas de airdrop social usando Twitter y Avalanche.',
  baseUrl: 'https://6v1kgmz3-3000.use2.devtunnels.ms',
  actions: [
    {
      type: 'dynamic',
      label: 'Crear Campaña de Airdrop',
      description: 'Configura una campaña de airdrop social: define el tweet, monto y criterios.',
      chains: { source: 'fuji' },
      path: '/api/airdrop/create',
      params: [
        {
          name: 'wallet',
          label: 'Tu Wallet',
          type: 'string',
          required: true,
        },
        {
          name: 'tweetUrl',
          label: 'URL del Tweet',
          type: 'string',
          required: true,
        },
        {
          name: 'totalAmount',
          label: 'Monto Total a Repartir (AVAX)',
          type: 'number',
          required: true,
        },
        {
          name: 'criteria',
          label: 'Criterio de Participación',
          type: 'select',
          required: true,
          options: [
            { label: 'Like', value: 'like' },
            { label: 'Retweet', value: 'retweet' },
            { label: 'Reply', value: 'reply' },
            { label: 'Follow', value: 'follow' },
          ],
        },
        {
          name: 'maxWinners',
          label: 'Máximo de Ganadores',
          type: 'number',
          required: true,
        },
        {
          name: 'code',
          label: 'Como quieres identificar tu campaña?',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      type: 'dynamic',
      label: 'Claim de Airdrop',
      description: 'Reclama tu parte del airdrop si cumples los criterios sociales.',
      chains: { source: 'avalanche' },
      path: '/api/airdrop/claim',
      params: [
        {
          name: 'wallet',
          label: 'Tu Wallet',
          type: 'string',
          required: true,
        },
        {
          name: 'code',
          label: 'Código de campaña',
          type: 'text',
          required: true,
        },
        {
          name: 'twitterHandle',
          label: 'Usuario de X',
          type: 'string',
          required: true,
        },
      ],
    },
  ],
};

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req: Request, res: Response) => {
  console.log('Solicitud recibida en /social-airdrop-factory-metadata');
  res.json(socialAirdropFactoryMetadata);
});

// Simulación de almacenamiento en memoria para campañas
const campaigns: any[] = [
  {
    id: 'cmp-001',
    creator: '0x123...abc',
    tweetUrl: 'https://twitter.com/ex11ample/status/1234567890',
    totalAmount: 10,
    criteria: 'like',
    maxWinners: 5,
    claimed: 2,
  },
  {
    id: 'cmp-002',
    creator: '0x456...def',
    tweetUrl: 'https://twitter.com/example/status/9876543210',
    totalAmount: 5,
    criteria: 'retweet',
    maxWinners: 3,
    claimed: 1,
  },
];

function toRpcHex(value: any) {
  if (typeof value === 'bigint') return '0x' + value.toString(16);
  if (typeof value === 'number') return '0x' + value.toString(16);
  if (typeof value === 'string' && /^\d+$/.test(value)) return '0x' + BigInt(value).toString(16);
  return value;
}

function sanitizeTxForRpc(tx: any) {
  const allowedFields = [
    'from',
    'to',
    'gas',
    'gasPrice',
    'value',
    'data',
    'nonce',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
    'accessList',
    'chainId',
  ];
  const sanitized: any = {};
  for (const key of allowedFields) {
    if (tx[key] !== undefined) {
      sanitized[key] = toRpcHex(tx[key]);
    }
  }
  return sanitized;
}

// /api/airdrop/create
app.post('/api/airdrop/create', express.json(), (req: Request, res: Response) => {
  // Permite datos por body o por query
  const { wallet, tweetUrl, totalAmount, criteria, maxWinners, code } = {
    ...req.body,
    ...req.query,
  };
  if (!wallet || !tweetUrl || !totalAmount || !criteria || !maxWinners || !code) {
    res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    return;
  }

  const value = BigInt(Math.floor(Number(totalAmount) * 1e18));
  if (value <= BigInt(0)) {
    res.status(400).json({ error: 'El monto debe ser mayor a cero.' });
    return;
  }

  // Ahora pasamos el código personalizado como primer argumento
  const data = encodeFunctionData({
    abi: ABI,
    functionName: 'createCampaign',
    args: [code, tweetUrl, criteria, BigInt(maxWinners)],
  });

  const tx = {
    to: CONTRACT_ADDRESS,
    value: value,
    data,
    chainId: avalancheFuji.id,
  } as const;

  const sanitizedTx = sanitizeTxForRpc(tx);

  const response: ExecutionResponse = {
    serializedTransaction: JSON.stringify(sanitizedTx),
    chainId: avalancheFuji.id.toString(),
  };

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Content-Type', 'application/json');
  res.json(response);
});

// /api/airdrop/list
app.post('/api/airdrop/list', (req: Request, res: Response) => {
  res.json({ ...campaigns });
});

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(FUJI_RPC_URL),
});

// /api/airdrop/claim
app.post('/api/airdrop/claim', express.json(), async (req: Request, res: Response) => {
  const { wallet, code, twitterHandle } = req.query;

  if (!wallet || !code || !twitterHandle) {
    res.status(400).json({ message: 'Faltan parámetros requeridos.', status: '400' });
    return;
  }

  if (!CONTRACT_ADDRESS) {
    res.status(500).json({ message: 'Dirección del contrato no definida.' });
    return;
  }

  // Validar si la campaña existe usando la función hasClaimed del contrato
  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'hasClaimed',
      args: [code, wallet],
    });

    const result = await publicClient.call({
      to: CONTRACT_ADDRESS,
      data,
    });

    const alreadyClaimed = decodeFunctionResult({
      abi: ABI,
      functionName: 'hasClaimed',
      data: result.data as `0x${string}`,
    });

    if (alreadyClaimed) {
      const a: DynamicActionValidationError = {
        message: 'Campaña no encontrada o error al consultar el contrato.',
        name: 'Campaña no encontrada o error al consultar el contrato.',
      };
      res.status(400).json(a);
      return;
    }
  } catch (err) {
    const error: DynamicActionValidationError = {
      message: 'Campaña no encontrada o error al consultar el contrato.',
      name: 'error',
    };
    res.status(400).json(error);
    return;
  }

  // Si pasa la validación, prepara la transacción de claim
  const claimData = encodeFunctionData({
    abi: ABI,
    functionName: 'claimAirdrop',
    args: [code],
  });

  const claimTx = {
    to: CONTRACT_ADDRESS,
    data: claimData,
    chainId: avalancheFuji.id,
  } as const;

  const sanitizedClaimTx = sanitizeTxForRpc(claimTx);

  const response: ExecutionResponse = {
    serializedTransaction: JSON.stringify(sanitizedClaimTx),
    chainId: avalancheFuji.id.toString(),
  };

  res.json(response);
});

function updateCampaignSelectOptions() {
  const options = campaigns.map((c) => ({
    label: `${c.tweetUrl} (${c.criteria})`,
    value: c.id,
  }));

  // Busca la acción de claim y actualiza sus opciones solo si es de tipo 'dynamic'
  const claimAction = socialAirdropFactoryMetadata.actions.find(
    (a) => a.label === 'Claim de Airdrop' && a.type === 'dynamic'
  );
  if (claimAction && 'params' in claimAction && Array.isArray(claimAction.params)) {
    const campaignIdParam = (claimAction.params as any[]).find((p: any) => p.name === 'code');
    if (campaignIdParam && 'options' in campaignIdParam) {
      campaignIdParam.options = options;
    }
  }
}

// Actualiza las opciones cada 10 segundos
global.setInterval(updateCampaignSelectOptions, 10000);
// También actualiza al iniciar el servidor
updateCampaignSelectOptions();

app.listen(PORT, () => {
  console.log(`Servidor Social Airdrop Factory escuchando en http://localhost:${PORT}`);
});
