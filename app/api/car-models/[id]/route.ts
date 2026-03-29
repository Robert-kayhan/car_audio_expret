import {
  deleteCarModelController,
  getCarModelByIdController,
  updateCarModelController,
} from "@/controllers/carModel.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return getCarModelByIdController(req, id);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  return updateCarModelController(req, id);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return updateCarModelController(req, id);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  return deleteCarModelController(req, id);
}