import { DynamicActionValidationError, ExecutionResponse, Metadata } from '@sherrylinks/sdk';

export interface Campaign {
  creator: `0x${string}`;
  tweetUrl: string;
  totalAmount: bigint;
  criteria: string;
  maxWinners: bigint;
  claimed: bigint;
  active: boolean;
}

export interface CreateCampaignRequest {
  wallet: string;
  tweetUrl: string;
  totalAmount: number;
  criteria: string;
  maxWinners: number;
  code: string;
}

export interface ClaimRequest {
  wallet: string;
  code: string;
  twitterHandle: string;
}

export { DynamicActionValidationError, ExecutionResponse, Metadata };
