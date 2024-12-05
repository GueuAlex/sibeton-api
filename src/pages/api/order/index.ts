import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import corsHandler from "@/utils/cors";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { orderSchema } from "@/utils/validation";

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
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        products: true,
      },
    });
    return successResponse(res, orders, "Orders retrieved successfully");
  } catch (error) {
    console.error("Error retrieving orders:", error);
    return errorResponse(res, "Error retrieving orders", 500);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = orderSchema.parse(req.body);
    const order = await prisma.order.create({
      data: {
        status: validatedData.status,
        amount: validatedData.amount,
        userId: validatedData.userId,
        products: {
          connect: validatedData.products.map(id => ({ id })),
        },
      },
      include: {
        user: true,
        products: true,
      },
    });
    return successResponse(res, order, "Order created successfully", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid data", 400, error.flatten().fieldErrors);
    }
    console.error("Error creating order:", error);
    return errorResponse(res, "Error creating order", 500);
  }
}

export default function corshandler(req: NextApiRequest, res: NextApiResponse) {
    return corsHandler(req, res, handler);
  }