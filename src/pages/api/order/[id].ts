import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { orderSchema } from "@/utils/validation";

const prisma = new PrismaClient();

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        products: true,
      },
    });
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }
    return successResponse(res, order, "Order retrieved successfully");
  } catch (error) {
    console.error("Error retrieving order:", error);
    return errorResponse(res, "Error retrieving order", 500);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const validatedData = orderSchema.partial().parse(req.body);
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        ...validatedData,
        products: validatedData.products
          ? { set: validatedData.products.map(id => ({ id })) }
          : undefined,
      },
      include: {
        user: true,
        products: true,
      },
    });
    return successResponse(res, order, "Order updated successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid data", 400, error.flatten().fieldErrors);
    }
    console.error("Error updating order:", error);
    return errorResponse(res, "Error updating order", 500);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    await prisma.order.delete({
      where: { id: Number(id) },
    });
    return successResponse(res, null, "Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    return errorResponse(res, "Error deleting order", 500);
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