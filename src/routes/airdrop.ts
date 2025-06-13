import { Router } from 'express';
import { encodeFunctionData, decodeFunctionResult } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { ABI, CONTRACT_ADDRESS, publicClient } from '../config/contract';
import { sanitizeTxForRpc } from '../utils/transaction';
import {
  Campaign,
  CreateCampaignRequest,
  ClaimRequest,
  ExecutionResponse,
  DynamicActionValidationError,
} from '../interfaces/types';
import express from 'express';
import getThreadAnswers from '../services/threadAnswers';

const router = Router();

router.post('/create', express.json(), (req, res) => {
  const { wallet, tweetUrl, totalAmount, criteria, maxWinners, code } = Object.assign(
    Object.assign({}, req.body),
    req.query
  );

  if (!wallet || !tweetUrl || !totalAmount || !criteria || !maxWinners || !code) {
    res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    return;
  }

  const value = BigInt(Math.floor(Number(totalAmount) * 1e18));
  if (value <= BigInt(0)) {
    res.status(400).json({ error: 'El monto debe ser mayor a cero.' });
    return;
  }

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

  res.json(response);
});

router.post('/claim', express.json(), async (req, res) => {
  const { wallet, code, twitterHandle } = Object.assign(Object.assign({}, req.body), req.query);

  if (!wallet || !code || !twitterHandle) {
    res.status(400).json({ message: 'Faltan parámetros requeridos.', status: '400' });
    return;
  }

  try {
    const data = encodeFunctionData({
      abi: ABI,
      functionName: 'campaigns',
      args: [code],
    });

    const result = await publicClient.call({
      to: CONTRACT_ADDRESS,
      data,
    });

    const campaignInfo = decodeFunctionResult({
      abi: ABI,
      functionName: 'campaigns',
      data: result.data as `0x${string}`,
    }) as [
      Campaign['creator'],
      Campaign['tweetUrl'],
      Campaign['totalAmount'],
      Campaign['criteria'],
      Campaign['maxWinners'],
      Campaign['claimed'],
      Campaign['active']
    ];

    const tweetUrl = campaignInfo[1];
    const threadId = tweetUrl.split('/').pop() as string;
    console.log('threadId', threadId);

    const threadAnswers = await getThreadAnswers(threadId);
    console.log('threadAnswers', threadAnswers);

    const userCommented = threadAnswers?.some((answer) => answer.userHandle === twitterHandle && answer.address === wallet);

    if (!userCommented) {
      const error: DynamicActionValidationError = {
        message: 'No has comentado en el tweet o no eres dueño de la wallet ingresada.',
        name: 'User Not Commented',
      };
      res.status(400).json(error);
      return;
    }

    if (!campaignInfo[6]) {
      const error: DynamicActionValidationError = {
        message: 'La campaña no está activa.',
        name: 'Campaign Inactive',
      };
      res.status(400).json(error);
      return;
    }

    const alreadyClaimed = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'hasClaimed',
      args: [code, wallet as `0x${string}`],
    });

    if (alreadyClaimed) {
      const error: DynamicActionValidationError = {
        message: 'Ya has reclamado el airdrop.',
        name: 'Already Claimed',
      };
      res.status(400).json(error);
      return;
    }

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
  } catch (err) {
    const error: DynamicActionValidationError = {
      message: 'Error al obtener información de la campaña.',
      name: 'error',
    };
    res.status(400).json(error);
  }
});

export default router;
