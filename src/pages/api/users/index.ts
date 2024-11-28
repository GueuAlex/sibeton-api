import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma/client';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier si la méthode de la requête est POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
  }

  const { email, password, role, phone, firstName, lastName } = req.body;

  console.log(req.body)

  // Validation des données entrantes
  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and role are required'
    });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.iuser.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Hacher le mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = await prisma.iuser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      },
    });

    // Vérification si l'utilisateur a été correctement créé
    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Répondre avec succès
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId: newUser.id }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

