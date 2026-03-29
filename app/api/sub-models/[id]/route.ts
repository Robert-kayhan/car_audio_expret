import {
  deleteSubModelController,
  getSubModelByIdController,
  updateSubModelController,
} from "@/controllers/subModel.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return getSubModelByIdController(req, id);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  return updateSubModelController(req, id);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return updateSubModelController(req, id);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  return deleteSubModelController(req, id);
}