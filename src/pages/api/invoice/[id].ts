import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { invoiceSchema } from "@/utils/validation";

const prisma = new PrismaClient();

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        order: true,
      },
    });
    if (!invoice) {
      return errorResponse(res, "Invoice not found", 404);
    }
    return successResponse(res, invoice, "Invoice retrieved successfully");
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    return errorResponse(res, "Error retrieving invoice", 500);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const validatedData = invoiceSchema.partial().parse(req.body);
    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: validatedData,
      include: {
        user: true,
        order: true,
      },
    });
    return successResponse(res, invoice, "Invoice updated successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid data", 400, error.flatten().fieldErrors);
    }
    console.error("Error updating invoice:", error);
    return errorResponse(res, "Error updating invoice", 500);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    await prisma.invoice.delete({
      where: { id: Number(id) },
    });
    return successResponse(res, null, "Invoice deleted successfully");
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return errorResponse(res, "Error deleting invoice", 500);
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