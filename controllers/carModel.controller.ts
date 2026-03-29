import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { toSlug } from "@/lib/slugify";
import CarModel from "@/models/CarModel";
import CarCompany from "@/models/CarCompany";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseBoolean(value: string | null, defaultValue?: boolean) {
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
}

export async function createCarModelController(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const companyId = body?.companyId?.trim?.() || body?.companyId;
    const name = body?.name?.trim();
    const description = body?.description?.trim() || "";
    const image = body?.image?.trim() || "";
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!companyId) {
      return errorResponse("Company id is required", 400);
    }

    if (!Types.ObjectId.isValid(companyId)) {
      return errorResponse("Invalid company id", 400);
    }

    if (!name) {
      return errorResponse("Model name is required", 400);
    }

    const company = await CarCompany.findById(companyId);

    if (!company) {
      return errorResponse("Car company not found", 404);
    }

    const slug = toSlug(name);

    const existingModel = await CarModel.findOne({
      companyId,
      $or: [
        { name: new RegExp(`^${name}$`, "i") },
        { slug },
      ],
    });

    if (existingModel) {
      return errorResponse("Car model already exists for this company", 409);
    }

    const model = await CarModel.create({
      companyId,
      name,
      slug,
      description,
      image,
      isActive,
    });

    const populatedModel = await CarModel.findById(model._id).populate(
      "companyId",
      "name slug"
    );

    return successResponse(
      populatedModel,
      "Car model created successfully",
      201
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to create car model", 500);
  }
}

export async function getCarModelsController(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const companyId = searchParams.get("companyId") || "";
    const isActive = parseBoolean(searchParams.get("isActive"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};

    if (companyId) {
      if (!Types.ObjectId.isValid(companyId)) {
        return errorResponse("Invalid company id", 400);
      }
      query.companyId = companyId;
    }

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

    const [models, total] = await Promise.all([
      CarModel.find(query)
        .populate("companyId", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      CarModel.countDocuments(query),
    ]);

    return successResponse(
      {
        result: models,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Car models fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch car models", 500);
  }
}

export async function getCarModelByIdController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid car model id", 400);
    }

    const model = await CarModel.findById(id).populate(
      "companyId",
      "name slug"
    );

    if (!model) {
      return errorResponse("Car model not found", 404);
    }

    return successResponse(model, "Car model fetched successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch car model", 500);
  }
}

export async function updateCarModelController(
  req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid car model id", 400);
    }

    const existingModel = await CarModel.findById(id);

    if (!existingModel) {
      return errorResponse("Car model not found", 404);
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    let nextCompanyId = existingModel.companyId.toString();

    if (body?.companyId) {
      const companyId = body.companyId?.trim?.() || body.companyId;

      if (!Types.ObjectId.isValid(companyId)) {
        return errorResponse("Invalid company id", 400);
      }

      const company = await CarCompany.findById(companyId);
      if (!company) {
        return errorResponse("Car company not found", 404);
      }

      updateData.companyId = companyId;
      nextCompanyId = companyId;
    }

    let nextName = existingModel.name;
    let nextSlug = existingModel.slug;

    if (typeof body?.name === "string" && body.name.trim()) {
      nextName = body.name.trim();
      nextSlug = toSlug(nextName);

      updateData.name = nextName;
      updateData.slug = nextSlug;
    }

    const duplicate = await CarModel.findOne({
      _id: { $ne: id },
      companyId: nextCompanyId,
      $or: [
        { name: new RegExp(`^${nextName}$`, "i") },
        { slug: nextSlug },
      ],
    });

    if (duplicate) {
      return errorResponse(
        "Another car model with this name already exists for this company",
        409
      );
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

    const updatedModel = await CarModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("companyId", "name slug");

    return successResponse(updatedModel, "Car model updated successfully");
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error?.message || "Failed to update car model", 500);
  }
}

export async function deleteCarModelController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid car model id", 400);
    }

    const deletedModel = await CarModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return errorResponse("Car model not found", 404);
    }

    return successResponse(deletedModel, "Car model deleted successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to delete car model", 500);
  }
}