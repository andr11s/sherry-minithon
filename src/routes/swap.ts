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
    console.log('=== FULL REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('=== END REQUEST BODY ===');
    console.log('Request URL:', req.url);
    console.log('Request query:', JSON.stringify(req.query, null, 2));

    // Log all sherry-related headers
    const sherryHeaders = Object.keys(req.headers).filter((key) => key.startsWith('x-sherry'));
    console.log(
      'Sherry headers found:',
      sherryHeaders.map((key) => `${key}: ${req.headers[key]}`)
    );

    // Try to extract data from x-sherry-target-url header first
    let targetUrl = req.headers['x-sherry-target-url'] as string;
    console.log('Target URL from header:', targetUrl);

    // If header is not present, try to get params from request query as fallback
    if (!targetUrl) {
      console.log('x-sherry-target-url header not found, analyzing request body structure...');

      // Analyze request body structure
      console.log('Request body type:', typeof req.body);
      console.log('Request body keys:', req.body ? Object.keys(req.body) : 'No body');

      // Check different possible structures
      if (req.body) {
        if (req.body.params) {
          console.log('Found params in request body:', JSON.stringify(req.body.params, null, 2));
        }
        if (req.body.context) {
          console.log('Found context in request body:', JSON.stringify(req.body.context, null, 2));
        }
        if (req.body.action) {
          console.log('Found action in request body:', req.body.action);
        }
      }

      console.log('Using fallback approach to extract parameters...');
    }

    let protocol, chainId, kolRouterAddress, userAddress, fromToken, toToken, amount, slippage;

    if (targetUrl) {
      // Parse URL to extract query parameters
      const url = new URL(targetUrl);
      const params = url.searchParams;

      protocol = params.get('protocol');
      chainId = params.get('chainId');
      kolRouterAddress = params.get('kolRouterAddress');
      userAddress = params.get('userAddress');
      fromToken = params.get('fromToken');
      toToken = params.get('toToken');
      amount = params.get('amount');
      slippage = params.get('slippage') || '0.5';
    } else {
      // Fallback: try to get from request body or use defaults
      const bodyParams = req.body?.params || {};
      const queryParams = req.query || {};

      protocol = bodyParams.protocol || queryParams.protocol || 'arena';
      chainId = bodyParams.chainId || queryParams.chainId || '43114';
      kolRouterAddress =
        bodyParams.kolRouterAddress || queryParams.kolRouterAddress || '0x0000000000000000000000000000000000000000';
      userAddress = bodyParams.userAddress || queryParams.userAddress || req.body?.context?.userAddress;
      fromToken = bodyParams.fromToken || queryParams.fromToken || 'AVAX';
      toToken = bodyParams.toToken || queryParams.toToken || 'UVD';
      amount = bodyParams.amount || queryParams.amount || '0.001'; // Default amount for testing
      slippage = bodyParams.slippage || queryParams.slippage || '0.5';
    }

    console.log('Extracted from header URL:', {
      protocol,
      chainId,
      userAddress,
      fromToken,
      toToken,
      amount,
      slippage,
    });

    console.log('Final extracted values:', {
      protocol,
      chainId,
      kolRouterAddress,
      userAddress,
      fromToken,
      toToken,
      amount,
      slippage,
    });

    // Convert string values to appropriate types
    const amountNumber = amount ? parseFloat(amount) : 0;
    const chainIdNumber = chainId ? parseInt(chainId) : 0;

    console.log('Converted values:', { amountNumber, chainIdNumber });

    // Validation with detailed error messages
    if (!amount) {
      throw new DynamicActionValidationError(`No amount parameter found in request. Check request structure.`);
    }

    if (!amountNumber || amountNumber <= 0) {
      throw new DynamicActionValidationError(`Invalid AVAX amount. Received: "${amount}", parsed as: ${amountNumber}`);
    }

    if (!userAddress) {
      throw new DynamicActionValidationError('User address is required');
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new DynamicActionValidationError('Invalid user address format');
    }

    if (fromToken !== 'AVAX' || toToken !== 'UVD') {
      throw new DynamicActionValidationError(`Invalid token pair. Expected AVAX → UVD, got ${fromToken} → ${toToken}`);
    }

    if (chainIdNumber && chainIdNumber !== 43114) {
      throw new DynamicActionValidationError(`Invalid chain ID. Expected Avalanche (43114), got ${chainIdNumber}`);
    }

    // Swap path: WAVAX → UVD (cast to the required type)
    const path = [WAVAX_ADDRESS, UVD_ADDRESS] as `0x${string}`[];

    // Transaction deadline (20 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // Convert AVAX amount to Wei
    const avaxAmountWei = parseEther(amountNumber.toString());

    // Get expected output amount using getAmountsOut
    const amountsOut = await publicClient.readContract({
      address: ARENA_ROUTER_ADDRESS as `0x${string}`,
      abi: ARENA_ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [avaxAmountWei, path],
    });

    // Calculate minimum amount out with slippage tolerance
    const expectedUvdAmount = amountsOut[1]; // Second element is the output amount
    const slippageMultiplier = (100 - parseFloat(slippage as string)) / 100;
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
        title: `Swap ${amountNumber} AVAX for UVD`,
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
