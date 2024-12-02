import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/prisma/client"; // Assurez-vous que le client Prisma est correctement configuré.
import handler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export default async function varianteHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return handler(req, res, async (req, res) => {
    try {
      if (req.method === "GET") {
        // Récupérer toutes les variantes
        const variantes = await prisma.variante.findMany();
        return successResponse(res, variantes, "Fetched all variantes");
      }

      if (req.method === "POST") {
        // Créer une nouvelle variante
        const {
          unit_price,
          label,
          reference,
          description,
          productId,
          ...rest
        } = req.body;

        if (!unit_price || !productId) {
          return errorResponse(
            res,
            "unit_price and productId are required",
            400
          );
        }

        const variante = await prisma.variante.create({
          data: {
            unit_price,
            label,
            reference,
            description,
            productId,
            ...rest,
          },
        });
        return successResponse(
          res,
          variante,
          "Variante created successfully",
          201
        );
      }

      return errorResponse(res, "Method not allowed", 405);
    } catch (error) {
      return errorResponse(res, "An error occurred", 500, error);
    }
  });
}
