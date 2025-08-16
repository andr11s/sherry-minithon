import { Metadata } from '../interfaces/types';

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
    type: 'function' as const,
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function' as const,
  },
] as const;

export const swapAvaxUvd: Metadata = {
  baseUrl: 'https://sherry-minithon.onrender.com/swap-avax-uvd',
  url: 'https://chat.sherry.social/accounts/byparcero_',
  icon: 'https://sherry-minithon.onrender.com/public/img/social_drop_image_main.jpeg',
  title: 'Swap AVAX for UVD',
  description: 'Swap AVAX tokens for UVD tokens using Arena Router',
  actions: [
    {
      type: 'blockchain',
      label: 'Swap AVAX → UVD',
      abi: ARENA_ROUTER_ABI,
      address: '0xf56d524d651b90e4b84dc2fffd83079698b9066e', // Arena Router Address
      functionName: 'swapExactAVAXForTokens',
      chains: {
        source: 43114, // Avalanche C-Chain
      },
      params: [
        {
          name: 'amountOutMin',
          type: 'uint256',
          label: 'Minimum UVD Amount',
          required: true,
          description: 'Minimum amount of UVD tokens to receive (slippage protection)',
        },
        {
          name: 'path',
          type: 'text',
          label: 'Swap Path',
          value: '["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", "0x4Ffe7e01832243e03668E090706F17726c26d6B2"]', // WAVAX → UVD
          fixed: true,
          description: 'Token swap path from WAVAX to UVD',
        },
        {
          name: 'to',
          type: 'address',
          label: 'Recipient Address',
          required: true,
          description: 'Address that will receive the UVD tokens',
        },
        {
          name: 'deadline',
          type: 'uint256',
          label: 'Transaction Deadline',
          value: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
          fixed: true,
          description: 'Unix timestamp deadline for the transaction',
        },
        {
          name: 'avaxAmount',
          type: 'number',
          label: 'AVAX Amount to Swap',
          required: true,
          min: 0.001,
          description: 'Amount of AVAX to swap for UVD tokens',
        },
      ],
      amount: 0, // This will be set dynamically by user input
    },
  ],
};
