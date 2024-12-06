import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

/* const productSchema = z.object({
  label: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(0),
}); */

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        category: true,
        variantes: true,
      },
    });

    if (!product) {
      return errorResponse(res, "Produit non trouvé", 404);
    }

    return successResponse(res, product, "Produit récupéré avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return errorResponse(res, "Erreur lors de la récupération du produit", 500);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const { fields, files } = await parseForm(req);

    const formData = {
      label: fields.label?.[0] ?? "",
      description: fields.description?.[0] ?? "",
      categoryId: fields.categoryId?.[0] ?? "",
      unit_price: +(fields.unit_price?.[0] ?? 0),
    };
    ;

    //const validatedData = {label : formData.label, description : formData.description, categoryId : formData.categoryId};

    /*  const cover = files.cover as
      | formidable.File
      | formidable.File[]
      | undefined; */
    const images = files.images as
      | formidable.File[]
      | formidable.File
      | undefined;

    /*  let coverUrl = null;
    if (cover && !Array.isArray(cover) && cover.filepath) {
      const content = await fs.readFile(cover.filepath);
      const { url } = await put(
        path.basename(cover.originalFilename || "cover"),
        content,
        {
          access: "public",
        }
      );
      coverUrl = url;
    } */

    const imageUrls = await Promise.all(
      (Array.isArray(images) ? images : images ? [images] : [])
        .filter(
          (image): image is formidable.File => !!image && "filepath" in image
        )
        .map(async (image) => {
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

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        // cover: coverUrl || undefined,
        images: {
          deleteMany: {},
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return successResponse(
      res,
      updatedProduct,
      "Produit mis à jour avec succès"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        res,
        "Données invalides",
        400,
        error.flatten().fieldErrors
      );
    }
    console.error("Erreur lors de la mise à jour du produit:", error);
    return errorResponse(res, "Erreur lors de la mise à jour du produit" + error, 500);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return errorResponse(res, "ID de produit invalide", 400);
  }

  try {
    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });

    if (!product) {
      return errorResponse(res, "Produit non trouvé", 404);
    }

    // Supprimer les images associées au produit
    await Promise.all(
      product.images.map(async (image) => {
        // Ici, vous devriez implémenter la logique pour supprimer l'image du stockage Vercel Blob
        // Comme l'API Vercel Blob n'a pas de méthode de suppression directe, vous devrez gérer cela différemment
        // Par exemple, vous pourriez garder une liste des images non utilisées pour les nettoyer périodiquement
        console.log(`Image à supprimer : ${image.url}`);
      })
    );

    // Supprimer le produit et ses relations
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return successResponse(res, null, "Produit supprimé avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return errorResponse(
      res,
      `Erreur lors de la suppression du produit: ${
        error instanceof Error ? error.message : String(error)
      }`,
      500
    );
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsHandler(req, res, async () => {
    switch (req.method) {
      case "GET":
        await handleGet(req, res);
        break;
      case "PUT":
        await handlePut(req, res);
        break;
      case "DELETE":
        await handleDelete(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
