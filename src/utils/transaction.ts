export function toRpcHex(value: any) {
  if (typeof value === 'bigint') return '0x' + value.toString(16);
  if (typeof value === 'number') return '0x' + value.toString(16);
  if (typeof value === 'string' && /^\d+$/.test(value)) return '0x' + BigInt(value).toString(16);
  return value;
}

export function sanitizeTxForRpc(tx: any) {
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
