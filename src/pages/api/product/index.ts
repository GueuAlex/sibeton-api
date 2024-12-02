import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { z } from "zod";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import corsHandler from "../../../utils/cors";
import { successResponse, errorResponse } from "../../../utils/apiResponse";

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
    const form = new formidable.IncomingForm();
    // form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        reject(new Error(`Form parsing error: ${err.message}`));
      }
      resolve({ fields, files });
    });
  });
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Parsing form data...");
    const { fields, files } = await parseForm(req);
    console.log("Form data parsed successfully");

    console.log("Fields received:", fields);
    console.log("Files received:", files);

    const formData = {
      label: fields.label?.[0] ?? "",
      description: fields.description?.[0] ?? "",
      categoryId: fields.categoryId?.[0] ?? "",
    };

    console.log("Validating data...");
    const validatedData = productSchema.parse(formData);
    console.log("Data validated successfully");

    const images = files.images as
      | formidable.File[]
      | formidable.File
      | undefined;

    console.log("Processing images...");
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
    console.log("Images processed successfully");

    console.log("Creating product in database...");
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        categoryId: parseInt(validatedData.categoryId),
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });
    console.log("Product created successfully");

    return successResponse(res, product, "Produit créé avec succès", 201);
  } catch (error) {
    console.error("Error in handlePost:", error);
    if (error instanceof z.ZodError) {
      return errorResponse(
        res,
        "Données invalides",
        400,
        error.flatten().fieldErrors
      );
    }
    return errorResponse(
      res,
      `Erreur lors de la création du produit: ${
        error instanceof Error ? error.message : String(error)
      }`,
      500
    );
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
        variantes: true,
      },
    });
    return successResponse(res, products, "Produits récupérés avec succès");
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return errorResponse(
      res,
      `Erreur lors de la récupération des produits: ${
        error instanceof Error ? error.message : String(error)
      }`,
      500
    );
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return corsHandler(req, res, async () => {
    if (req.method === "POST") {
      await handlePost(req, res);
    } else if (req.method === "GET") {
      await handleGet(req, res);
    } else {
      errorResponse(res, "Méthode non autorisée", 405);
    }
  });
}
