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
  baseUrl: 'https://sherry-minithon.onrender.com/api/swap',
  url: 'https://chat.sherry.social/accounts/byparcero_',
  icon: 'https://sherry-minithon.onrender.com/public/img/social_drop_image_main.jpeg',
  title: 'Swap AVAX for UVD',
  description: 'Swap AVAX tokens for UVD tokens using Arena Router',
  actions: [
    {
      type: 'dynamic',
      label: 'Swap AVAX → UVD',
      path: '/api/swap/swap-avax-uvd',
      chains: {
        source: 43114, // Avalanche C-Chain
      },
      params: [
        {
          name: 'avaxAmount',
          type: 'number',
          label: 'AVAX Amount to Swap',
          required: true,
          min: 0.001,
          description: 'Amount of AVAX to swap for UVD tokens',
        },
        {
          name: 'amountOutMin',
          type: 'uint256',
          label: 'Minimum UVD Amount',
          required: true,
          description: 'Minimum amount of UVD tokens to receive (slippage protection)',
        },
        {
          name: 'to',
          type: 'address',
          label: 'Recipient Address',
          required: true,
          description: 'Address that will receive the UVD tokens',
        },
        {
          name: 'slippage',
          type: 'number',
          label: 'Slippage Tolerance (%)',
          value: 0.5,
          required: false,
          min: 0.1,
          max: 10,
          description: 'Maximum price movement tolerance (recommended: 0.5-2%)',
        },
      ],
    },
  ],
};
