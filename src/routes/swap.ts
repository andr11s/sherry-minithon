import { Router } from 'express';
import { encodeFunctionData, parseEther } from 'viem';
import { avalanche } from 'viem/chains';
import { ExecutionResponse, DynamicActionValidationError } from '../interfaces/types';
import express from 'express';

const router = Router();

// Arena Router ABI for AVAX → UVD swap
const ARENA_ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactAVAXForTokens',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Contract addresses
const ARENA_ROUTER_ADDRESS = '0xf56d524d651b90e4b84dc2fffd83079698b9066e';
const UVD_ADDRESS = '0x4Ffe7e01832243e03668E090706F17726c26d6B2';
const WAVAX_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

router.post('/swap-avax-uvd', express.json(), (req, res): void => {
  try {
    const { avaxAmount, amountOutMin, to, slippage } = req.body;

    // Validation
    if (!avaxAmount || avaxAmount <= 0) {
      throw new DynamicActionValidationError('AVAX amount must be greater than 0');
    }

    if (!amountOutMin || amountOutMin <= 0) {
      throw new DynamicActionValidationError('Minimum UVD amount must be greater than 0');
    }

    if (!to || !to.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new DynamicActionValidationError('Invalid recipient address');
    }

    // Swap path: WAVAX → UVD (cast to the required type)
    const path = [WAVAX_ADDRESS, UVD_ADDRESS] as `0x${string}`[];

    // Transaction deadline (20 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // Convert AVAX amount to Wei
    const avaxAmountWei = parseEther(avaxAmount.toString());

    // Encode the function call
    const data = encodeFunctionData({
      abi: ARENA_ROUTER_ABI,
      functionName: 'swapExactAVAXForTokens',
      args: [BigInt(amountOutMin), path, to as `0x${string}`, BigInt(deadline)],
    });

    const transaction = {
      to: ARENA_ROUTER_ADDRESS as `0x${string}`,
      data,
      value: avaxAmountWei.toString(),
      chainId: avalanche.id,
    } as const;

    const response: ExecutionResponse = {
      serializedTransaction: JSON.stringify(transaction),
      chainId: avalanche.id,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in swap endpoint:', error);

    if (error instanceof DynamicActionValidationError) {
      res.status(400).json({
        error: error.message,
        type: 'validation',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
