import type { NextApiResponse } from 'next';

export const successResponse = (
  res: NextApiResponse,
  data: unknown,
  message = 'Request successful',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: NextApiResponse,
  message = 'An error occurred',
  statusCode = 500,
  errors: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

