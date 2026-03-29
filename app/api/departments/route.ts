import {
  createDepartmentController,
  getDepartmentsController,
} from "@/controllers/department.controller";

export async function GET(req: Request) {
  return getDepartmentsController(req);
}

export async function POST(req: Request) {
  return createDepartmentController(req);
}