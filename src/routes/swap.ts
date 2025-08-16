import { Router } from 'express';
import { encodeFunctionData, parseEther, createPublicClient, http } from 'viem';
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

// Create public client for price queries
const publicClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

router.post('/swap-avax-uvd', express.json(), async (req, res): Promise<void> => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    // Extract data from Sherry format
    const { params, context } = req.body;
    const {
      amount,
      protocol,
      kolRouterAddress,
      userAddress: paramsUserAddress,
      fromToken,
      toToken,
      slippage = '0.5',
    } = params || {};

    const { userAddress: contextUserAddress, sourceChain } = context || {};

    // Use context userAddress as primary, fallback to params
    const userAddress = contextUserAddress || paramsUserAddress;

    // Validation
    // if (!amount || amount <= 0) {
    //   throw new DynamicActionValidationError('AVAX amount must be greater than 0');
    // }

    if (!userAddress) {
      throw new DynamicActionValidationError('User address is required');
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new DynamicActionValidationError('Invalid user address format');
    }

    if (fromToken !== 'AVAX' || toToken !== 'UVD') {
      throw new DynamicActionValidationError('Invalid token pair. Expected AVAX → UVD');
    }

    if (sourceChain && sourceChain !== 43114) {
      throw new DynamicActionValidationError('Invalid source chain. Expected Avalanche (43114)');
    }

    // Swap path: WAVAX → UVD (cast to the required type)
    const path = [WAVAX_ADDRESS, UVD_ADDRESS] as `0x${string}`[];

    // Transaction deadline (20 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // Convert AVAX amount to Wei
    const avaxAmountWei = parseEther(amount.toString());

    // Get expected output amount using getAmountsOut
    const amountsOut = await publicClient.readContract({
      address: ARENA_ROUTER_ADDRESS as `0x${string}`,
      abi: ARENA_ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [avaxAmountWei, path],
    });

    // Calculate minimum amount out with slippage tolerance
    const expectedUvdAmount = amountsOut[1]; // Second element is the output amount
    const slippageMultiplier = (100 - parseFloat(slippage)) / 100;
    const amountOutMin = (expectedUvdAmount * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);

    // Encode the function call
    const data = encodeFunctionData({
      abi: ARENA_ROUTER_ABI,
      functionName: 'swapExactAVAXForTokens',
      args: [amountOutMin, path, userAddress as `0x${string}`, BigInt(deadline)],
    });

    const transaction = {
      to: ARENA_ROUTER_ADDRESS as `0x${string}`,
      data,
      value: avaxAmountWei.toString(),
      chainId: avalanche.id,
    } as const;

    const response = {
      abi: ARENA_ROUTER_ABI,
      chainId: avalanche.id,
      meta: {
        title: `Swap ${amount || 0.01} AVAX for UVD`,
      },
      rawTransaction: transaction,
      serializedTransaction: JSON.stringify(transaction),
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
