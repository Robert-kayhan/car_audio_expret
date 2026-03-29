import {
  createCarCompanyController,
  getCarCompaniesController,
} from "@/controllers/carCompany.controller";

export async function GET(req: Request) {
  return getCarCompaniesController(req);
}

export async function POST(req: Request) {
  return createCarCompanyController(req);
}