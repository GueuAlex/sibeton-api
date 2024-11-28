import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;

  if (req.method !== 'POST') {
    return errorResponse(res, 'Method Not Allowed', 405);
  }

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  try {
    const user = await prisma.iuser.findUnique({ where: { email } });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    return successResponse(res, { token }, 'Authentication successful');
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Internal server error');
  }
}
