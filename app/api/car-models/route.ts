import {
  createCarModelController,
  getCarModelsController,
} from "@/controllers/carModel.controller";

export async function GET(req: Request) {
  return getCarModelsController(req);
}

export async function POST(req: Request) {
  return createCarModelController(req);
}