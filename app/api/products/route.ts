import {
  createProductController,
  getProductsController,
} from "@/controllers/product.controller";

export async function GET(req: Request) {
  return getProductsController(req);
}

export async function POST(req: Request) {
  return createProductController(req);
}