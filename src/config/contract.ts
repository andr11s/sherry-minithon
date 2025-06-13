import { avalancheFuji } from 'viem/chains';
import { createPublicClient, http } from 'viem';

export const CONTRACT_ADDRESS = '0x1F578Ea168348Ac1883561C2218e8DaF95b96924' as `0x${string}`;
export const FUJI_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
export const FUJI_CHAIN_ID = 43113;

export const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'campaignId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'string', name: 'tweetUrl', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'criteria', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'maxWinners', type: 'uint256' },
    ],
    name: 'CampaignCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'campaignId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Claimed',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'string', name: '', type: 'string' }],
    name: 'campaigns',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'string', name: 'tweetUrl', type: 'string' },
      { internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { internalType: 'string', name: 'criteria', type: 'string' },
      { internalType: 'uint256', name: 'maxWinners', type: 'uint256' },
      { internalType: 'uint256', name: 'claimed', type: 'uint256' },
      { internalType: 'bool', name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'campaignId', type: 'string' }],
    name: 'claimAirdrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'campaignId', type: 'string' },
      { internalType: 'string', name: 'tweetUrl', type: 'string' },
      { internalType: 'string', name: 'criteria', type: 'string' },
      { internalType: 'uint256', name: 'maxWinners', type: 'uint256' },
    ],
    name: 'createCampaign',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'campaignId', type: 'string' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(FUJI_RPC_URL),
});
