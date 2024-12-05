import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { invoiceSchema } from "@/utils/validation";

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
     /*  case "PUT":
        return handlePut(req, res);
      case "DELETE":
        return handleDelete(req, res); */
      default:
        return errorResponse(res, "Method not allowed", 405);
    }
  }

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        user: true,
        order: true,
      },
    });
    return successResponse(res, invoices, "Invoices retrieved successfully");
  } catch (error) {
    console.error("Error retrieving invoices:", error);
    return errorResponse(res, "Error retrieving invoices", 500);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = invoiceSchema.parse(req.body);
    const invoice = await prisma.invoice.create({
      data: validatedData,
      include: {
        user: true,
        order: true,
      },
    });
    return successResponse(res, invoice, "Invoice created successfully", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid data", 400, error.flatten().fieldErrors);
    }
    console.error("Error creating invoice:", error);
    return errorResponse(res, "Error creating invoice", 500);
  }
}

/* export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        return handleGet(req, res);
      } else if (req.method === "POST") {
        return handlePost(req, res);
      } else {
        return errorResponse(res, "Method not allowed", 405);
      }
  } */
      export default function corshandler(req: NextApiRequest, res: NextApiResponse) {
        return corsHandler(req, res, handler);
      }