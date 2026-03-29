import {
  createSubModelController,
  getSubModelsController,
} from "@/controllers/subModel.controller";

export async function GET(req: Request) {
  return getSubModelsController(req);
}

export async function POST(req: Request) {
  return createSubModelController(req);
}