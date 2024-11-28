// src/middleware/bearerToken.ts

import { NextApiRequest, NextApiResponse } from 'next';

// Fonction pour valider le token
const validateBearerToken = (req: NextApiRequest): boolean => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return false;
  }

  const token = authHeader.split(' ')[1]; // 'Bearer <token>'
  
  // Validation basique du token (tu peux ajouter des vérifications supplémentaires ici)
  if (!token || token !== process.env.BEARER_TOKEN) {
    return false;
  }

  return true;
};

export const bearerTokenMiddleware = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!validateBearerToken(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return handler(req, res);
  };
};
