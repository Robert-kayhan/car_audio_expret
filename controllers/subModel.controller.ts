import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { toSlug } from "@/lib/slugify";
import SubModel from "@/models/SubModel";
import CarModel from "@/models/CarModel";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseBoolean(value: string | null, defaultValue?: boolean) {
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
}

export async function createSubModelController(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const modelId = body?.modelId?.trim?.() || body?.modelId;
    const name = body?.name?.trim();
    const description = body?.description?.trim() || "";
    const image = body?.image?.trim() || "";
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!modelId) {
      return errorResponse("Model id is required", 400);
    }

    if (!Types.ObjectId.isValid(modelId)) {
      return errorResponse("Invalid model id", 400);
    }

    if (!name) {
      return errorResponse("Submodel name is required", 400);
    }

    const carModel = await CarModel.findById(modelId);

    if (!carModel) {
      return errorResponse("Car model not found", 404);
    }

    const slug = toSlug(name);

    const existingSubModel = await SubModel.findOne({
      modelId,
      $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
    });

    if (existingSubModel) {
      return errorResponse("Submodel already exists for this model", 409);
    }

    const subModel = await SubModel.create({
      modelId,
      name,
      slug,
      description,
      image,
      isActive,
    });

    const populatedSubModel = await SubModel.findById(subModel._id).populate({
      path: "modelId",
      select: "name slug companyId",
      populate: {
        path: "companyId",
        select: "name slug",
      },
    });

    return successResponse(
      populatedSubModel,
      "Submodel created successfully",
      201
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to create submodel", 500);
  }
}

export async function getSubModelsController(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const modelId = searchParams.get("modelId") || "";
    const isActive = parseBoolean(searchParams.get("isActive"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};

    if (modelId) {
      if (!Types.ObjectId.isValid(modelId)) {
        return errorResponse("Invalid model id", 400);
      }
      query.modelId = modelId;
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

    const [subModels, total] = await Promise.all([
      SubModel.find(query)
        .populate({
          path: "modelId",
          select: "name slug companyId",
          populate: {
            path: "companyId",
            select: "name slug",
          },
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      SubModel.countDocuments(query),
    ]);

    return successResponse(
      {
        result: subModels,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Submodels fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch submodels", 500);
  }
}

export async function getSubModelByIdController(
  _req: Request,
  id: string
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid submodel id", 400);
    }

    const subModel = await SubModel.findById(id).populate({
      path: "modelId",
      select: "name slug companyId",
      populate: {
        path: "companyId",
        select: "name slug",
      },
    });

    if (!subModel) {
      return errorResponse("Submodel not found", 404);
    }

    return successResponse(subModel, "Submodel fetched successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch submodel", 500);
  }
}

export async function updateSubModelController(req: Request, id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid submodel id", 400);
    }

    const existingSubModel = await SubModel.findById(id);

    if (!existingSubModel) {
      return errorResponse("Submodel not found", 404);
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    let nextModelId = existingSubModel.modelId.toString();

    if (body?.modelId) {
      const modelId = body.modelId?.trim?.() || body.modelId;

      if (!Types.ObjectId.isValid(modelId)) {
        return errorResponse("Invalid model id", 400);
      }

      const model = await CarModel.findById(modelId);
      if (!model) {
        return errorResponse("Car model not found", 404);
      }

      updateData.modelId = modelId;
      nextModelId = modelId;
    }

    let nextName = existingSubModel.name;
    let nextSlug = existingSubModel.slug;

    if (typeof body?.name === "string" && body.name.trim()) {
      nextName = body.name.trim();
      nextSlug = toSlug(nextName);

      updateData.name = nextName;
      updateData.slug = nextSlug;
    }

    const duplicate = await SubModel.findOne({
      _id: { $ne: id },
      modelId: nextModelId,
      $or: [{ name: new RegExp(`^${nextName}$`, "i") }, { slug: nextSlug }],
    });

    if (duplicate) {
      return errorResponse(
        "Another submodel with this name already exists for this model",
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

    const updatedSubModel = await SubModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "modelId",
      select: "name slug companyId",
      populate: {
        path: "companyId",
        select: "name slug",
      },
    });

    return successResponse(updatedSubModel, "Submodel updated successfully");
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error?.message || "Failed to update submodel", 500);
  }
}

export async function deleteSubModelController(_req: Request, id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid submodel id", 400);
    }

    const deletedSubModel = await SubModel.findByIdAndDelete(id);

    if (!deletedSubModel) {
      return errorResponse("Submodel not found", 404);
    }

    return successResponse(deletedSubModel, "Submodel deleted successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to delete submodel", 500);
  }
}