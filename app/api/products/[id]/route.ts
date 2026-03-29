import {
  deleteProductController,
  getProductByIdController,
  updateProductController,
} from "@/controllers/product.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return getProductByIdController(req, id);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  return updateProductController(req, id);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return updateProductController(req, id);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  return deleteProductController(req, id);
}