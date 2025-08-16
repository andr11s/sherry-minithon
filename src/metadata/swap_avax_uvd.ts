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
      label: 'Confirm Swap AVAX → UVD',
      description: 'Obtain your favorite Token on Arena DEX',
      path: '/api/swap/swap-avax-uvd',
      chains: {
        source: 43114, // Avalanche C-Chain
      },
      params: [
        {
          name: 'protocol',
          type: 'text',
          label: 'Protocol',
          value: 'arena',
          required: true,
          minLength: 1,
          maxLength: 100,
          description: 'DEX protocol to use for the swap',
        },
        {
          name: 'chainId',
          type: 'number',
          label: 'Chain ID',
          value: 43114,
          required: true,
          description: 'Blockchain chain ID for the swap (Avalanche)',
        },
        {
          name: 'userAddress',
          type: 'text',
          label: 'User Address',
          value: 'sender',
          required: true,
          minLength: 1,
          maxLength: 100,
          description: 'User wallet address',
        },
        {
          name: 'fromToken',
          type: 'text',
          label: 'From Token',
          value: 'AVAX',
          required: true,
          minLength: 1,
          maxLength: 100,
          description: 'Token to send (AVAX)',
        },
        {
          name: 'toToken',
          type: 'text',
          label: 'To Token',
          value: 'UVD',
          required: true,
          minLength: 1,
          maxLength: 20,
          description: 'Token to receive (UVD)',
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Enter Amount to Swap',
          required: true,
          min: 0.000001,
          description: 'Enter the amount of AVAX you want to swap',
        },
        {
          name: 'slippage',
          type: 'text',
          label: 'Slippage Tolerance (%)',
          value: '0.5',
          required: false,
          minLength: 1,
          maxLength: 100,
          description: 'Maximum price movement tolerance (recommended: 0.5-2%)',
        },
      ],
    },
  ],
};
