import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/prisma/client"; // Assurez-vous que le client Prisma est correctement configuré.
import handler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export default async function varianteByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return handler(req, res, async (req, res) => {
    const { id } = req.query;

    if (typeof id !== "string") {
      return errorResponse(res, "Invalid ID format", 400);
    }

    try {
      const varianteId = parseInt(id, 10);

      if (req.method === "GET") {
        // Récupérer une variante par ID
        const variante = await prisma.variante.findUnique({
          where: { id: varianteId },
        });
        if (!variante) {
          return errorResponse(res, "Variante not found", 404);
        }
        return successResponse(res, variante, "Fetched variante");
      }

      if (req.method === "PUT") {
        // Mettre à jour une variante
        const updatedData = req.body;
        const variante = await prisma.variante.update({
          where: { id: varianteId },
          data: updatedData,
        });
        return successResponse(res, variante, "Variante updated successfully");
      }

      if (req.method === "DELETE") {
        // Supprimer une variante
        await prisma.variante.delete({ where: { id: varianteId } });
        return successResponse(res, null, "Variante deleted successfully");
      }

      return errorResponse(res, "Method not allowed", 405);
    } catch (error) {
      return errorResponse(res, "An error occurred", 500, error);
    }
  });
}
