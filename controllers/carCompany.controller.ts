import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { toSlug } from "@/lib/slugify";
import CarCompany from "@/models/CarCompany";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseBoolean(value: string | null, defaultValue?: boolean) {
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
}

export async function createCarCompanyController(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim() || "";
    const logo = body?.logo?.trim() || "";
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!name) {
      return errorResponse("Company name is required", 400);
    }

    const slug = toSlug(name);

    const existingCompany = await CarCompany.findOne({
      $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
    });

    if (existingCompany) {
      return errorResponse("Car company already exists", 409);
    }

    const company = await CarCompany.create({
      name,
      slug,
      description,
      logo,
      isActive,
    });

    return successResponse(company, "Car company created successfully", 201);
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to create car company", 500);
  }
}

export async function getCarCompaniesController(req: Request) {
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

    const [companies, total] = await Promise.all([
      CarCompany.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      CarCompany.countDocuments(query),
    ]);

    return successResponse(
      {
        result: companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Car companies fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch car companies", 500);
  }
}

export async function getCarCompanyByIdController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid company id", 400);
    }

    const company = await CarCompany.findById(id);

    if (!company) {
      return errorResponse("Car company not found", 404);
    }

    return successResponse(company, "Car company fetched successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch car company", 500);
  }
}

export async function updateCarCompanyController(
  req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid company id", 400);
    }

    const existingCompany = await CarCompany.findById(id);

    if (!existingCompany) {
      return errorResponse("Car company not found", 404);
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (typeof body?.name === "string" && body.name.trim()) {
      const name = body.name.trim();
      const slug = toSlug(name);

      const duplicate = await CarCompany.findOne({
        _id: { $ne: id },
        $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
      });

      if (duplicate) {
        return errorResponse("Another car company with this name already exists", 409);
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (typeof body?.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body?.logo === "string") {
      updateData.logo = body.logo.trim();
    }

    if (typeof body?.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const updatedCompany = await CarCompany.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return successResponse(updatedCompany, "Car company updated successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to update car company", 500);
  }
}

export async function deleteCarCompanyController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid company id", 400);
    }

    const deletedCompany = await CarCompany.findByIdAndDelete(id);

    if (!deletedCompany) {
      return errorResponse("Car company not found", 404);
    }

    return successResponse(deletedCompany, "Car company deleted successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to delete car company", 500);
  }
}