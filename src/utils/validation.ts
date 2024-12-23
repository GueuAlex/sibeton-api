import { z } from "zod";

// category schema
export const categorySchema = z.object({
  label: z
    .string()
    .min(1, "Category label is required")
    .max(100, "Category label must be 100 characters or less"),
});

export const orderProductSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// order schema
export const orderSchema = z.object({
  status: z.string().min(1, "Status is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  products: z.array(orderProductSchema),
});

// invoice schema
export const invoiceSchema = z.object({
  status: z.string().min(1, "Status is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  orderId: z.number().int().positive("Order ID must be a positive integer"),
});






export type OrderProductInput = z.infer<typeof orderProductSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
