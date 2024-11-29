import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { z } from "zod";
import * as formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";

const prisma = new PrismaClient();

const productSchema = z.object({
  label: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable.default();
    form.parse(
      req,
      (err, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        resolve({ fields, files });
      }
    );
  });
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fields, files } = await parseForm(req);
    const label = fields.label as unknown as string;
    const description = fields.description as unknown as string;
    const categoryId = fields.categoryId as unknown as string;
    const cover = files.cover as unknown as formidable.File;
    const images = Array.isArray(files.images)
      ? (files.images as formidable.File[])
      : [files.images as unknown as formidable.File];

    const validatedData = productSchema.parse({
      label,
      description,
      categoryId,
    });

    let coverUrl = null;
    if (cover) {
      const content = await fs.readFile(cover.filepath);
      const { url } = await put(
        path.basename(cover.originalFilename || "cover"),
        content,
        {
          access: "public",
        }
      );
      coverUrl = url;
    }

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const content = await fs.readFile(image.filepath);
        const { url } = await put(
          path.basename(image.originalFilename || "image"),
          content,
          {
            access: "public",
          }
        );
        return url;
      })
    );

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        categoryId: parseInt(validatedData.categoryId),
        cover: coverUrl,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });

    return successResponse(res, product, "Produit créé avec succès", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        res,
        "Données invalides",
        400,
        error.flatten().fieldErrors
      );
    }
    console.error("Erreur lors de la création du produit:", error);
    return errorResponse(res, "Erreur lors de la création du produit", 500);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    });
    return successResponse(res, products, "Produits récupérés avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return errorResponse(
      res,
      "Erreur lors de la récupération des produits",
      500
    );
  }
}

// Replace the anonymous default export with a named function
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return corsHandler(req, res, () => handlePost(req, res));
  } else if (req.method === "GET") {
    return corsHandler(req, res, () => handleGet(req, res));
  } else {
    return errorResponse(res, "Méthode non autorisée", 405);
  }
}
