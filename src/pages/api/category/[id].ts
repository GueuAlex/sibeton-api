import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { errorResponse, successResponse } from "@/utils/apiResponse";

const prisma = new PrismaClient();

const categorySchema = z.object({
  label: z.string().min(1).max(100),
});

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { products: true },
    });
    console.log(category);

    if (!category) {
      return errorResponse(res, "Produit non trouvé", 404);
    }

    return successResponse(res, category, "Produit récupéré avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return errorResponse(res, "Erreur lors de la récupération du produit", 500);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const validatedData = categorySchema.parse(req.body);

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: validatedData,
    });

    return successResponse(
        res,
        updatedCategory,
        "categorise mise à jour avec succès"
      );
  } catch (error) {
    if (error instanceof z.ZodError) {
     // return res.status(400).json({ error: "Données invalides", details: error.errors });
      return errorResponse(
        res,
        "Données invalides",
        400,
        error.flatten().fieldErrors
      );
    }
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
   // res.status(500).json({ error: "Erreur lors de la mise à jour de la catégorie" });
    return errorResponse(res, "Erreur lors de la mise à jour de la catégorie", 500);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return errorResponse(res, "ID de produit invalide", 400);
  }

  try {
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    
    return successResponse(res, null, "category supprimé avec succès",204);
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    //res.status(500).json({ error: "Erreur lors de la suppression de la catégorie" });

    return errorResponse(
        res,
        `Erreur lors de la suppression de la category: ${
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

