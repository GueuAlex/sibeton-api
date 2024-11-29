import type { NextApiRequest, NextApiResponse } from "next";
import { successResponse, errorResponse } from "../../../utils/apiResponse";
import { categorySchema } from "../../../utils/validation";
import { z } from "zod";
import prisma from "@/prisma/client";
import corsHandler from "@/utils/cors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return errorResponse(res, "Method not allowed", 405);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = await prisma.category.findMany();
    return successResponse(
      res,
      categories,
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse(res, "Error fetching categories");
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = categorySchema.parse(req.body);
    const newCategory = await prisma.category.create({
      data: validatedData,
    });
    return successResponse(
      res,
      newCategory,
      "Category created successfully",
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid input", 400, error.errors);
    }
    console.error("Error creating category:", error);
    return errorResponse(res, "Error creating category");
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, ...updateData } = req.body;
    if (!id) {
      return errorResponse(res, "Category ID is required", 400);
    }
    const validatedData = categorySchema.parse(updateData);
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: validatedData,
    });
    return successResponse(
      res,
      updatedCategory,
      "Category updated successfully"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Invalid input", 400, error.errors);
    }
    console.error("Error updating category:", error);
    return errorResponse(res, "Error updating category");
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      return errorResponse(res, "Category ID is required", 400);
    }
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    return successResponse(res, null, "Category deleted successfully");
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse(res, "Error deleting category");
  }
}

export default function corshandler(req: NextApiRequest, res: NextApiResponse) {
  return corsHandler(req, res, handler);
}
