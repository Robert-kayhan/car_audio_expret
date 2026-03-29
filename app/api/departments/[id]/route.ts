import {
  deleteDepartmentController,
  getDepartmentByIdController,
  updateDepartmentController,
} from "@/controllers/department.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return getDepartmentByIdController(req, id);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  return updateDepartmentController(req, id);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return updateDepartmentController(req, id);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  return deleteDepartmentController(req, id);
}