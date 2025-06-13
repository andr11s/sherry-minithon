import { app, PORT } from './config/server';
import { socialDrops } from './metadata/socialDrops';
import airdropRoutes from './routes/airdrop';

// Rutas
app.get('/', (req, res) => {
  console.log('Solicitud recibida en /social-drops-metadata');
  res.json(socialDrops);
});

app.use('/api/airdrop', airdropRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor SocialDrops escuchando en http://localhost:${PORT}`);
});
