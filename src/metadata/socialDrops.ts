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
      chains: { source: 'avalanche' },
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
    {
      type: 'dynamic',
      label: 'Crear Campaña de Airdrop',
      description: 'Configura una campaña de airdrop social: define el tweet, monto y criterios.',
      chains: { source: 'fuji' },
      path: '/api/airdrop/create',
      params: [
        {
          name: 'wallet',
          label: 'Tu Wallet',
          type: 'string',
          required: true,
        },
        {
          name: 'tweetUrl',
          label: 'URL del Post de Sherry Social',
          type: 'string',
          required: true,
        },
        {
          name: 'totalAmount',
          label: 'Monto Total a Repartir (AVAX)',
          type: 'number',
          required: true,
        },
        {
          name: 'criteria',
          label: 'Criterio de Participación',
          type: 'select',
          required: true,
          options: [
            // { label: 'Like', value: 'like' },
            // { label: 'Retweet', value: 'retweet' },
            // { label: 'Reply', value: 'reply' },
            // { label: 'Follow', value: 'follow' },
            { label: 'Comentario', value: 'comment' },
          ],
        },
        {
          name: 'maxWinners',
          label: 'Máximo de Ganadores',
          type: 'number',
          required: true,
        },
        {
          name: 'code',
          label: 'Crea el código de tu campaña de airdrop para que los usuarios lo utilicen',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
