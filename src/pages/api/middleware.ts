// src/pages/api/_middleware.ts

import { bearerTokenMiddleware } from '@/middleware/trueRequest';

// Appliquer le middleware à toutes les routes de l'API
export { bearerTokenMiddleware as default} from '@/middleware/trueRequest';