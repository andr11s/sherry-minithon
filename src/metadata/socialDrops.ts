import { Metadata } from '../interfaces/types';

export const socialDrops: Metadata = {
  url: 'https://sherry.social',
  icon: 'https://sherry-minithon.onrender.com/public/img/social_drop_image_main.jpeg',
  title: 'SocialDrops',
  description:
    'Crea tu campaña de airdrop social en Arena: selecciona el tweet, reparte AVAX y elige cómo participarán los usuarios. ¡Haz crecer tu comunidad fácilmente con Arena, usando la red Avalanche!',
  baseUrl: 'https://sherry-minithon.onrender.com',
  actions: [
    {
      type: 'dynamic',
      label: 'Claim de Airdrop',
      description: 'Reclama tu parte del airdrop si cumples los criterios sociales.',
      chains: { source: 43113 },
      path: '/api/airdrop/claim',
      params: [
        {
          name: 'wallet',
          label: 'Tu Wallet',
          type: 'string',
          required: true,
        },
        {
          name: 'code',
          label: 'Código de campaña',
          type: 'text',
          required: true,
        },
        {
          name: 'twitterHandle',
          label: 'Usuario de Sherry Social',
          type: 'string',
          required: true,
        },
      ],
    },
  ],
};
