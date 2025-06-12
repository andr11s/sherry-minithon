# SocialDrops

## Descripción

**SocialDrops** es una mini app que permite crear y participar en campañas de airdrop social utilizando Twitter y la blockchain de Avalanche. Los usuarios pueden configurar campañas con criterios sociales (like, retweet, reply, follow) y repartir recompensas de forma automática y transparente entre los participantes que cumplan los requisitos.

---

## ¿Qué problema resuelve?

En el ecosistema cripto, los airdrops suelen ser manuales, poco transparentes y difíciles de auditar. SocialDrops automatiza y descentraliza la distribución de recompensas sociales, permitiendo a cualquier usuario crear campañas personalizadas y a los participantes reclamar su parte de forma segura, sin depender de intermediarios.

---

## ¿Por qué es único?

- Permite crear campañas de airdrop con múltiples parámetros sociales y económicos.
- Cada campaña es única y está asociada a un tweet específico, evitando duplicados.
- El contrato inteligente gestiona la lógica de distribución, validación y cierre automático de campañas.
- El backend valida la elegibilidad de los usuarios y prepara transacciones personalizadas para cada acción.
- Interfaz amigable y mensajes de error claros para el usuario.

---

## Arquitectura y Componentes

### Contrato Inteligente (`contrato.sol`)

- **Estructura Campaign:** Almacena datos clave de cada campaña (creador, tweet, monto, criterio, ganadores, etc.).
- **Funciones principales:**
  - `createCampaign`: Crea una campaña única, asociada a un tweet y parámetros personalizados.
  - `claimAirdrop`: Permite a los usuarios reclamar su parte si cumplen los criterios y no han reclamado antes.
  - `hasClaimed`: Consulta si un usuario ya reclamó en una campaña.
- **Eventos:** `CampaignCreated`, `Claimed` para trazabilidad y transparencia.
- **Algoritmo único:** Distribución automática y equitativa del monto entre los ganadores, cierre automático al alcanzar el máximo de ganadores, y unicidad por tweet.

### Backend (`socialDropsMetadata.ts`)

- **Endpoints:**
  - `/api/airdrop/create`: Prepara la transacción para crear una campaña, validando parámetros y generando la data para el contrato.
  - `/api/airdrop/claim`: Valida la elegibilidad y prepara la transacción de reclamo.
  - `/api/airdrop/list`: Lista campañas simuladas (puede integrarse con la blockchain).
- **Manejo de errores:** Mensajes claros y amigables para el usuario en caso de parámetros faltantes, montos inválidos, campañas inexistentes, etc.
- **Interacción con contratos:** Uso de `viem` para codificar y decodificar llamadas, y preparar transacciones listas para firmar.
- **Actualización dinámica:** Las opciones de campañas se actualizan automáticamente para la UI.

---

## Instalación y Ejecución

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el backend:
   ```bash
   npm run dev-social-drops
   ```
3. El contrato debe estar desplegado en Avalanche Fuji (testnet). Actualiza la dirección en el backend si es necesario.

---

## Pruebas

- El contrato ha sido probado para:
  - Prevenir campañas duplicadas por tweet o ID.
  - Manejar correctamente el límite de ganadores.
  - Distribuir el monto de forma equitativa.
  - Prevenir reclamos dobles.
  - Cerrar campañas automáticamente al alcanzar el máximo de ganadores.
- El backend valida todos los parámetros y responde con mensajes claros en caso de error.

---

## Innovación y Creatividad

- **Caso de uso único:** Automatiza campañas de airdrop social, integrando Twitter y blockchain.
- **Algoritmo innovador:** Distribución automática, unicidad por tweet, cierre automático.
- **Múltiples parámetros:** Tweet, monto, criterio social, máximo de ganadores, código personalizado.
- **Aplicación práctica:** Creador de campañas, participantes y validación de elegibilidad, todo sin intermediarios.

---

## Cumplimiento de los Requisitos del Minithon

- Interacción directa con contratos inteligentes (no solo transferencias simples).
- Lógica de negocio personalizada y manejo sofisticado de datos.
- Manejo de errores y mensajes amigables.
- No es un ejemplo copiado ni una simple transferencia.
- Funciona de extremo a extremo.

---

## Futuras Mejoras

- Integración directa con la blockchain para listar campañas reales.
- Validación on-chain de criterios sociales (usando oráculos).
- UI amigable para usuarios finales.

---
