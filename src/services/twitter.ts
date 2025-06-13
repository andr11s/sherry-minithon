interface ThreadAnswer {
  userHandle: string;
  address: string;
}

export default async function getThreadAnswers(threadId: string): Promise<ThreadAnswer[]> {
  // TODO: Implementar la lógica real de Twitter
  // Por ahora retornamos datos de prueba
  return [
    {
      userHandle: 'user1',
      address: '0x1234567890123456789012345678901234567890',
    },
    {
      userHandle: 'user2',
      address: '0x0987654321098765432109876543210987654321',
    },
  ];
}
