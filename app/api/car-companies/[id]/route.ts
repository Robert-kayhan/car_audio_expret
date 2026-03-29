import {
  deleteCarCompanyController,
  getCarCompanyByIdController,
  updateCarCompanyController,
} from "@/controllers/carCompany.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return getCarCompanyByIdController(req, id);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  return updateCarCompanyController(req, id);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return updateCarCompanyController(req, id);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  return deleteCarCompanyController(req, id);
}