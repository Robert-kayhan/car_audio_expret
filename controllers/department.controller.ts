import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { toSlug } from "@/lib/slugify";
import Department from "@/models/Department";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseBoolean(value: string | null, defaultValue?: boolean) {
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
}

export async function createDepartmentController(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim() || "";
    const image = body?.image?.trim() || "";
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!name) {
      return errorResponse("Department name is required", 400);
    }

    const slug = toSlug(name);

    const existingDepartment = await Department.findOne({
      $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
    });

    if (existingDepartment) {
      return errorResponse("Department already exists", 409);
    }

    const department = await Department.create({
      name,
      slug,
      description,
      isActive,
    });

    return successResponse(
      department,
      "Department created successfully",
      201
    );
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to create department",
      500
    );
  }
}

export async function getDepartmentsController(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const isActive = parseBoolean(searchParams.get("isActive"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Department.countDocuments(query),
    ]);

    return successResponse(
      {
        result: departments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Departments fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to fetch departments",
      500
    );
  }
}

export async function getDepartmentByIdController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid department id", 400);
    }

    const department = await Department.findById(id);

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    return successResponse(
      department,
      "Department fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to fetch department",
      500
    );
  }
}

export async function updateDepartmentController(
  req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid department id", 400);
    }

    const existingDepartment = await Department.findById(id);

    if (!existingDepartment) {
      return errorResponse("Department not found", 404);
    }

    const body = await req.json();

    const updateData: Record<string, any> = {};

    if (typeof body?.name === "string" && body.name.trim()) {
      const name = body.name.trim();
      const slug = toSlug(name);

      const duplicate = await Department.findOne({
        _id: { $ne: id },
        $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
      });

      if (duplicate) {
        return errorResponse(
          "Another department with this name already exists",
          409
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (typeof body?.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body?.image === "string") {
      updateData.image = body.image.trim();
    }

    if (typeof body?.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return successResponse(
      updatedDepartment,
      "Department updated successfully"
    );
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to update department",
      500
    );
  }
}

export async function deleteDepartmentController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid department id", 400);
    }

    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return errorResponse("Department not found", 404);
    }

    return successResponse(
      deletedDepartment,
      "Department deleted successfully"
    );
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to delete department",
      500
    );
  }
}