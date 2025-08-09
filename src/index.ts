import { app, PORT } from './config/server';
import { socialDrops } from './metadata/socialDrops';
import airdropRoutes from './routes/airdrop';

// Rutas
app.get('/', (req, res) => {
  console.log('Solicitud recibida en /social-drops-metadata');

  // Headers de cache de 24 horas
  const oneDayInSeconds = 24 * 60 * 60; // 24 horas en segundos

  res.set({
    'Cache-Control': `public, max-age=${oneDayInSeconds}`,
    Expires: new Date(Date.now() + oneDayInSeconds * 1000).toUTCString(),
  });

  res.json(socialDrops);
});

app.use('/api/airdrop', airdropRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor SocialDrops escuchando en http://localhost:${PORT}`);
});
